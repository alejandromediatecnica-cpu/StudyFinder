import { Component, computed, inject } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';

@Component({
  standalone: true,
  selector: 'app-configuracion',
  imports: [],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css',
})
export class ConfiguracionComponent {
  private readonly themeService = inject(ThemeService);

  protected readonly darkTheme = computed(() => this.themeService.theme() === 'dark');

  protected alternarTema(): void {
    this.themeService.toggle();
  }
}
