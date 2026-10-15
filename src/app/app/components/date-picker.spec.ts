import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatePickerComponent } from './date-picker';

describe('DatePickerComponent', () => {
  let component: DatePickerComponent;
  let fixture: ComponentFixture<DatePickerComponent>;

  const aIso = (dias: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + dias);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DatePickerComponent] }).compileComponents();
    fixture = TestBed.createComponent(DatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('arranca cerrado y sin fecha', () => {
    expect(component.open()).toBe(false);
    expect(component.value()).toBe('');
  });

  it('abre y cierra al pulsar el disparador', () => {
    component.toggle();
    expect(component.open()).toBe(true);
    component.toggle();
    expect(component.open()).toBe(false);
  });

  it('elige una fecha y emite el cambio', () => {
    const emitidos: string[] = [];
    component.changed.subscribe(valor => emitidos.push(valor));

    component.elegir('2026-09-10');

    expect(component.value()).toBe('2026-09-10');
    expect(emitidos).toEqual(['2026-09-10']);
    expect(component.open()).toBe(false);
  });

  it('limpiar deja la fecha vacía y avisa', () => {
    const emitidos: string[] = [];
    component.changed.subscribe(valor => emitidos.push(valor));
    component.value.set('2026-09-10');

    component.clear();

    expect(component.value()).toBe('');
    expect(emitidos).toEqual(['']);
  });

  it('siempre dibuja 42 celdas en el calendario', () => {
    expect(component.celdas().length).toBe(42);
  });

  it('la rejilla empieza en lunes', () => {
    // new Date(2026, 8, 1) es martes, asi que la semana arranca el 31 de agosto.
    component.cursor.set(new Date(2026, 8, 1));
    expect(component.celdas()[0].iso).toBe('2026-08-31');
  });

  it('marca el día de hoy', () => {
    expect(component.celdas().filter(celda => celda.hoy).map(celda => celda.iso)).toEqual([aIso(0)]);
  });

  it('marca la fecha seleccionada', () => {
    component.cursor.set(new Date(2026, 8, 1));
    component.value.set('2026-09-15');
    expect(component.celdas().filter(celda => celda.seleccionada).map(celda => celda.iso)).toEqual(['2026-09-15']);
  });

  it('distingue los días de otro mes', () => {
    component.cursor.set(new Date(2026, 8, 1));
    expect(component.celdas().some(celda => celda.otroMes)).toBe(true);
  });

  it('navega entre meses', () => {
    component.cursor.set(new Date(2026, 8, 1));
    component.moverMes(1);
    expect(component.anio()).toBe(2026);
    expect(component.nombreMes()).toBe('Octubre');
    component.moverMes(-1);
    expect(component.nombreMes()).toBe('Septiembre');
  });

  it('cruza el cambio de año', () => {
    component.cursor.set(new Date(2026, 11, 1));
    component.moverMes(1);
    expect(component.anio()).toBe(2027);
    expect(component.nombreMes()).toBe('Enero');
  });

  it('"Hoy" e "Mañana" ponen fechas relativas', () => {
    component.hoy();
    expect(component.value()).toBe(aIso(0));
    component.manana();
    expect(component.value()).toBe(aIso(1));
  });

  it('al abrir con fecha previa muestra ese mes', () => {
    const lejos = aIso(400);
    component.value.set(lejos);
    component.toggle();

    const elegida = new Date(`${lejos}T00:00`);
    expect(component.anio()).toBe(elegida.getFullYear());
    expect(component.nombreMes()).toBe(component.meses[elegida.getMonth()]);
  });

  it('el DOM muestra la fecha elegida con formato legible', () => {
    component.value.set('2026-09-10');
    fixture.detectChanges();

    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('2026-09-10');
    // Ya hay fecha, asi que aparece el botón para quitarla.
    expect(fixture.nativeElement.querySelector('.dp-clear')).toBeTruthy();
  });

  it('sin fecha muestra el placeholder', () => {
    fixture.detectChanges();
    const valor = fixture.nativeElement.querySelector('.dp-value') as HTMLElement;
    expect(valor.textContent).toContain('Sin fecha');
  });

  it('el popover aparece al abrir', () => {
    component.toggle();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dp-pop')).toBeTruthy();
  });
});
