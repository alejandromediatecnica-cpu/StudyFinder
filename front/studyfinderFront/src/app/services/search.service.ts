import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  searchDocuments(term: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?q=${encodeURIComponent(term)}`);
  }
}
