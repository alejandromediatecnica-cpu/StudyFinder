import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiBaseUrl } from '../config/runtime-config';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly apiUrl = apiBaseUrl();

  constructor(private http: HttpClient) {}

  searchDocuments(term: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?q=${encodeURIComponent(term)}`);
  }
}
