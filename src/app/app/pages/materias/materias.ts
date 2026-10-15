import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SearchService } from '../../../services/search.service';
import { StudyDataService, SavedDocument, CustomMateria } from '../../../services/study-data.service';
import { DocumentService, LibraryDocument } from '../../../services/document.service';

interface Documento {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  createdAt: string;
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
    { id: 1, nombre: 'Ingeniería de Software', documentos: [] },
    { id: 2, nombre: 'Cálculo II', documentos: [] },
    { id: 3, nombre: 'Física', documentos: [] },
    { id: 4, nombre: 'Programación', documentos: [] },
    { id: 5, nombre: 'Inglés', documentos: [] },
    { id: 6, nombre: 'Matemáticas', documentos: [] },
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
  selectorBibliotecaAbierto = false;
  documentosBiblioteca: LibraryDocument[] = [];
  documentosDeMateria: LibraryDocument[] = [];
  cargandoBiblioteca = false;
  guardandoDocumentoId: string | null = null;
  errorBiblioteca = '';

  constructor(private searchService: SearchService, private studyData: StudyDataService, private documentService: DocumentService) {
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
    this.cargarDocumentosDeMateria(materia);
  }

  private cargarDocumentosDeMateria(materia: Materia): void {
    this.documentService.list(materia.nombre).subscribe({
      next: documents => this.documentosDeMateria = documents,
      error: () => this.errorBiblioteca = 'No se pudieron cargar los documentos de esta materia.'
    });
  }

  abrirSelectorBiblioteca(): void {
    this.selectorBibliotecaAbierto = true;
    this.cargandoBiblioteca = true;
    this.errorBiblioteca = '';
    this.documentService.list().subscribe({
      next: documents => {
        this.documentosBiblioteca = documents;
        this.cargandoBiblioteca = false;
      },
      error: () => {
        this.errorBiblioteca = 'No se pudo cargar la Biblioteca. Comprueba tu sesión.';
        this.cargandoBiblioteca = false;
      }
    });
  }

  estaEnMateria(document: LibraryDocument): boolean {
    return this.documentosDeMateria.some(item => item.id === document.id);
  }

  agregarDesdeBiblioteca(document: LibraryDocument): void {
    const materia = this.materiaSeleccionada();
    if (!materia || this.estaEnMateria(document)) return;
    this.guardandoDocumentoId = document.id;
    this.documentService.addToMateria(document.id, materia.nombre).subscribe({
      next: () => {
        this.documentosDeMateria = [...this.documentosDeMateria, document];
        this.guardandoDocumentoId = null;
      },
      error: () => {
        this.errorBiblioteca = 'No se pudo añadir el documento a la materia.';
        this.guardandoDocumentoId = null;
      }
    });
  }

  quitarDeMateria(document: LibraryDocument): void {
    const materia = this.materiaSeleccionada();
    if (!materia) return;
    this.documentService.removeFromMateria(document.id, materia.nombre).subscribe({
      next: () => this.documentosDeMateria = this.documentosDeMateria.filter(item => item.id !== document.id),
      error: () => this.errorBiblioteca = 'No se pudo quitar el documento de la materia.'
    });
  }

  descargar(document: LibraryDocument): void {
    this.documentService.download(document.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const anchor = window.document.createElement('a');
        anchor.href = url;
        anchor.download = document.filename;
        anchor.click();
        // Revocar la URL en el mismo tick cancela la descarga en curso: el
        // navegador todavia no ha leido el blob cuando click() retorna.
        setTimeout(() => URL.revokeObjectURL(url), 0);
      },
      error: () => this.errorBiblioteca = 'No se pudo descargar el documento.'
    });
  }

  tamanoLegible(bytes: number): string {
    return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
    this.selectorBibliotecaAbierto = false;
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
    this.materias.update(items => {
      const sinBorrar = items.filter(item => item.id !== materia.id);
      const predefinidas = sinBorrar.filter(item => item.id < 1000);
      // Los ids de las materias propias equivalen a su posicion en el
      // almacenamiento (1000 + indice). Si no se renumeran aqui, borrar una
      // materia propia del medio desalinea los ids del almacen, la siguiente
      // materia creada repite un id vivo y removeMateria acabaria borrando la
      // materia equivocada.
      const propias = sinBorrar
        .filter(item => item.id >= 1000)
        .map((item, index) => ({ ...item, id: 1000 + index }));
      return [...predefinidas, ...propias];
    });
    this.studyData.removeMateria(materia.id);
    if (this.materiaSeleccionada()?.id === materia.id) this.volver();
  }

  eliminarGuardado(documento: SavedDocument, event: MouseEvent): void {
    event.stopPropagation();
    this.studyData.removeSavedDocument(documento.id);
  }
}