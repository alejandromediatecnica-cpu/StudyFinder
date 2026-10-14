import { TestBed } from '@angular/core/testing';
import { StudyDataService } from './study-data.service';

const USER = { id: 7, name: 'Ada', email: 'ada@correo.com' };
const OTRA = { id: 9, name: 'Lin', email: 'lin@correo.com' };

describe('StudyDataService', () => {
  let service: StudyDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudyDataService);
  });

  function sesion(id: number): void {
    localStorage.setItem('studyfinder_user', JSON.stringify({ ...USER, id }));
  }

  function propias(): number {
    return service.getMateriaChanges().customMaterias.length;
  }

  function clavesDeDatos(): string[] {
    return Object.keys(localStorage).filter(clave => clave !== 'studyfinder_user');
  }

  describe('aislamiento por usuario', () => {
    it('usa la clave "guest" cuando no hay sesion', () => {
      service.recordSearch();
      expect(clavesDeDatos()).toEqual(['studyfinder_data_guest']);
    });

    it('namespaca los datos por el id del usuario', () => {
      sesion(USER.id);
      service.recordSearch();
      expect(clavesDeDatos()).toEqual([`studyfinder_data_${USER.id}`]);
    });

    it('no mezcla los datos de dos usuarios distintos', () => {
      sesion(USER.id);
      service.recordSearch();
      service.recordSearch();

      localStorage.setItem('studyfinder_user', JSON.stringify(OTRA));
      expect(service.getStats().searches).toBe(0);
    });

    it('conserva los datos de cada usuario por separado', () => {
      sesion(USER.id);
      service.addMateria('Quimica', 'Reactivos');

      localStorage.setItem('studyfinder_user', JSON.stringify(OTRA));
      expect(service.getMateriaChanges().customMaterias).toEqual([]);

      localStorage.setItem('studyfinder_user', JSON.stringify(USER));
      expect(service.getMateriaChanges().customMaterias).toHaveLength(1);
    });
  });

  describe('valores por defecto', () => {
    it('devuelve un estado vacio cuando no hay datos guardados', () => {
      expect(service.getStats()).toEqual({
        searches: 0,
        savedDocuments: [],
        uploadedFiles: [],
        studySessions: 0,
        customMaterias: [],
        deletedMateriaIds: [],
        tasks: [],
        events: [],
      });
    });

    it('tolera datos guardados con campos ausentes', () => {
      localStorage.setItem('studyfinder_data_guest', JSON.stringify({ searches: 4 }));
      const stats = service.getStats();
      expect(stats.searches).toBe(4);
      expect(stats.savedDocuments).toEqual([]);
    });
  });

  describe('contadores', () => {
    it('acumula busquedas', () => {
      service.recordSearch();
      service.recordSearch();
      expect(service.getStats().searches).toBe(2);
    });

    it('acumula sesiones de estudio', () => {
      service.recordSession();
      expect(service.getStats().studySessions).toBe(1);
    });

    it('acumula archivos subidos y conserva los nombres', () => {
      service.recordUpload('notas.pdf');
      service.recordUpload('slides.pptx');
      const stats = service.getStats();
      expect(stats.uploadedFiles).toEqual(['notas.pdf', 'slides.pptx']);
    });
  });

  describe('documentos guardados', () => {
    const documento = {
      id: 'doi:10.1/abc',
      title: 'Arquitectura MVC',
      url: 'https://example.org/mvc',
      savedAt: '2026-09-29T10:00:00.000Z',
    };

    it('guarda un documento', () => {
      service.saveDocument(documento);
      expect(service.getSavedDocuments()).toHaveLength(1);
    });

    it('no duplica documentos con el mismo id', () => {
      service.saveDocument(documento);
      service.saveDocument({ ...documento, title: 'Otro titulo' });
      const guardados = service.getSavedDocuments();
      expect(guardados).toHaveLength(1);
      expect(guardados[0].title).toBe('Arquitectura MVC');
    });

    it('elimina un documento por id', () => {
      service.saveDocument(documento);
      service.removeSavedDocument('doi:10.1/abc');
      expect(service.getSavedDocuments()).toEqual([]);
    });

    it('filtra por materia cuando se indica', () => {
      service.saveDocument({ ...documento, id: 'a', materia: 'Fisica' });
      service.saveDocument({ ...documento, id: 'b', materia: 'Ingles' });
      expect(service.getSavedDocuments('Fisica').map(d => d.id)).toEqual(['a']);
    });
  });

  describe('materias propias', () => {
    it('anade una materia con nombre y descripcion', () => {
      service.addMateria('Quimica', 'Reactivos y equilibrios');
      expect(service.getMateriaChanges().customMaterias).toEqual([
        { name: 'Quimica', description: 'Reactivos y equilibrios' },
      ]);
    });

    it('elimina una materia propia a partir del indice que deriva de su id', () => {
      service.addMateria('A', '');
      service.addMateria('B', '');
      service.addMateria('C', '');

      // El id 1001 corresponde a la segunda materia del almacen.
      service.removeMateria(1001);

      expect(service.getMateriaChanges().customMaterias.map(m => (m as { name: string }).name)).toEqual(['A', 'C']);
    });

    it('registra en deletedMateriaIds las materias predefinidas que se borran', () => {
      service.removeMateria(3);
      expect(service.getMateriaChanges().deletedMateriaIds).toEqual([3]);
    });

    it('no duplica entradas en deletedMateriaIds', () => {
      service.removeMateria(3);
      service.removeMateria(3);
      expect(service.getMateriaChanges().deletedMateriaIds).toEqual([3]);
    });

    it('no toca el almacen al borrar una materia propia', () => {
      service.addMateria('A', '');
      service.removeMateria(1000);
      expect(service.getMateriaChanges().deletedMateriaIds).toEqual([]);
    });

    it('crecer tras varias altas y bajas', () => {
      for (const nombre of ['A', 'B', 'C']) service.addMateria(nombre, '');
      expect(propias()).toBe(3);
      service.removeMateria(1000);
      service.addMateria('D', '');
      expect(propias()).toBe(3);
    });
  });

  describe('tareas', () => {
    it('addTask guarda la tarea y la devuelve con id', () => {
      const task = service.addTask({ title: 'Tarea 1', status: 'pending', completed: false });
      expect(task.id).toBeTruthy();
      expect(task.createdAt).toBeTruthy();
      expect(service.getTasks()).toHaveLength(1);
    });

    it('updateTask modifica y devuelve la tarea', () => {
      const task = service.addTask({ title: 'Tarea 1', status: 'pending', completed: false });
      const updated = service.updateTask(task.id, { title: 'Tarea 2' });
      expect(updated?.title).toBe('Tarea 2');
      expect(service.getTasks()[0].title).toBe('Tarea 2');
    });

    it('toggleTask alterna completado y status', () => {
      const task = service.addTask({ title: 'Tarea 1', status: 'pending', completed: false });
      service.toggleTask(task.id);
      expect(service.getTasks()[0].completed).toBe(true);
      expect(service.getTasks()[0].status).toBe('done');
      service.toggleTask(task.id);
      expect(service.getTasks()[0].completed).toBe(false);
      expect(service.getTasks()[0].status).toBe('pending');
    });

    it('removeTask borra la tarea y su evento asociado en el calendario', () => {
      const task = service.addTask({ title: 'Tarea 1', status: 'pending', completed: false, dueDate: '2026-09-10' });
      service.addEvent({ title: 'Tarea 1', date: '2026-09-10', taskId: task.id });
      service.removeTask(task.id);
      expect(service.getTasks()).toHaveLength(0);
      expect(service.getEvents()).toHaveLength(0);
    });

    it('addTask con fecha crea el evento en el calendario', () => {
      const task = service.addTask({ title: 'Entrega TP2', status: 'pending', completed: false, dueDate: '2026-09-10', dueTime: '18:00' });
      const eventos = service.getEvents();
      expect(eventos).toHaveLength(1);
      expect(eventos[0]).toMatchObject({ title: 'Entrega TP2', date: '2026-09-10', hour: '18:00', taskId: task.id });
    });

    it('addTask sin fecha no crea evento en el calendario', () => {
      service.addTask({ title: 'Tarea 1', status: 'pending', completed: false });
      expect(service.getEvents()).toHaveLength(0);
    });

    it('updateTask mueve el evento cuando cambia la fecha, sin duplicar', () => {
      const task = service.addTask({ title: 'Tarea 1', status: 'pending', completed: false, dueDate: '2026-09-10' });
      service.updateTask(task.id, { dueDate: '2026-09-20', title: 'Tarea 1 bis' });

      const eventos = service.getEvents();
      expect(eventos).toHaveLength(1);
      expect(eventos[0]).toMatchObject({ title: 'Tarea 1 bis', date: '2026-09-20' });
    });

    it('updateTask borra el evento si se quita la fecha', () => {
      const task = service.addTask({ title: 'Tarea 1', status: 'pending', completed: false, dueDate: '2026-09-10' });
      service.updateTask(task.id, { dueDate: undefined });
      expect(service.getEvents()).toHaveLength(0);
      expect(service.getTasks()).toHaveLength(1);
    });

    it('no toca los eventos ajenos al editar una tarea', () => {
      service.addEvent({ title: 'Examen', date: '2026-09-05' });
      const task = service.addTask({ title: 'Tarea 1', status: 'pending', completed: false, dueDate: '2026-09-10' });
      service.updateTask(task.id, { dueDate: '2026-09-11' });

      expect(service.getEvents().some(e => e.title === 'Examen')).toBe(true);
    });

    it('las tareas se aisan por usuario', () => {
      sesion(7);
      service.addTask({ title: 'De Ada', status: 'pending', completed: false });
      sesion(9);
      expect(service.getTasks()).toHaveLength(0);
      service.addTask({ title: 'De Lin', status: 'pending', completed: false });
      sesion(7);
      expect(service.getTasks()[0].title).toBe('De Ada');
    });
  });

  describe('eventos', () => {
    it('addEvent guarda el evento con id', () => {
      const event = service.addEvent({ title: 'Examen', date: '2026-09-05', hour: '10:00' });
      expect(event.id).toBeTruthy();
      expect(service.getEvents()).toHaveLength(1);
    });

    it('updateEvent modifica el evento', () => {
      const event = service.addEvent({ title: 'Examen', date: '2026-09-05' });
      service.updateEvent(event.id, { title: 'Examen Final' });
      expect(service.getEvents()[0].title).toBe('Examen Final');
    });

    it('removeEvent borra el evento', () => {
      const event = service.addEvent({ title: 'Examen', date: '2026-09-05' });
      service.removeEvent(event.id);
      expect(service.getEvents()).toHaveLength(0);
    });
  });

  describe('migracion de adjuntos antiguos', () => {
    const escribirTareas = (tareas: unknown[]): void => {
      localStorage.setItem(
        'studyfinder_data_guest',
        JSON.stringify({ tasks: tareas, events: [] })
      );
    };

    it('convierte documentId/documentName/documentUrl en documents[]', () => {
      escribirTareas([
        {
          id: 't1',
          title: 'Vieja',
          status: 'pending',
          completed: false,
          createdAt: 'x',
          updatedAt: 'x',
          documentId: 'doc-1',
          documentName: 'apunte.pdf',
          documentUrl: 'http://x/apunte.pdf',
        },
      ]);

      const [tarea] = service.getTasks();
      expect(tarea.documents).toEqual([
        { id: 'doc-1', name: 'apunte.pdf', url: 'http://x/apunte.pdf', origin: 'biblioteca' },
      ]);
      expect((tarea as any).documentId).toBeUndefined();
    });

    it('convierte el arreglo files en documents[]', () => {
      escribirTareas([
        {
          id: 't2',
          title: 'Con files',
          status: 'pending',
          completed: false,
          createdAt: 'x',
          updatedAt: 'x',
          files: [{ id: 'a', name: 'uno.pdf', url: 'http://x/uno.pdf' }],
        },
      ]);

      const [tarea] = service.getTasks();
      expect(tarea.documents?.map(d => d.name)).toEqual(['uno.pdf']);
    });

    it('no toca las tareas que ya usan documents[]', () => {
      escribirTareas([
        {
          id: 't3',
          title: 'Nueva',
          status: 'pending',
          completed: false,
          createdAt: 'x',
          updatedAt: 'x',
          documents: [{ id: 'z', name: 'ok.pdf', origin: 'busqueda' }],
        },
      ]);

      const [tarea] = service.getTasks();
      expect(tarea.documents).toEqual([{ id: 'z', name: 'ok.pdf', origin: 'busqueda' }]);
    });
  });
});
