import { Component, ElementRef, HostListener, computed, input, model, output, signal } from '@angular/core';

interface CeldaCalendario {
  iso: string;
  dia: number;
  otroMes: boolean;
  hoy: boolean;
  seleccionada: boolean;
}

/**
 * Selector de fecha con la decoracion de la pagina en lugar del `<input
 * type="date">` nativo, que se ve igual en todos los sistemas y rompe el tema.
 * Es un `model()` para poder usarse con [(ngModel)] igual que un input normal.
 */
@Component({
  selector: 'app-date-picker',
  standalone: true,
  template: `
    <div class="dp">
      <button type="button" class="dp-trigger" [class.filled]="!!value()" (click)="toggle()" [attr.aria-expanded]="open()">
        <span class="dp-icon">▦</span>
        <span class="dp-value" [class.placeholder]="!value()">{{ value() || placeholder() }}</span>
        <span class="dp-caret">▾</span>
      </button>

      @if (value()) {
        <button type="button" class="dp-clear" (click)="clear()" aria-label="Quitar fecha">×</button>
      }

      @if (open()) {
        <div class="dp-pop" role="dialog" aria-label="Calendario">
          <div class="dp-head">
            <button type="button" class="dp-nav" (click)="moverMes(-1)" aria-label="Mes anterior">‹</button>
            <strong>{{ nombreMes() }} {{ anio() }}</strong>
            <button type="button" class="dp-nav" (click)="moverMes(1)" aria-label="Mes siguiente">›</button>
          </div>

          <div class="dp-weekdays">
            @for (dia of weekdays; track dia) { <span>{{ dia }}</span> }
          </div>

          <div class="dp-grid">
            @for (celda of celdas(); track celda.iso) {
              <button
                type="button"
                class="dp-day"
                [class.otro]="celda.otroMes"
                [class.hoy]="celda.hoy"
                [class.sel]="celda.seleccionada"
                (click)="elegir(celda.iso)"
              >{{ celda.dia }}</button>
            }
          </div>

          <div class="dp-foot">
            <button type="button" class="dp-today" (click)="hoy()">Hoy</button>
            <button type="button" class="dp-today" (click)="manana()">Mañana</button>
            <button type="button" class="dp-today" (click)="cerrar()">Cerrar</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .dp { position: relative; display: flex; align-items: center; gap: 6px; }
      .dp-trigger {
        flex: 1; min-width: 0; display: flex; align-items: center; gap: 9px; height: 40px; padding: 0 12px;
        border: 1px solid var(--border); border-radius: 12px; background: var(--surface-soft);
        color: var(--text); font-size: 12px; cursor: pointer; text-align: left; transition: .18s;
      }
      .dp-trigger:hover { border-color: rgba(105, 207, 255, .45); background: rgba(255, 255, 255, .08); }
      .dp-trigger.filled { background: rgba(79, 140, 255, .14); border-color: rgba(105, 207, 255, .35); }
      .dp-icon { color: #69cfff; font-size: 13px; }
      .dp-value { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .dp-value.placeholder { color: #7d8aa3; }
      .dp-caret { color: #7d8aa3; font-size: 10px; }
      .dp-clear {
        position: absolute; right: 30px; width: 20px; height: 20px; border-radius: 50%;
        background: rgba(255, 255, 255, .08); color: #cbd5e7; font-size: 12px; cursor: pointer;
      }
      .dp-clear:hover { background: rgba(255, 107, 129, .25); color: white; }
      .dp-pop {
        position: absolute; z-index: 40; top: calc(100% + 8px); left: 0; width: 250px; padding: 14px;
        border: 1px solid rgba(105, 207, 255, .22); border-radius: 18px;
        background: linear-gradient(145deg, rgba(20, 32, 62, .97), rgba(8, 15, 33, .97));
        box-shadow: 0 26px 60px rgba(0, 0, 0, .5); backdrop-filter: blur(18px);
      }
      .dp-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
      .dp-head strong { font-size: 12px; letter-spacing: .01em; }
      .dp-nav {
        width: 26px; height: 26px; border-radius: 9px; border: 1px solid var(--border);
        background: rgba(255, 255, 255, .05); color: #cbd5e7; font-size: 14px; cursor: pointer;
      }
      .dp-nav:hover { background: rgba(79, 140, 255, .2); color: white; }
      .dp-weekdays, .dp-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
      .dp-weekdays { margin-bottom: 5px; }
      .dp-weekdays span { text-align: center; color: #6f7d96; font-size: 9px; font-weight: 800; letter-spacing: .08em; }
      .dp-day {
        height: 28px; border-radius: 8px; background: transparent; color: #cbd5e7;
        font-size: 11px; cursor: pointer; transition: .14s;
      }
      .dp-day:hover { background: rgba(79, 140, 255, .22); color: white; }
      .dp-day.otro { color: #4d5a72; }
      .dp-day.hoy { border: 1px solid rgba(105, 207, 255, .5); color: #69cfff; }
      .dp-day.sel {
        background: linear-gradient(135deg, #5caeff, #376cf5); color: white;
        box-shadow: 0 6px 16px rgba(57, 112, 255, .4);
      }
      .dp-foot { display: flex; gap: 6px; margin-top: 11px; padding-top: 10px; border-top: 1px solid var(--border); }
      .dp-today {
        flex: 1; height: 28px; border: 1px solid var(--border); border-radius: 9px;
        background: rgba(255, 255, 255, .04); color: #a9b7cd; font-size: 10px; cursor: pointer;
      }
      .dp-today:hover { background: rgba(92, 174, 255, .18); color: white; }
    `,
  ],
})
export class DatePickerComponent {
  readonly value = model<string>('');
  readonly placeholder = input('Sin fecha');
  readonly label = input('Fecha');
  readonly changed = output<string>();

  readonly open = signal(false);
  readonly cursor = signal<Date>(this.inicioDeMes(new Date()));
  readonly weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  readonly meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  readonly anio = computed(() => this.cursor().getFullYear());
  readonly nombreMes = computed(() => this.meses[this.cursor().getMonth()]);

  readonly celdas = computed<CeldaCalendario[]>(() => {
    const cursor = this.cursor();
    const primera = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    // La semana arranca en lunes, igual que el calendario principal.
    const desplazamiento = (primera.getDay() + 6) % 7;
    const inicio = new Date(primera);
    inicio.setDate(primera.getDate() - desplazamiento);
    const hoyIso = this.aIso(new Date());
    const elegido = this.value();

    return Array.from({ length: 42 }, (_, i) => {
      const dia = new Date(inicio);
      dia.setDate(inicio.getDate() + i);
      const iso = this.aIso(dia);
      return {
        iso,
        dia: dia.getDate(),
        otroMes: dia.getMonth() !== cursor.getMonth(),
        hoy: iso === hoyIso,
        seleccionada: iso === elegido
      };
    });
  });

  constructor(private host: ElementRef<HTMLElement>) {}

  @HostListener('document:click', ['$event'])
  onClickFuera(event: MouseEvent): void {
    if (!this.open()) return;
    if (!this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }

  toggle(): void {
    if (this.open()) {
      this.open.set(false);
      return;
    }
    // Al abrir, el calendario muestra el mes de la fecha elegida o el actual.
    this.cursor.set(this.value() ? this.inicioDeMes(this.desDeIso(this.value())) : this.inicioDeMes(new Date()));
    this.open.set(true);
  }

  cerrar(): void {
    this.open.set(false);
  }

  elegir(iso: string): void {
    this.value.set(iso);
    this.changed.emit(iso);
    this.open.set(false);
  }

  clear(): void {
    this.value.set('');
    this.changed.emit('');
  }

  hoy(): void {
    this.elegir(this.aIso(new Date()));
  }

  manana(): void {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    this.elegir(this.aIso(manana));
  }

  moverMes(delta: number): void {
    const cursor = this.cursor();
    this.cursor.set(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
  }

  private inicioDeMes(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private aIso(date: Date): string {
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${mes}-${dia}`;
  }

  private desDeIso(iso: string): Date {
    const [anio, mes, dia] = iso.split('-').map(Number);
    return new Date(anio, (mes || 1) - 1, dia || 1);
  }
}
