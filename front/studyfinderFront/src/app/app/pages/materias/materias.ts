import { Component, signal } from '@angular/core';

interface Documento {
  id: number;
  nombre: string;
  tipo: string;
  fecha: string;
  tamano: string;
}

interface Materia {
  id: number;
  nombre: string;
  documentos: Documento[];
}

@Component({
  selector: 'app-materias',
  standalone: true,
  imports: [],
  templateUrl: './materias.html',
  styleUrl: './materias.css',
})
export class MateriasComponent {
  materias = signal<Materia[]>([
    {
      id: 1,
      nombre: 'Ingeniería de Software',
      documentos: [
        { id: 1, nombre: 'Capitulo 4 - Arquitectura MVC.pdf', tipo: 'pdf', fecha: '10 jul 2026', tamano: '2.4 MB' },
        { id: 2, nombre: 'Diagrama de clases.pdf', tipo: 'pdf', fecha: '08 jul 2026', tamano: '1.1 MB' },
        { id: 3, nombre: 'Resumen patrones de diseño.docx', tipo: 'docx', fecha: '02 jul 2026', tamano: '540 KB' },
      ]
    },
    {
      id: 2,
      nombre: 'Cálculo II',
      documentos: [
        { id: 4, nombre: 'Integrales dobles.pdf', tipo: 'pdf', fecha: '15 jul 2026', tamano: '3.1 MB' },
        { id: 5, nombre: 'Ejercicios semana 6.pdf', tipo: 'pdf', fecha: '12 jul 2026', tamano: '890 KB' },
      ]
    },
    {
      id: 3,
      nombre: 'Física',
      documentos: [
        { id: 6, nombre: 'Cinemática - diapositivas.pptx', tipo: 'pptx', fecha: '09 jul 2026', tamano: '4.7 MB' },
      ]
    },
    {
      id: 4,
      nombre: 'Programación',
      documentos: [
        { id: 7, nombre: 'Estructuras de datos.pdf', tipo: 'pdf', fecha: '18 jul 2026', tamano: '2.9 MB' },
        { id: 8, nombre: 'Notas árboles binarios.pdf', tipo: 'pdf', fecha: '14 jul 2026', tamano: '1.3 MB' },
      ]
    },
    {
      id: 5,
      nombre: 'Inglés',
      documentos: [
        { id: 9, nombre: 'Vocabulario unidad 3.pdf', tipo: 'pdf', fecha: '11 jul 2026', tamano: '620 KB' },
      ]
    },
    {
      id: 6,
      nombre: 'Matemáticas',
      documentos: [
        { id: 10, nombre: 'Álgebra lineal - apuntes.pdf', tipo: 'pdf', fecha: '16 jul 2026', tamano: '1.8 MB' },
      ]
    },
  ]);

  materiaSeleccionada = signal<Materia | null>(null);

  seleccionarMateria(materia: Materia) {
    this.materiaSeleccionada.set(materia);
  }

  volver() {
    this.materiaSeleccionada.set(null);
  }

  iconoPorTipo(tipo: string): string {
    const iconos: Record<string, string> = {
      pdf: '📄',
      docx: '📝',
      pptx: '📊',
      xlsx: '📈',
    };
    return iconos[tipo] ?? '📄';
  }
}