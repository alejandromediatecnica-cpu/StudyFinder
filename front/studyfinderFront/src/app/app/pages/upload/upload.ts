import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudyDataService } from '../../../services/study-data.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.html',
  styleUrl: './upload.css'
})
export class UploadComponent {
  selectedFile = '';
  message = '';

  constructor(private studyData: StudyDataService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedFile = file.name;
    this.studyData.recordUpload(file.name);
    this.message = `${file.name} quedó registrado en tu biblioteca.`;
  }
}
