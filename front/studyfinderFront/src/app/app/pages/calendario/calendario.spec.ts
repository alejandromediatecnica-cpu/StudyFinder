import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarioComponent } from './calendario';
import { StudyDataService } from '../../../services/study-data.service';

// generateCalendar() es privado; los specs acceden via cast para fijar un mes
// conocido sin depender del reloj del entorno de pruebas.
const regenerar = (component: CalendarioComponent) => (component as unknown as { generateCalendar(): void }).generateCalendar();

describe('CalendarioComponent', () => {
  let component: CalendarioComponent;
  let fixture: ComponentFixture<CalendarioComponent>;
  let studyData: StudyDataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarioComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarioComponent);
    component = fixture.componentInstance;
    studyData = TestBed.inject(StudyDataService);
    component.currentDate = new Date(2026, 8, 15);
    component.selectedDay = new Date(2026, 8, 15);
    regenerar(component);
    // La app corre sin zone.js: el calendario lee el storage en ngOnInit, asi que
    // hay que disparar el ciclo explicitamente tras sembrar datos.
    studyData.addEvent({ title: 'Sembrado', date: '2026-09-03', hour: '08:00', type: 'evento' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('genera siempre 42 celdas en la rejilla', () => {
    regenerar(component);
    expect(component.calendarDays.length).toBe(42);
  });

  it('empieza el mes en lunes', () => {
    const primerDia = component.calendarDays[0];
    expect(primerDia.toDateString()).toBe(new Date(2026, 7, 31).toDateString());
  });

  it('nextMonth y previousMonth navegan por el calendario', () => {
    component.nextMonth();
    expect(component.currentDate.getMonth()).toBe(9);
    component.previousMonth();
    expect(component.currentDate.getMonth()).toBe(8);
  });

  it('goToday vuelve al mes actual', () => {
    component.currentDate = new Date(2020, 0, 1);
    component.goToday();
    const hoy = new Date();
    expect(component.currentDate.getFullYear()).toBe(hoy.getFullYear());
    expect(component.currentDate.getMonth()).toBe(hoy.getMonth());
  });

  it('cambia el dia seleccionado', () => {
    const dia = new Date(2026, 8, 20);
    component.selectDay(dia);
    expect(component.isSelected(dia)).toBe(true);
  });

  describe('getEvents', () => {
    it('devuelve los eventos del dia pedido', () => {
      const eventos = component.getEvents(new Date(2026, 8, 3));
      expect(eventos.map(event => event.title)).toEqual(['Sembrado']);
    });

    it('devuelve una lista vacia para un dia sin eventos', () => {
      expect(component.getEvents(new Date(2026, 8, 20))).toEqual([]);
    });

    it('ignora el mismo dia pero de otro anio', () => {
      expect(component.getEvents(new Date(2025, 8, 3))).toEqual([]);
    });
  });

  it('isCurrentMonth distingue el anio', () => {
    expect(component.isCurrentMonth(new Date(2025, 8, 1))).toBe(false);
    expect(component.isCurrentMonth(new Date(2026, 8, 1))).toBe(true);
  });

  describe('CRUD de eventos', () => {
    it('guarda un evento en el dia seleccionado', () => {
      component.selectDay(new Date(2026, 8, 15));
      component.abrirFormulario();
      component.formTitle = 'Examen Final';
      component.formHour = '10:00';
      component.guardar();

      expect(studyData.getEvents().some(e => e.title === 'Examen Final')).toBe(true);
      expect(component.getEvents(new Date(2026, 8, 15)).some(e => e.title === 'Examen Final')).toBe(true);
      expect(component.showForm()).toBe(false);
    });

    it('no guarda un evento sin titulo', () => {
      component.abrirFormulario();
      component.formTitle = '   ';
      component.guardar();
      expect(component.formError()).toMatch(/t.tulo/i);
      expect(studyData.getEvents().some(e => e.title === '')).toBe(false);
    });

    it('elimina un evento con confirmacion', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const evento = component.getEvents(new Date(2026, 8, 3))[0];
      component.eliminar(evento);
      expect(studyData.getEvents().some(e => e.id === evento.id)).toBe(false);
      expect(component.getEvents(new Date(2026, 8, 3))).toEqual([]);
    });

    it('no elimina si se cancela la confirmacion', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const evento = component.getEvents(new Date(2026, 8, 3))[0];
      component.eliminar(evento);
      expect(studyData.getEvents().some(e => e.id === evento.id)).toBe(true);
    });
  });

  it('muestra las tareas con fecha que se crean desde la pestana Tareas', () => {
    const tarea = studyData.addTask({
      title: 'Entrega TP2',
      subject: 'Física',
      type: 'tarea',
      status: 'pending',
      completed: false,
      dueDate: '2026-09-10'
    });
    component.cargar();

    const enDia = component.getEvents(new Date(2026, 8, 10));
    expect(enDia.map(e => e.title)).toContain('Entrega TP2');
    expect(enDia[0].taskId).toBe(tarea.id);
  });

  it('no duplica el evento si la tarea se edita', () => {
    const tarea = studyData.addTask({
      title: 'Entrega TP2',
      status: 'pending',
      completed: false,
      dueDate: '2026-09-10'
    });
    studyData.updateTask(tarea.id, { dueDate: '2026-09-12', title: 'Entrega TP2 v2' });
    component.cargar();

    expect(component.getEvents(new Date(2026, 8, 10))).toEqual([]);
    expect(component.getEvents(new Date(2026, 8, 12)).map(e => e.title)).toEqual(['Entrega TP2 v2']);
  });
});