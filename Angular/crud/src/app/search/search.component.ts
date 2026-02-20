import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MovieService } from '../services/movie.service';
import { SerieService } from '../services/serie.service';
import { Movie } from '../models/movie.model';
import { Serie } from '../models/serie.model';
import { debounceTime, Subject, forkJoin, takeUntil, switchMap, tap, of, catchError } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit, OnDestroy {
  searchQuery = '';
  selectedGenre = 'all';
  movies: Movie[] = [];
  series: Serie[] = [];
  loading = false;
  
  genres = [
  { value: 'all', label: 'All Genres' },
  { value: 'action', label: 'Action' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'drama', label: 'Drama' },
  { value: 'horror', label: 'Horror' },
  { value: 'sci-fi', label: 'Sci-Fi' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'romance', label: 'Romance' },
  { value: 'animation', label: 'Animation' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'mystery', label: 'Mystery' },
];
  
  private trigger$ = new Subject<void>();
  private destroy$ = new Subject<void>();
  
  movieService = inject(MovieService);
  serieService = inject(SerieService);
  // Inyectamos el detector de cambios para forzar la actualización visual
  cd = inject(ChangeDetectorRef); 

  ngOnInit(): void {
    this.trigger$.pipe(
      // 1. Activamos loading INMEDIATAMENTE al escribir (antes del debounce)
      tap(() => {
        this.loading = true;
        // Forzamos a Angular a mostrar el spinner YA
        this.cd.markForCheck(); 
      }),
      
      debounceTime(300), 

      switchMap(() => {
        const query = this.searchQuery.trim();
        const genre = this.selectedGenre;

        // Selección de estrategia
        let request$;
        if (query.length > 0) {
          const filterGenre = genre !== 'all' ? genre : undefined;
          request$ = forkJoin({
            movies: this.movieService.searchMovies(query, filterGenre),
            series: this.serieService.searchSeries(query, filterGenre)
          });
        } else if (genre !== 'all') {
          request$ = forkJoin({
            movies: this.movieService.getMoviesByGenre(genre),
            series: this.serieService.getSeriesByGenre(genre)
          });
        } else {
          request$ = forkJoin({
            movies: this.movieService.getMovies(),
            series: this.serieService.getSeries()
          });
        }

        // Devolvemos la petición protegida
        return request$.pipe(
          catchError(err => {
            console.error('Error:', err);
            return of({ movies: [], series: [] });
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (result) => {
        this.movies = result.movies;
        this.series = result.series;
        this.loading = false;
        // ¡LA CLAVE! Le decimos a Angular: "He terminado, actualiza la vista ahora mismo"
        this.cd.markForCheck(); 
      },
      error: () => {
        this.loading = false;
        this.cd.markForCheck();
      }
    });

    // Carga inicial
    this.trigger$.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(value: string) {
    this.searchQuery = value;
    this.trigger$.next();
  }

  onGenreChange(value: string) {
    this.selectedGenre = value;
    this.trigger$.next();
  }

  getGenreLabel(genreValue: string | undefined): string {
    if (!genreValue) return '';
    const genre = this.genres.find(g => g.value === genreValue);
    return genre ? genre.label : genreValue;
  }
}