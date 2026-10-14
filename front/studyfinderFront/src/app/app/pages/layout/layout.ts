import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SearchService } from '../../../services/search.service';
import { AuthService, AuthUser } from '../../../services/auth.service';
import { StudyDataService } from '../../../services/study-data.service';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class LayoutComponent implements OnInit, OnDestroy {
  @ViewChild('searchContainer') searchContainer!: ElementRef;

  searchQuery: string = '';
  // Estados asincronos: deben ser signals porque la app corre sin zone.js.
  searching = signal(false);
  showResults = signal(false);
  error = signal<string | null>(null);
  searchResults = signal<any[]>([]);
  user: AuthUser | null = null;
  profileMenuOpen = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    public searchService: SearchService,
    private authService: AuthService,
    private studyData: StudyDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.searchSubject.pipe(
      debounceTime(250),
      switchMap(term => {
        if (!term.trim()) {
          this.searching.set(false);
          this.showResults.set(false);
          this.searchResults.set([]);
          this.error.set(null);
          return of([]);
        }
        this.studyData.recordSearch();
        this.searching.set(true);
        this.showResults.set(true);
        this.error.set(null);
        return this.searchService.searchDocuments(term).pipe(
          catchError(() => {
            this.searching.set(false);
            this.error.set('No se pudo realizar la búsqueda.');
            return of(null);
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => {
        if (response === null) return;
        const list = Array.isArray(response) ? response : response?.results || response?.items || [];
        this.searchResults.set(list);
        this.searching.set(false);
        this.error.set(list.length === 0 ? 'No encontramos resultados.' : null);
      },
      error: (err: any) => {
        this.searching.set(false);
        this.error.set('No se pudo realizar la búsqueda.');
        this.searchResults.set([]);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(term: string): void {
    this.searchQuery = term;

    if (!term.trim()) {
      this.searching.set(false);
      this.showResults.set(false);
      this.searchResults.set([]);
      this.error.set(null);
      return;
    }

    this.searchSubject.next(term);
    this.searching.set(true);
    this.showResults.set(true);
  }

  // Cerrar resultados cuando se hace click fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!this.searchContainer?.nativeElement.contains(target)) {
      this.showResults.set(false);
      this.profileMenuOpen = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  toggleProfileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.profileMenuOpen = !this.profileMenuOpen;
  }
}