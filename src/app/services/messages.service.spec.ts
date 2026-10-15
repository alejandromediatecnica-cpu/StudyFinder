import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MessagesService } from './messages.service';

const API = 'http://localhost:8000';

describe('MessagesService', () => {
  let service: MessagesService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.setItem('studyfinder_token', 'token-abc');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MessagesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('contrato de conexion', () => {
    it('apunta a la URL literal del backend, sin proxy ni environment', () => {
      service.getMe().subscribe();
      const req = http.expectOne(`${API}/users/me`);
      expect(req.request.urlWithParams).toBe(`${API}/users/me`);
      req.flush({});
    });

    it('adjunta el token como cabecera Bearer', () => {
      service.contacts().subscribe();
      const req = http.expectOne(`${API}/contacts/`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer token-abc');
      req.flush([]);
    });

    it('omite la cabecera cuando no hay sesion', () => {
      localStorage.clear();
      service.getMe().subscribe();
      const req = http.expectOne(`${API}/users/me`);
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });
  });

  describe('perfil y busqueda', () => {
    it('getMe pide el perfil del usuario', () => {
      service.getMe().subscribe();
      const req = http.expectOne(`${API}/users/me`);
      expect(req.request.method).toBe('GET');
      req.flush({ id: 'u-1', name: 'Ana', email: 'ana@correo.com' });
    });

    it('search envia el nombre como parametro', () => {
      service.search('Bruno').subscribe();
      const req = http.expectOne(r => r.url === `${API}/users/search`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('nombre')).toBe('Bruno');
      req.flush([{ id: 'u-2', name: 'Bruno', email: 'bruno@correo.com' }]);
    });
  });

  describe('contactos', () => {
    it('sendRequest envia el id del usuario por POST', () => {
      service.sendRequest('u-2').subscribe();
      const req = http.expectOne(`${API}/contacts/requests`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ usuario_id: 'u-2' });
      req.flush({ ok: true });
    });

    it('incoming y outgoing usan sus rutas', () => {
      service.incoming().subscribe();
      http.expectOne(`${API}/contacts/requests/incoming`).flush([]);
      service.outgoing().subscribe();
      http.expectOne(`${API}/contacts/requests/outgoing`).flush([]);
    });

    it('accept y reject hacen POST a la solicitud', () => {
      service.accept('c-1').subscribe();
      const aceptar = http.expectOne(`${API}/contacts/requests/c-1/accept`);
      expect(aceptar.request.method).toBe('POST');
      aceptar.flush(null, { status: 204, statusText: 'No Content' });

      service.reject('c-2').subscribe();
      const rechazar = http.expectOne(`${API}/contacts/requests/c-2/reject`);
      expect(rechazar.request.method).toBe('POST');
      rechazar.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('contacts lista los contactos aceptados', () => {
      let resultado: unknown;
      service.contacts().subscribe(value => (resultado = value));
      const req = http.expectOne(`${API}/contacts/`);
      expect(req.request.method).toBe('GET');
      req.flush([{ contact_id: 'c-1', otro: { id: 'u-2', name: 'Bruno' } }]);
      expect(resultado).toEqual([{ contact_id: 'c-1', otro: { id: 'u-2', name: 'Bruno' } }]);
    });
  });

  describe('mensajes', () => {
    it('messages pide el historial del otro usuario', () => {
      service.messages('u-2').subscribe();
      const req = http.expectOne(`${API}/messages/u-2`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('send envia texto como FormData', () => {
      service.send('u-2', 'hola', undefined).subscribe();
      const req = http.expectOne(`${API}/messages/u-2`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeInstanceOf(FormData);
      expect((req.request.body as FormData).get('texto')).toBe('hola');
      req.flush({ id: 'm-1', texto: 'hola' });
    });

    it('send adjunta el archivo cuando se indica', () => {
      const archivo = new File(['contenido'], 'nota.pdf', { type: 'application/pdf' });
      service.send('u-2', '', archivo).subscribe();
      const req = http.expectOne(`${API}/messages/u-2`);
      const enviado = (req.request.body as FormData).get('archivo') as File;
      expect(enviado.name).toBe('nota.pdf');
      req.flush({ id: 'm-1', nombre_archivo: 'nota.pdf' });
    });

    it('attachmentUrl compone la URL de descarga', () => {
      expect(service.attachmentUrl('u-2/abc.pdf')).toBe(`${API}/messages/files/u-2/abc.pdf`);
    });
  });
});
