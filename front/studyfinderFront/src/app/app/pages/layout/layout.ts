import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SearchService } from '../../../services/search.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class LayoutComponent implements OnInit, OnDestroy {
  @ViewChild('searchBox') searchBox!: ElementRef;

  searchTerm: string = '';
  searchQuery: string = '';
  results: any[] = [];
  searchResults: any[] = [];
  isLoading: boolean = false;
  searching: boolean = false;
  showResults: boolean = false;
  error: string | null = null;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(public searchService: SearchService, private elementRef: ElementRef) {}

  ngOnInit(): void {
    // Configurar búsqueda en tiempo real con debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(term => term.trim().length > 0),
      switchMap(term => {
        this.searching = true;
        this.showResults = true;
        this.error = null;
        return this.searchService.searchDocuments(term);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => {
        this.results = Array.isArray(response) ? response : response?.results || response?.items || [];
        this.searchResults = this.results;
        this.searching = false;
        this.error = this.searchResults.length === 0 ? 'No encontramos resultados.' : null;
        console.log('Artículos vinculados:', this.searchResults);
      },
      error: (error: any) => {
        console.error('Fallo en búsqueda:', error);
        this.searching = false;
        this.error = 'No se pudo realizar la búsqueda.';
        this.searchResults = [];
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
      this.showResults = false;
      this.searchResults = [];
      this.error = null;
      return;
    }

    this.searchSubject.next(term);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }

  // Cerrar resultados cuando se hace click fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    if (!this.elementRef.nativeElement.contains(target)) {
      this.showResults = false;
    }
  }

  search(): void {
    const term = (this.searchQuery || this.searchTerm || '').trim();

    if (!term) {
      this.showResults = false;
      this.searchResults = [];
      this.error = null;
      return;
    }

    this.searchSubject.next(term);
  }
}