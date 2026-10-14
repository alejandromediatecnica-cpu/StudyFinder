import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SearchService } from './search.service';

const API = 'http://localhost:8000';

describe('SearchService', () => {
  let service: SearchService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SearchService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('consulta /search en la raiz del backend', () => {
    service.searchDocuments('machine learning').subscribe();
    const req = http.expectOne(r => r.urlWithParams.startsWith(`${API}/search`));
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  // SearchService construye la query concatenando en la URL en vez de usar
  // HttpParams, a diferencia del resto de servicios. El termino llega
  // codificado en urlWithParams y request.params queda vacio.
  it('codifica el termino de busqueda dentro de la URL', () => {
    service.searchDocuments('redes neuronales &cafe').subscribe();
    const req = http.expectOne(r => r.urlWithParams.startsWith(`${API}/search`));
    expect(req.request.urlWithParams).toBe(`${API}/search?q=redes%20neuronales%20%26cafe`);
    req.flush([]);
  });

  it('propaga los resultados tal cual', () => {
    const esperados = [{ title: 'Un paper', authors: ['Ada'], year: 2026, url: 'https://x.org' }];
    let resultado: unknown;
    service.searchDocuments('paper').subscribe(value => (resultado = value));
    http.expectOne(r => r.urlWithParams.startsWith(`${API}/search`)).flush(esperados);
    expect(resultado).toEqual(esperados);
  });

  it('no exige token: la busqueda es publica', () => {
    service.searchDocuments('paper').subscribe();
    const req = http.expectOne(r => r.urlWithParams.startsWith(`${API}/search`));
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });
});
