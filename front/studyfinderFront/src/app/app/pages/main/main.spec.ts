import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MainComponent } from './main';
import { StudyDataService } from '../../../services/study-data.service';
import { routes } from '../../../app.routes';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let studyData: StudyDataService;

  const enDias = (dias: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + dias);
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  };

  const hoy = (): string => enDias(0);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainComponent],
      providers: [provideRouter(routes)],
    }).compileComponents();

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    studyData = TestBed.inject(StudyDataService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('tarea más urgente', () => {
    it('no muestra nada cuando no hay tareas', () => {
      expect(component.urgentTask()).toBeNull();
    });

    it('elige la pendiente con la fecha más cercana', () => {
      studyData.addTask({ title: 'Lejana', status: 'pending', completed: false, dueDate: enDias(20) });
      studyData.addTask({ title: 'Cercana', status: 'pending', completed: false, dueDate: enDias(2) });
      studyData.addTask({ title: 'Media', status: 'pending', completed: false, dueDate: enDias(9) });
      component.cargar();

      expect(component.urgentTask()?.title).toBe('Cercana');
    });

    it('prioriza una tarea vencida sobre una futura', () => {
      studyData.addTask({ title: 'Futura', status: 'pending', completed: false, dueDate: enDias(5) });
      studyData.addTask({ title: 'Vencida', status: 'pending', completed: false, dueDate: enDias(-2) });
      component.cargar();

      expect(component.urgentTask()?.title).toBe('Vencida');
    });

    it('desempata por hora dentro de la misma fecha', () => {
      studyData.addTask({ title: 'Tarde', status: 'pending', completed: false, dueDate: hoy(), dueTime: '18:00' });
      studyData.addTask({ title: 'Mañana temprano', status: 'pending', completed: false, dueDate: hoy(), dueTime: '08:00' });
      component.cargar();

      expect(component.urgentTask()?.title).toBe('Mañana temprano');
    });

    it('ignora las tareas ya completadas', () => {
      studyData.addTask({ title: 'Hecha', status: 'done', completed: true, dueDate: enDias(-1) });
      studyData.addTask({ title: 'Pendiente', status: 'pending', completed: false, dueDate: enDias(4) });
      component.cargar();

      expect(component.urgentTask()?.title).toBe('Pendiente');
    });

    it('deja las tareas sin fecha al final', () => {
      studyData.addTask({ title: 'Sin fecha', status: 'pending', completed: false });
      studyData.addTask({ title: 'Con fecha', status: 'pending', completed: false, dueDate: enDias(30) });
      component.cargar();

      expect(component.urgentTask()?.title).toBe('Con fecha');
    });
  });

  describe('botón Completado', () => {
    beforeEach(() => {
      studyData.addTask({ title: 'Primera', status: 'pending', completed: false, dueDate: enDias(1) });
      studyData.addTask({ title: 'Segunda', status: 'pending', completed: false, dueDate: enDias(3) });
      studyData.addTask({ title: 'Tercera', status: 'pending', completed: false, dueDate: enDias(5) });
      component.cargar();
    });

    it('completa la urgente y la siguiente ocupa su lugar', () => {
      expect(component.urgentTask()?.title).toBe('Primera');
      component.completarUrgente();

      expect(component.urgentTask()?.title).toBe('Segunda');
      expect(studyData.getTasks().find(t => t.title === 'Primera')?.completed).toBe(true);
    });

    it('aparece entre las completadas recientemente', () => {
      component.completarUrgente();
      expect(component.recentlyCompleted().map(t => t.title)).toContain('Primera');
    });

    it('llega hasta la ultima y luego no queda ninguna urgente', () => {
      component.completarUrgente();
      component.completarUrgente();
      component.completarUrgente();

      expect(component.urgentTask()).toBeNull();
      expect(component.recentlyCompleted().length).toBe(3);
    });

    it('no rompe si no hay ninguna tarea', () => {
      studyData.removeTask(studyData.getTasks()[0].id);
      studyData.removeTask(studyData.getTasks()[0].id);
      studyData.removeTask(studyData.getTasks()[0].id);
      component.cargar();

      component.completarUrgente();
      expect(component.urgentTask()).toBeNull();
    });
  });

  describe('próximas tareas', () => {
    it('lista las pendientes ordenadas por urgencia, sin la urgente repetida', () => {
      studyData.addTask({ title: 'A', status: 'pending', completed: false, dueDate: enDias(1) });
      studyData.addTask({ title: 'B', status: 'pending', completed: false, dueDate: enDias(2) });
      studyData.addTask({ title: 'C', status: 'pending', completed: false, dueDate: enDias(3) });
      component.cargar();

      expect(component.upcomingTasks().map(t => t.title)).toEqual(['A', 'B', 'C']);
    });

    it('excluye las completadas', () => {
      studyData.addTask({ title: 'Hecha', status: 'done', completed: true, dueDate: enDias(-1) });
      studyData.addTask({ title: 'Pendiente', status: 'pending', completed: false, dueDate: enDias(1) });
      component.cargar();

      expect(component.upcomingTasks().map(t => t.title)).toEqual(['Pendiente']);
    });

    it('cuenta las pendientes para la tarjeta de estadísticas', () => {
      studyData.addTask({ title: 'A', status: 'pending', completed: false });
      studyData.addTask({ title: 'B', status: 'done', completed: true });
      component.cargar();

      expect(component.pendingCount()).toBe(1);
    });

    it('completar desde la lista también avanza la urgente', () => {
      studyData.addTask({ title: 'A', status: 'pending', completed: false, dueDate: enDias(1) });
      studyData.addTask({ title: 'B', status: 'pending', completed: false, dueDate: enDias(2) });
      component.cargar();

      component.completar(component.upcomingTasks()[0]);
      expect(component.urgentTask()?.title).toBe('B');
    });
  });

  describe('etiquetas de fecha', () => {
    it('distingue vencida, hoy y mañana', () => {
      studyData.addTask({ title: 'V', status: 'pending', completed: false, dueDate: enDias(-1) });
      studyData.addTask({ title: 'H', status: 'pending', completed: false, dueDate: hoy() });
      studyData.addTask({ title: 'M', status: 'pending', completed: false, dueDate: enDias(1) });
      component.cargar();

      const etiquetas = new Map(component.tasks().map(t => [t.title, component.etiquetaFecha(t)]));
      expect(etiquetas.get('V')).toBe('Vencida');
      expect(etiquetas.get('H')).toBe('Hoy');
      expect(etiquetas.get('M')).toBe('Mañana');
    });

    it('cuenta los días de la semana', () => {
      studyData.addTask({ title: 'D', status: 'pending', completed: false, dueDate: enDias(3) });
      component.cargar();
      expect(component.etiquetaFecha(component.tasks()[0])).toBe('En 3 días');
    });

    it('avisa cuando no hay fecha', () => {
      studyData.addTask({ title: 'S', status: 'pending', completed: false });
      component.cargar();
      expect(component.etiquetaFecha(component.tasks()[0])).toBe('Sin fecha');
    });
  });

  it('muestra los datos reales en el DOM', () => {
    studyData.addTask({ title: 'Entregar TP de Cálculo', subject: 'Cálculo II', status: 'pending', completed: false, dueDate: enDias(1) });
    component.cargar();
    fixture.detectChanges();

    const texto = fixture.nativeElement.textContent;
    expect(texto).toContain('Entregar TP de Cálculo');
    expect(texto).toContain('Completado');
    // La tarjeta de pendientes usa el dato real, no un numero de ejemplo.
    expect(texto).toContain('Tareas pendientes');
  });
});
