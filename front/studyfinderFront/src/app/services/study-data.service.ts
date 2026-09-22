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

interface StudyData {
  searches: number;
  savedDocuments: SavedDocument[];
  uploadedFiles: string[];
  studySessions: number;
}

@Injectable({ providedIn: 'root' })
export class StudyDataService {
  private readonly prefix = 'studyfinder_data_';

  private key(): string {
    const user = typeof localStorage === 'undefined' ? null : localStorage.getItem('studyfinder_user');
    const parsed = user ? JSON.parse(user) : null;
    return `${this.prefix}${parsed?.id || 'guest'}`;
  }

  private read(): StudyData {
    if (typeof localStorage === 'undefined') return this.empty();
    const stored = localStorage.getItem(this.key());
    return stored ? JSON.parse(stored) as StudyData : this.empty();
  }

  private write(data: StudyData): void {
    if (typeof localStorage !== 'undefined') localStorage.setItem(this.key(), JSON.stringify(data));
  }

  private empty(): StudyData {
    return { searches: 0, savedDocuments: [], uploadedFiles: [], studySessions: 0 };
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
}
