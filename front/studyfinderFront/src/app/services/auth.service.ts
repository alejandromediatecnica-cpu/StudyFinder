import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, timeout } from 'rxjs';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8000/auth';

  constructor(private http: HttpClient) {}

  signup(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, { name, email, password }).pipe(
      timeout(10000),
      tap(response => this.storeSession(response))
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      timeout(10000),
      tap(response => this.storeSession(response))
    );
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem('studyfinder_token');
  }

  getUser(): AuthUser | null {
    if (typeof localStorage === 'undefined') return null;
    const storedUser = localStorage.getItem('studyfinder_user');
    return storedUser ? JSON.parse(storedUser) as AuthUser : null;
  }

  logout(): void {
    localStorage.removeItem('studyfinder_token');
    localStorage.removeItem('studyfinder_user');
  }

  private storeSession(response: AuthResponse): void {
    localStorage.setItem('studyfinder_token', response.token);
    localStorage.setItem('studyfinder_user', JSON.stringify(response.user));
  }
}
