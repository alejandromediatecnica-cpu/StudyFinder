import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('arranca en tema oscuro si no hay preferencia guardada', () => {
    expect(service.theme()).toBe('dark');
    expect(service.isDark()).toBe(true);
  });

  it('aplica data-theme en el documento', () => {
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('recupera el tema claro guardado', () => {
    localStorage.setItem('studyfinder_theme', 'light');
    const otro = new ThemeService();
    expect(otro.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('ignora un valor guardado que no sea un tema valido', () => {
    localStorage.setItem('studyfinder_theme', 'fucsia');
    const otro = new ThemeService();
    expect(otro.theme()).toBe('dark');
  });

  it('toggle pasa de oscuro a claro', () => {
    service.toggle();
    expect(service.theme()).toBe('light');
    expect(service.isDark()).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('toggle vuelve de claro a oscuro', () => {
    service.set('light');
    service.toggle();
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('set persiste la preferencia', () => {
    service.set('light');
    expect(localStorage.getItem('studyfinder_theme')).toBe('light');
  });

  it('toggle persiste la preferencia', () => {
    service.toggle();
    expect(localStorage.getItem('studyfinder_theme')).toBe('light');
  });

  it('set es idempotente con el mismo tema', () => {
    service.set('dark');
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
