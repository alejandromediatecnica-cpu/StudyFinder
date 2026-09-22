import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface StudentProfile {
  initials: string;
  name: string;
  role: string;
  quote: string;
  accent: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class LandingComponent {
  readonly profiles: StudentProfile[] = [
    {
      initials: 'TU',
      name: 'Tu nombre',
      role: 'Coordinación del proyecto',
      quote: 'Una experiencia de estudio pensada para avanzar juntos.',
      accent: 'cyan'
    },
    {
      initials: 'CP',
      name: 'Compañero 01',
      role: 'Diseño y experiencia',
      quote: 'Convertimos la organización diaria en pequeños logros.',
      accent: 'blue'
    },
    {
      initials: 'CP',
      name: 'Compañero 02',
      role: 'Desarrollo',
      quote: 'La tecnología también puede hacer que aprender se sienta ligero.',
      accent: 'violet'
    },
    {
      initials: 'CP',
      name: 'Compañero 03',
      role: 'Contenido y comunidad',
      quote: 'Compartir el camino hace que cada meta esté más cerca.',
      accent: 'green'
    }
  ];

  activeProfile = 0;

  get activeStudent(): StudentProfile {
    return this.profiles[this.activeProfile];
  }

  selectProfile(index: number): void {
    this.activeProfile = index;
  }

  previousProfile(): void {
    this.activeProfile = (this.activeProfile + this.profiles.length - 1) % this.profiles.length;
  }

  nextProfile(): void {
    this.activeProfile = (this.activeProfile + 1) % this.profiles.length;
  }
}
