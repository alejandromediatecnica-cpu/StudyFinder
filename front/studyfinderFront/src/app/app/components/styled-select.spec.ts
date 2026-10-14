import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StyledSelectComponent } from './styled-select';

const TIPOS = [
  { value: 'tarea', label: 'Tarea' },
  { value: 'trabajo', label: 'Trabajo' }
];

describe('StyledSelectComponent', () => {
  let component: StyledSelectComponent;
  let fixture: ComponentFixture<StyledSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StyledSelectComponent] }).compileComponents();
    fixture = TestBed.createComponent(StyledSelectComponent);
    component = fixture.componentInstance;
    // Los inputs son signals de solo lectura: se fijan con setInput del fixture.
    fixture.componentRef.setInput('opciones', TIPOS);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('arranca cerrado', () => {
    expect(component.open()).toBe(false);
  });

  it('abre y cierra', () => {
    component.toggle();
    expect(component.open()).toBe(true);
    component.toggle();
    expect(component.open()).toBe(false);
  });

  it('encuentra la opción elegida', () => {
    component.value.set('trabajo');
    expect(component.elegido?.label).toBe('Trabajo');
  });

  it('sin valor no hay opción elegida', () => {
    expect(component.elegido).toBeUndefined();
  });

  it('elegir fija el valor y cierra', () => {
    component.toggle();
    component.elegir('trabajo');

    expect(component.value()).toBe('trabajo');
    expect(component.open()).toBe(false);
  });

  it('el DOM lista todas las opciones al abrir', () => {
    component.toggle();
    fixture.detectChanges();

    const opciones = fixture.nativeElement.querySelectorAll('.ss-option');
    expect(opciones.length).toBe(2);
    expect((opciones[0] as HTMLElement).textContent).toContain('Tarea');
  });

  it('marca la opción activa con un visto', () => {
    component.value.set('tarea');
    component.toggle();
    fixture.detectChanges();

    const activa = fixture.nativeElement.querySelector('.ss-option.active') as HTMLElement;
    expect(activa.textContent).toContain('✓');
  });

  it('muestra el placeholder cuando no hay valor', () => {
    fixture.componentRef.setInput('placeholder', 'Sin materia');
    fixture.detectChanges();

    const valor = fixture.nativeElement.querySelector('.ss-value') as HTMLElement;
    expect(valor.textContent).toContain('Sin materia');
    expect(valor.classList).toContain('placeholder');
  });

  it('el trigger se marca como relleno cuando hay valor', () => {
    component.value.set('tarea');
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('.ss-trigger') as HTMLElement;
    expect(trigger.classList).toContain('filled');
  });
});
