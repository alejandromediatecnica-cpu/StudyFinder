import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutComponent } from './layout';
import { routes } from '../../../app.routes';
import { environment } from '../../../../environments/environment';

const API = environment.apiUrl;

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

function escribir(texto: string): void {
    component.searchQuery = texto;
    component.onSearchInput(texto);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('oculta el menu cuando el input se vacia', () => {
    escribir('calculo');
    expect(component.showResults()).toBe(true);

    escribir('');
    expect(component.showResults()).toBe(false);
    expect(component.searchResults()).toEqual([]);
    expect(component.error()).toBeNull();
  });

  it('no muestra el menu antes de escribir', () => {
    expect(component.showResults()).toBe(false);
  });

it('al escribir dispara una sola busqueda tras el debounce', async () => {
    vi.useFakeTimers();
    try {
      component.searchQuery = 'calculo';
      component.onSearchInput('calculo');
      await vi.advanceTimersByTimeAsync(300);
    } finally {
      vi.useRealTimers();
    }
    const req = http.expectOne(`${API}/search?q=calculo`);
    req.flush([{ title: 'Calculo I', url: 'https://x.com/c1' }]);
    fixture.detectChanges();

    expect(component.searching()).toBe(false);
    expect(component.searchResults().length).toBe(1);
    expect(component.searchResults()[0].title).toBe('Calculo I');
  });

  it('la barra de busqueda ya no tiene boton: la busqueda es solo al escribir', async () => {
    const boton = fixture.nativeElement.querySelector('.search-button');
    expect(boton).toBeNull();
    expect(fixture.nativeElement.querySelector('input[type="text"]')).not.toBeNull();
  });

  it('muestra "No encontramos resultados." cuando el backend responde vacio', async () => {
    vi.useFakeTimers();
    try {
      escribir('nada');
      await vi.advanceTimersByTimeAsync(300);
    } finally {
      vi.useRealTimers();
    }
    http.expectOne(`${API}/search?q=nada`).flush([]);
    fixture.detectChanges();

    expect(component.searching()).toBe(false);
    expect(component.searchResults()).toEqual([]);
    expect(component.error()).toBe('No encontramos resultados.');
  });
});
