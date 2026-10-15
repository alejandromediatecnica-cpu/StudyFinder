import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { SignupComponent } from './signup';
import { routes } from '../../../app.routes';
import { environment } from '../../../../environments/environment';

const API = `${environment.apiUrl}/auth`;

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let http: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  function rellenar(password = 'secreto123'): void {
    component.name = 'Ada Lovelace';
    component.email = 'ada@correo.com';
    component.password = password;
    component.submit();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('envia nombre, correo y contrasena al backend', () => {
    rellenar();
    const req = http.expectOne(`${API}/signup`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@correo.com',
      password: 'secreto123',
    });
    req.flush({});
  });

  it('navega a /main cuando la cuenta se crea', () => {
    const navegar = vi.spyOn(router, 'navigate');
    rellenar();
    http.expectOne(`${API}/signup`).flush({
      token: 't',
      user: { id: '1', name: 'Ada Lovelace', email: 'ada@correo.com' },
    });

    expect(navegar).toHaveBeenCalledWith(['/main']);
    expect(component.success()).toBe(true);
    expect(component.loading()).toBe(false);
  });

  it('muestra el detalle de error del backend', () => {
    rellenar('corta');
    http.expectOne(`${API}/signup`).flush(
      { detail: 'La contrasena debe tener al menos 8 caracteres' },
      { status: 422, statusText: 'Unprocessable Entity' },
    );

    expect(component.error()).toBe('La contrasena debe tener al menos 8 caracteres');
    expect(component.success()).toBe(false);
  });

  it('usa un texto generico si el backend no envia detalle', () => {
    rellenar();
    http.expectOne(`${API}/signup`).flush({}, { status: 500, statusText: 'Server Error' });
    expect(component.error()).toBe('No se pudo crear la cuenta.');
  });

  it('no menciona MongoDB cuando la peticion expira', async () => {
    vi.useFakeTimers();
    try {
      component.name = 'Ada Lovelace';
      component.email = 'ada@correo.com';
      component.password = 'secreto123';
      component.submit();
      await vi.advanceTimersByTimeAsync(10_001);
      expect(component.error()).toMatch(/backend/i);
      expect(component.error()).not.toMatch(/mongo/i);
    } finally {
      vi.useRealTimers();
      http.match(() => true);
    }
  });

it('limpia el error anterior al reintentar', () => {
    component.error.set('error viejo');
    rellenar();
    expect(component.error()).toBe('');
    http.expectOne(`${API}/signup`).flush({});
  });

  describe('mostrar el error en la plantilla', () => {
    it('pinta el detalle del backend en el aviso', async () => {
      component.name = 'Ada Lovelace';
      component.email = 'ada@correo.com';
      component.password = 'invalida';
      component.submit();
      http.expectOne(`${API}/signup`).flush(
        { detail: 'La contrasena debe tener al menos 8 caracteres' },
        { status: 422, statusText: 'Unprocessable Entity' },
      );
      await fixture.whenStable();
      fixture.detectChanges();
      const caja = fixture.nativeElement.querySelector('.form-error') as HTMLElement;
      expect(caja).toBeTruthy();
      expect(caja.textContent).toContain('La contrasena debe tener al menos 8 caracteres');
    });
  });
});

