import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DocumentService } from '../../../services/document.service';
import { StudyDataService } from '../../../services/study-data.service';
import { mensajeDeErrorBackend } from '../../../utils/backend-error';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './upload.html',
  styleUrl: './upload.css'
})
export class UploadComponent {
  // Sin esta referencia, tras una subida correcta el <input type="file"> conserva
  // el valor anterior y el evento change no vuelve a dispararse al elegir el
  // mismo archivo otra vez.
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  selectedFile: File | null = null;
  // Cambian dentro de subscribe (asincrono): sin zone.js deben ser signals.
  message = signal('');
  uploading = signal(false);
  error = signal('');

  constructor(private documents: DocumentService, private studyData: StudyDataService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedFile = file;
    this.message.set('');
    this.error.set('');
  }

  upload(): void {
    if (!this.selectedFile || this.uploading()) return;
    this.uploading.set(true);
    this.error.set('');
    this.documents.upload(this.selectedFile).subscribe({
      next: document => {
        this.message.set(`${document.filename} se guardó en tu biblioteca.`);
        this.studyData.recordUpload(document.filename);
        this.selectedFile = null;
        this.uploading.set(false);
        if (this.fileInput) this.fileInput.nativeElement.value = '';
      },
      error: response => {
        this.error.set(
          mensajeDeErrorBackend(response) || 'No se pudo guardar el archivo. Comprueba tu sesión y vuelve a intentarlo.'
        );
        this.uploading.set(false);
      }
    });
  }
}
