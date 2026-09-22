import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Task {
  title: string;
  subject: string;
  due: string;
  status: 'today' | 'week' | 'done';
  completed: boolean;
}

@Component({
  standalone: true,
  selector: 'app-tareas',
  imports: [CommonModule, FormsModule],
  templateUrl: './tareas.html',
  styleUrl: './tareas.css',
})
export class TareasComponent {
  searchTerm = '';
  tasks: Task[] = [
    { title: 'Integrales dobles', subject: 'Matemáticas', due: '10:00', status: 'today', completed: true },
    { title: 'Entrega laboratorio', subject: 'Física', due: '14:00', status: 'today', completed: false },
    { title: 'Práctica Angular', subject: 'Programación', due: '18:00', status: 'today', completed: false },
    { title: 'Vocabulario unidad 3', subject: 'Inglés', due: 'Mañana', status: 'week', completed: false },
    { title: 'Leer arquitectura MVC', subject: 'Software', due: 'Miércoles', status: 'week', completed: false },
    { title: 'Álgebra lineal', subject: 'Matemáticas', due: 'Completada hoy', status: 'done', completed: true },
    { title: 'Cinemática', subject: 'Física', due: 'Completada ayer', status: 'done', completed: true }
  ];

  filteredTasks(status: Task['status']): Task[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.tasks.filter(task => task.status === status && (!term || `${task.title} ${task.subject}`.toLowerCase().includes(term)));
  }

  clearSearch(): void {
    this.searchTerm = '';
  }
}
