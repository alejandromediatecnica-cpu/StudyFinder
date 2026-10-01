import { Injectable } from '@angular/core';

export interface SavedDocument {
  id: string;
  title: string;
  url: string;
  authors?: string[];
  year?: number;
  materia?: string;
  savedAt: string;
}

export interface CustomMateria {
  name: string;
  description: string;
}

export type TaskStatus = 'today' | 'week' | 'done' | 'pending';

/** Documento adjunto a una tarea. Varios por tarea. */
export interface TaskDocument {
  /** id del documento en la biblioteca, ausente en resultados de busqueda. */
  id?: string;
  name: string;
  url?: string;
  origin: 'biblioteca' | 'busqueda';
}

export interface Task {
  id: string;
  title: string;
  subject?: string;
  due?: string; // fecha/hora legible (ej. "10:00" o "Miércoles")
  dueDate?: string; // ISO YYYY-MM-DD
  dueTime?: string; // HH:mm
  status: TaskStatus;
  completed: boolean;
  documents?: TaskDocument[];
  type?: 'tarea' | 'trabajo' | 'evento';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO YYYY-MM-DD
  hour?: string; // HH:mm o legible
  color?: 'document' | 'homework' | 'class' | 'event' | 'task';
  type?: 'evento' | 'tarea' | 'trabajo';
  taskId?: string;
  documents?: TaskDocument[];
}

interface StudyData {
  searches: number;
  savedDocuments: SavedDocument[];
  uploadedFiles: string[];
  studySessions: number;
  customMaterias: Array<string | CustomMateria>;
  deletedMateriaIds: number[];
  tasks: Task[];
  events: CalendarEvent[];
}

@Injectable({ providedIn: 'root' })
export class StudyDataService {
  private readonly prefix = 'studyfinder_data_';

  private key(): string {
    const user = typeof localStorage === 'undefined' ? null : localStorage.getItem('studyfinder_user');
    let id: string | number | undefined;
    try {
      id = user ? JSON.parse(user)?.id : undefined;
    } catch {
      // Un valor corrupto se trata como sesion anonima en vez de romper la app.
      id = undefined;
    }
    return `${this.prefix}${id || 'guest'}`;
  }

  private read(): StudyData {
    if (typeof localStorage === 'undefined') return this.empty();
    const stored = localStorage.getItem(this.key());
    return stored ? { ...this.empty(), ...JSON.parse(stored) } as StudyData : this.empty();
  }

  private write(data: StudyData): void {
    if (typeof localStorage !== 'undefined') localStorage.setItem(this.key(), JSON.stringify(data));
  }

  private empty(): StudyData {
    return {
      searches: 0,
      savedDocuments: [],
      uploadedFiles: [],
      studySessions: 0,
      customMaterias: [],
      deletedMateriaIds: [],
      tasks: [],
      events: []
    };
  }

  recordSearch(): void {
    const data = this.read();
    data.searches += 1;
    this.write(data);
  }

  recordSession(): void {
    const data = this.read();
    data.studySessions += 1;
    this.write(data);
  }

  recordUpload(fileName: string): void {
    const data = this.read();
    data.uploadedFiles = [...data.uploadedFiles, fileName];
    this.write(data);
  }

  saveDocument(document: SavedDocument): void {
    const data = this.read();
    if (!data.savedDocuments.some(item => item.id === document.id)) {
      data.savedDocuments = [...data.savedDocuments, document];
      this.write(data);
    }
  }

  removeSavedDocument(id: string): void {
    const data = this.read();
    data.savedDocuments = data.savedDocuments.filter(document => document.id !== id);
    this.write(data);
  }

  getSavedDocuments(materia?: string): SavedDocument[] {
    const documents = this.read().savedDocuments;
    return materia ? documents.filter(document => document.materia === materia) : documents;
  }

  getStats(): StudyData {
    return this.read();
  }

  addMateria(name: string, description: string): void {
    const data = this.read();
    data.customMaterias = [...data.customMaterias, { name, description }];
    this.write(data);
  }

  removeMateria(id: number): void {
    const data = this.read();
    if (id >= 1000) {
      const customIndex = id - 1000;
      data.customMaterias = data.customMaterias.filter((_, index) => index !== customIndex);
    } else if (!data.deletedMateriaIds.includes(id)) {
      data.deletedMateriaIds = [...data.deletedMateriaIds, id];
    }
    this.write(data);
  }

  getMateriaChanges(): Pick<StudyData, 'customMaterias' | 'deletedMateriaIds'> {
    const data = this.read();
    return { customMaterias: data.customMaterias, deletedMateriaIds: data.deletedMateriaIds };
  }

  // ------------------------------------------------------------------
  // Tareas y eventos: se guardan en localStorage por usuario y los
  // comparten las pestañas Tareas y Calendario.
  // ------------------------------------------------------------------

  private id(prefijo: string): string {
    const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
    return `${prefijo}-${Date.now().toString(36)}-${random}`;
  }

  getTasks(): Task[] {
    return this.read().tasks ?? [];
  }

  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const data = this.read();
    const now = new Date().toISOString();
    const nueva: Task = { ...task, id: this.id('tarea'), createdAt: now, updatedAt: now };
    data.tasks = [...(data.tasks ?? []), nueva];
    this.sincronizaEventoDeTarea(data, nueva);
    this.write(data);
    return nueva;
  }

  updateTask(id: string, cambios: Partial<Omit<Task, 'id' | 'createdAt'>>): Task | null {
    const data = this.read();
    let actualizada: Task | null = null;
    data.tasks = (data.tasks ?? []).map(task => {
      if (task.id !== id) return task;
      actualizada = { ...task, ...cambios, updatedAt: new Date().toISOString() };
      return actualizada;
    });
    if (actualizada) {
      this.sincronizaEventoDeTarea(data, actualizada);
      this.write(data);
    }
    return actualizada;
  }

  /**
   * Mantiene el evento del calendario sincronizado con la tarea: si tiene fecha
   * lo crea o actualiza, y si se le quita la fecha lo elimina. Asi no quedan
   * eventos sueltos al editar desde Tareas ni entradas duplicadas.
   */
  private sincronizaEventoDeTarea(data: StudyData, task: Task): void {
    const eventos = data.events ?? [];
    const existente = eventos.find(event => event.taskId === task.id);

    if (!task.dueDate) {
      data.events = eventos.filter(event => event.taskId !== task.id);
      return;
    }

    const cambios: Omit<CalendarEvent, 'id'> = {
      title: task.title,
      description: task.subject || task.description || undefined,
      date: task.dueDate,
      hour: task.dueTime,
      type: task.type,
      color: task.type === 'trabajo' ? 'homework' : task.type === 'evento' ? 'event' : 'task',
      taskId: task.id,
      documents: task.documents?.length ? task.documents : undefined
    };

    data.events = existente
      ? eventos.map(event => (event.id === existente.id ? { ...event, ...cambios } : event))
      : [...eventos, { ...cambios, id: this.id('evento') }];
  }

  toggleTask(id: string): void {
    const task = this.getTasks().find(item => item.id === id);
    if (!task) return;
    this.updateTask(id, { completed: !task.completed, status: !task.completed ? 'done' : 'pending' });
  }

  removeTask(id: string): void {
    const data = this.read();
    data.tasks = (data.tasks ?? []).filter(task => task.id !== id);
    // Una tarea con fecha también vive en el calendario: se borra alli tambien.
    data.events = (data.events ?? []).filter(event => event.taskId !== id);
    this.write(data);
  }

  getEvents(): CalendarEvent[] {
    return this.read().events ?? [];
  }

  addEvent(event: Omit<CalendarEvent, 'id'>): CalendarEvent {
    const data = this.read();
    const nuevo: CalendarEvent = { ...event, id: this.id('evento') };
    data.events = [...(data.events ?? []), nuevo];
    this.write(data);
    return nuevo;
  }

  updateEvent(id: string, cambios: Partial<Omit<CalendarEvent, 'id'>>): CalendarEvent | null {
    const data = this.read();
    let actualizado: CalendarEvent | null = null;
    data.events = (data.events ?? []).map(event => {
      if (event.id !== id) return event;
      actualizado = { ...event, ...cambios };
      return actualizado;
    });
    if (actualizado) this.write(data);
    return actualizado;
  }

  removeEvent(id: string): void {
    const data = this.read();
    data.events = (data.events ?? []).filter(event => event.id !== id);
    this.write(data);
  }
}
