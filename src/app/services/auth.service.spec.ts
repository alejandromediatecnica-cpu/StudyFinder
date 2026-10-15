import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

const API = `${environment.apiUrl}/auth`;

const RESPUESTA = {
  token: 'token-abc',
  user: { id: '1', name: 'Ada', email: 'ada@correo.com' },
};

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('login', () => {
    // El servicio envia el correo tal cual; el backend (auth.py) es quien lo pasa
    // a minusculas antes de buscarlo.
    it('envia las credenciales sin transformar', () => {
      service.login('ADA@correo.com', 'secreto').subscribe();
      const req = http.expectOne(`${API}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'ADA@correo.com', password: 'secreto' });
      req.flush(RESPUESTA);
    });

    it('guarda el token y el usuario en localStorage al responder', () => {
      service.login('ada@correo.com', 'secreto').subscribe();
      http.expectOne(`${API}/login`).flush(RESPUESTA);

      expect(localStorage.getItem('studyfinder_token')).toBe('token-abc');
      expect(JSON.parse(localStorage.getItem('studyfinder_user')!)).toEqual(RESPUESTA.user);
    });

    it('propaga el error sin guardar sesion', () => {
      let error: unknown;
      service.login('ada@correo.com', 'mala').subscribe({ error: e => (error = e) });
      http.expectOne(`${API}/login`).flush({ detail: 'Correo o contrasena incorrectos' }, { status: 401, statusText: 'Unauthorized' });

      expect(error).toBeTruthy();
      expect(localStorage.getItem('studyfinder_token')).toBeNull();
    });
  });

  describe('signup', () => {
    it('envia nombre, correo y contrasena', () => {
      service.signup('Ada', 'ada@correo.com', 'secreto').subscribe();
      const req = http.expectOne(`${API}/signup`);
      expect(req.request.body).toEqual({ name: 'Ada', email: 'ada@correo.com', password: 'secreto' });
      req.flush(RESPUESTA);
    });

    it('guarda la sesion devuelta', () => {
      service.signup('Ada', 'ada@correo.com', 'secreto').subscribe();
      http.expectOne(`${API}/signup`).flush(RESPUESTA);
      expect(service.getToken()).toBe('token-abc');
      expect(service.getUser()?.name).toBe('Ada');
    });
  });

  describe('estado de sesion', () => {
    it('no considera iniciada la sesion sin token', () => {
      expect(service.isLoggedIn()).toBe(false);
      expect(service.getToken()).toBeNull();
      expect(service.getUser()).toBeNull();
    });

    it('considera iniciada la sesion con token guardado', () => {
      localStorage.setItem('studyfinder_token', 'token-abc');
      expect(service.isLoggedIn()).toBe(true);
    });

    it('devuelve null si el usuario guardado no es JSON valido', () => {
      localStorage.setItem('studyfinder_user', 'no-es-json');
      expect(service.getUser()).toBeNull();
    });
  });

  describe('logout', () => {
    it('limpia localStorage y revoca el token en el backend', () => {
      localStorage.setItem('studyfinder_token', 'token-abc');
      localStorage.setItem('studyfinder_user', JSON.stringify(RESPUESTA.user));

      service.logout();

      expect(localStorage.getItem('studyfinder_token')).toBeNull();
      expect(localStorage.getItem('studyfinder_user')).toBeNull();

      const req = http.expectOne(`${API}/logout`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe('Bearer token-abc');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('no intenta revocar nada cuando no habia token', () => {
      service.logout();
      http.expectNone(`${API}/logout`);
    });

    it('limpia la sesion aunque el backend responda con error', () => {
      localStorage.setItem('studyfinder_token', 'token-abc');
      service.logout();
      http.expectOne(`${API}/logout`).flush({ detail: 'error' }, { status: 500, statusText: 'Server Error' });
      expect(service.isLoggedIn()).toBe(false);
    });
  });
});
