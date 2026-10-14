import { TestBed } from '@angular/core/testing';

import { ThemeService } from '../../../services/theme.service';
import { ConfiguracionComponent } from './configuracion';

describe('ConfiguracionComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracionComponent],
    }).compileComponents();
  });

  function crear() {
    const fixture = TestBed.createComponent(ConfiguracionComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  it('should create', () => {
    const { component } = crear();
    expect(component).toBeTruthy();
  });

  it('deja el tema oscuro como unico ajuste', () => {
    const { fixture } = crear();
    expect(fixture.nativeElement.querySelectorAll('button').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.toggle').length).toBe(1);
  });

  it('elimina los ajustes de notificaciones, recordatorio e idioma', () => {
    const { fixture } = crear();
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).not.toContain('Notificaciones');
    expect(texto).not.toContain('Recordatorio diario');
    expect(texto).not.toContain('Idioma');
    expect(texto).not.toContain('Español');
  });

  it('muestra el titulo de tema oscuro', () => {
    const { fixture } = crear();
    expect(fixture.nativeElement.textContent).toContain('Tema oscuro');
  });

  it('arranca con el toggle encendido si el tema guardado es oscuro', () => {
    localStorage.setItem('studyfinder_theme', 'dark');
    const { fixture } = crear();
    const toggle = fixture.nativeElement.querySelector('.toggle') as HTMLButtonElement;
    expect(toggle.classList.contains('on')).toBe(true);
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
  });

  it('arranca apagado si el tema guardado es claro', () => {
    localStorage.setItem('studyfinder_theme', 'light');
    const { fixture } = crear();
    const toggle = fixture.nativeElement.querySelector('.toggle') as HTMLButtonElement;
    expect(toggle.classList.contains('on')).toBe(false);
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
  });

  it('al pulsar el toggle cambia a tema claro', () => {
    localStorage.setItem('studyfinder_theme', 'dark');
    const { fixture } = crear();
    (fixture.nativeElement.querySelector('.toggle') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(fixture.nativeElement.querySelector('.toggle').classList.contains('on')).toBe(false);
  });

  it('al pulsar de nuevo vuelve al tema oscuro', () => {
    localStorage.setItem('studyfinder_theme', 'light');
    const { fixture } = crear();
    const toggle = fixture.nativeElement.querySelector('.toggle') as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(toggle.classList.contains('on')).toBe(true);
    expect(localStorage.getItem('studyfinder_theme')).toBe('dark');
  });

  it('el toggle expone un nombre accesible', () => {
    const { fixture } = crear();
    const toggle = fixture.nativeElement.querySelector('.toggle') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-label')).toBe('Tema oscuro');
  });
});
