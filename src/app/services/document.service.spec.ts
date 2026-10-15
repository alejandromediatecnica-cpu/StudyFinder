import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DocumentService } from './document.service';

const API = 'http://localhost:8000/documents';

const DOCUMENTO = {
  id: 'doc-1',
  filename: 'notas.pdf',
  contentType: 'application/pdf',
  size: 2048,
  createdAt: '2026-09-29T10:00:00.000Z',
};

describe('DocumentService', () => {
  let service: DocumentService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.setItem('studyfinder_token', 'token-abc');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DocumentService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('contrato de conexion', () => {
    it('apunta a la URL literal del backend, sin proxy ni environment', () => {
      service.list().subscribe();
      const req = http.expectOne(r => r.urlWithParams.startsWith(`${API}`));
      expect(req.request.urlWithParams).toBe(`${API}`);
      req.flush([]);
    });

    it('adjunta el token como cabecera Bearer', () => {
      service.list().subscribe();
      const req = http.expectOne(r => r.urlWithParams.startsWith(`${API}`));
      expect(req.request.headers.get('Authorization')).toBe('Bearer token-abc');
      req.flush([]);
    });

    it('omite la cabecera cuando no hay sesion', () => {
      localStorage.clear();
      service.list().subscribe();
      const req = http.expectOne(r => r.urlWithParams.startsWith(`${API}`));
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush([]);
    });
  });

  describe('list', () => {
    it('devuelve todos los documentos sin filtro', () => {
      let resultado: unknown;
      service.list().subscribe(value => (resultado = value));
      const req = http.expectOne(r => r.urlWithParams.startsWith(`${API}`));
      expect(req.request.params.keys()).toEqual([]);
      req.flush([DOCUMENTO]);
      expect(resultado).toEqual([DOCUMENTO]);
    });

    it('filtra por materia cuando se indica', () => {
      service.list('Fisica').subscribe();
      const req = http.expectOne(r => r.urlWithParams.startsWith(`${API}`));
      expect(req.request.params.get('materia')).toBe('Fisica');
      req.flush([]);
    });
  });

  describe('upload', () => {
    it('envia el archivo como FormData con el nombre original', () => {
      const archivo = new File(['contenido'], 'notas.pdf', { type: 'application/pdf' });
      service.upload(archivo).subscribe();
      const req = http.expectOne(`${API}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeInstanceOf(FormData);
      const enviado = (req.request.body as FormData).get('file') as File;
      expect(enviado.name).toBe('notas.pdf');
      req.flush(DOCUMENTO);
    });
  });

  describe('listPublic', () => {
    it('pide los documentos de otros usuarios a /public', () => {
      let resultado: unknown;
      service.listPublic().subscribe(value => (resultado = value));
      const req = http.expectOne(`${API}/public`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer token-abc');
      req.flush([{ ...DOCUMENTO, ownerName: 'Bruno', ownerEmail: 'bruno@correo.com' }]);
      expect(resultado).toEqual([{ ...DOCUMENTO, ownerName: 'Bruno', ownerEmail: 'bruno@correo.com' }]);
    });
  });

  describe('download', () => {
    it('pide la descarga en un blob', () => {
      service.download('doc 1').subscribe();
      const req = http.expectOne(`${API}/doc%201/download`);
      expect(req.request.responseType).toBe('blob');
      req.flush(new Blob(['pdf']));
    });
  });

  describe('asignacion a materia', () => {
    it('annade el documento a una materia por POST', () => {
      service.addToMateria('doc-1', 'Fisica').subscribe();
      const req = http.expectOne(`${API}/doc-1/materias`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ materia: 'Fisica' });
      req.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('quita el documento de una materia por DELETE con query', () => {
      service.removeFromMateria('doc-1', 'Fisica').subscribe();
      const req = http.expectOne(r => r.urlWithParams.startsWith(`${API}/doc-1/materias`));
      expect(req.request.method).toBe('DELETE');
      expect(req.request.params.get('materia')).toBe('Fisica');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });

  describe('remove', () => {
    it('elimina el documento por DELETE', () => {
      service.delete('doc-1').subscribe();
      const req = http.expectOne(`${API}/doc-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });
});
