import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagesService } from '../../../services/messages.service';

@Component({
  standalone: true,
  selector: 'app-mensajes',
  imports: [CommonModule, FormsModule],
  templateUrl: './mensajes.html',
  styleUrl: './mensajes.css',
})
export class MensajesComponent {
  private readonly ms = inject(MessagesService);

  // La app es zoneless: el estado que llega en callbacks async debe ser signal
  // para que la plantilla se vuelva a renderizar.
  readonly yo = signal<any>(null);
  readonly contactos = signal<any[]>([]);
  readonly entrantes = signal<any[]>([]);
  readonly salientes = signal<any[]>([]);
  readonly activo = signal<any>(null);
  readonly mensajes = signal<any[]>([]);
  readonly mostrarAgregar = signal(false);
  readonly resultados = signal<any[]>([]);
  readonly busco = signal(false);

  texto = '';
  archivo?: File;
  nombreAgregar = '';

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.ms.getMe().subscribe((r: any) => this.yo.set(r));
    this.ms.contacts().subscribe((r: any) => this.contactos.set(r));
    this.ms.incoming().subscribe((r: any) => this.entrantes.set(r));
    this.ms.outgoing().subscribe((r: any) => this.salientes.set(r));
  }

  abrir(contacto: any): void {
    this.abrirConversacion(contacto.otro);
  }

  abrirConversacion(usuario: any): void {
    this.activo.set(usuario);
    this.mensajes.set([]);
    this.ms.messages(usuario.id).subscribe((r: any) => this.mensajes.set(r));
  }

  enviar(): void {
    const activo = this.activo();
    if (!activo) return;
    const texto = this.texto.trim();
    if (!texto && !this.archivo) return;
    this.ms.send(activo.id, texto, this.archivo).subscribe((r: any) => {
      this.mensajes.update(lista => [...lista, r]);
      this.texto = '';
      this.archivo = undefined;
      const input = document.querySelector('#archivo') as HTMLInputElement | null;
      if (input) input.value = '';
    });
  }

  onFile(event: any): void {
    const file = event.target.files?.[0];
    if (file && file.size > 3 * 1024 * 1024) {
      alert('El archivo no debe superar 3 MB');
      event.target.value = '';
      return;
    }
    this.archivo = file;
  }

  abrirAgregar(): void {
    this.mostrarAgregar.update(v => !v);
    this.nombreAgregar = '';
    this.resultados.set([]);
    this.busco.set(false);
  }

  buscar(): void {
    const nombre = this.nombreAgregar.trim();
    this.busco.set(true);
    if (nombre.length < 2) {
      this.resultados.set([]);
      return;
    }
    this.ms.search(nombre).subscribe({
      next: (r: any) => this.resultados.set(r),
      error: () => this.resultados.set([]),
    });
  }

  enviarSolicitud(usuario: any): void {
    this.ms.sendRequest(usuario.id).subscribe({
      next: () => {
        alert('Solicitud enviada');
        this.resultados.update(lista => lista.filter(u => u.id !== usuario.id));
        this.cargar();
      },
      error: (e: any) => alert(e?.error?.detail || 'Error al enviar solicitud'),
    });
  }

  aceptar(id: string): void {
    this.ms.accept(id).subscribe(() => this.cargar());
  }

  rechazar(id: string): void {
    this.ms.reject(id).subscribe(() => this.cargar());
  }

  archivoUrl(path: string): string {
    return this.ms.attachmentUrl(path);
  }
}
