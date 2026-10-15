import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly base = environment.apiUrl;

  private headers(): HttpHeaders {
    const token = this.auth.getToken();
    if (token) {
      return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }
    return new HttpHeaders();
  }

  /** Perfil del usuario actual. */
  getMe() {
    return this.http.get<any>(`${this.base}/users/me`, { headers: this.headers() });
  }

  search(nombre: string) {
    return this.http.get<any[]>(`${this.base}/users/search`, {
      params: { nombre },
      headers: this.headers(),
    });
  }

  contacts() {
    return this.http.get<any[]>(`${this.base}/contacts/`, { headers: this.headers() });
  }

  incoming() {
    return this.http.get<any[]>(`${this.base}/contacts/requests/incoming`, { headers: this.headers() });
  }

  outgoing() {
    return this.http.get<any[]>(`${this.base}/contacts/requests/outgoing`, { headers: this.headers() });
  }

  sendRequest(usuarioId: string) {
    return this.http.post<any>(
      `${this.base}/contacts/requests`,
      { usuario_id: usuarioId },
      { headers: this.headers() }
    );
  }

  accept(id: string) {
    return this.http.post<void>(
      `${this.base}/contacts/requests/${id}/accept`,
      {},
      { headers: this.headers() }
    );
  }

  reject(id: string) {
    return this.http.post<void>(
      `${this.base}/contacts/requests/${id}/reject`,
      {},
      { headers: this.headers() }
    );
  }

  messages(otroId: string) {
    return this.http.get<any[]>(`${this.base}/messages/${otroId}`, { headers: this.headers() });
  }

  send(otroId: string, texto: string, archivo?: File) {
    const form = new FormData();
    if (texto) form.append('texto', texto);
    if (archivo) form.append('archivo', archivo);
    return this.http.post<any>(`${this.base}/messages/${otroId}`, form, { headers: this.headers() });
  }

  attachmentUrl(path: string): string {
    return `${this.base}/messages/files/${path}`;
  }
}
