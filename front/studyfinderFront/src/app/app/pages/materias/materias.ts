import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SearchService } from '../../../services/search.service';
import { StudyDataService, SavedDocument, CustomMateria } from '../../../services/study-data.service';

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
  descripcion?: string;
  documentos: Documento[];
}

@Component({
  selector: 'app-materias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
  searchTerm = '';
  searchResults: any[] = [];
  previewDocument: any = null;
  searching = false;
  searchError = '';
  showNewMateria = false;
  newMateriaName = '';
  newMateriaDescription = '';
  materiaError = '';

  constructor(private searchService: SearchService, private studyData: StudyDataService) {
    const changes = this.studyData.getMateriaChanges();
    this.materias.update(items => [
      ...items.filter(item => !changes.deletedMateriaIds.includes(item.id)),
      ...changes.customMaterias.map((materia, index) => {
        const custom = typeof materia === 'string' ? { name: materia, description: '' } : materia as CustomMateria;
        return { id: 1000 + index, nombre: custom.name, descripcion: custom.description, documentos: [] };
      })
    ]);
  }

  seleccionarMateria(materia: Materia) {
    this.materiaSeleccionada.set(materia);
  }

  crearMateria(): void {
    const nombre = this.newMateriaName.trim();
    if (!nombre) {
      this.materiaError = 'Escribe un nombre para la materia.';
      return;
    }
    if (this.materias().some(materia => materia.nombre.toLowerCase() === nombre.toLowerCase())) {
      this.materiaError = 'Ya existe una materia con ese nombre.';
      return;
    }
    const id = 1000 + this.studyData.getMateriaChanges().customMaterias.length;
    const descripcion = this.newMateriaDescription.trim();
    this.materias.update(items => [...items, { id, nombre, descripcion, documentos: [] }]);
    this.studyData.addMateria(nombre, descripcion);
    this.newMateriaName = '';
    this.newMateriaDescription = '';
    this.materiaError = '';
    this.showNewMateria = false;
  }

  volver() {
    this.materiaSeleccionada.set(null);
    this.previewDocument = null;
    this.searchResults = [];
  }

  buscarDocumentos(): void {
    if (!this.searchTerm.trim()) return;
    this.studyData.recordSearch();
    this.searching = true;
    this.searchError = '';
    this.searchService.searchDocuments(this.searchTerm.trim()).subscribe({
      next: (response: any) => {
        this.searchResults = Array.isArray(response) ? response : response?.results || response?.items || [];
        this.searching = false;
        if (!this.searchResults.length) this.searchError = 'No encontramos documentos.';
      },
      error: () => {
        this.searching = false;
        this.searchError = 'No se pudo realizar la búsqueda.';
      }
    });
  }

  previsualizar(document: any): void {
    this.previewDocument = document;
  }

  guardarEnMateria(document: any): void {
    const materia = this.materiaSeleccionada();
    if (!materia) return;
    const saved: SavedDocument = {
      id: document.id || document.url || document.title,
      title: document.title || 'Sin título',
      url: document.url || '#',
      authors: document.authors,
      year: document.year,
      materia: materia.nombre,
      savedAt: new Date().toISOString()
    };
    this.studyData.saveDocument(saved);
    this.previewDocument = null;
  }

  documentosGuardados(materia: Materia): SavedDocument[] {
    return this.studyData.getSavedDocuments(materia.nombre);
  }

  eliminarMateria(materia: Materia, event: MouseEvent): void {
    event.stopPropagation();
    this.materias.update(items => items.filter(item => item.id !== materia.id));
    this.studyData.removeMateria(materia.id);
    if (this.materiaSeleccionada()?.id === materia.id) this.volver();
  }

  eliminarDocumento(documento: Documento, event: MouseEvent): void {
    event.stopPropagation();
    const materia = this.materiaSeleccionada();
    if (!materia) return;
    this.materias.update(items => items.map(item => item.id === materia.id
      ? { ...item, documentos: item.documentos.filter(document => document.id !== documento.id) }
      : item));
    this.materiaSeleccionada.set(this.materias().find(item => item.id === materia.id) || null);
  }

  eliminarGuardado(documento: SavedDocument, event: MouseEvent): void {
    event.stopPropagation();
    this.studyData.removeSavedDocument(documento.id);
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