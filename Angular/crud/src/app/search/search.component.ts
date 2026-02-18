import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MovieService } from '../services/movie.service';
import { SerieService } from '../services/serie.service';
import { Movie } from '../models/movie.model';
import { Serie } from '../models/serie.model';
import { debounceTime, Subject, forkJoin, takeUntil, distinctUntilChanged, switchMap, finalize } from 'rxjs';

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
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  movieService = inject(MovieService);
  serieService = inject(SerieService);

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(200), // Bajado a 200ms para mayor rapidez
      distinctUntilChanged(),
      switchMap(() => {
        // El loading se activa en los métodos onSearch/onGenre para feedback inmediato
        return this.getFilteredResults().pipe(
          finalize(() => this.loading = false)
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (result) => {
        this.movies = result.movies;
        this.series = result.series;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
      }
    });

    // Carga inicial
    this.loading = true;
    this.triggerSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getFilteredResults() {
    const query = this.searchQuery.trim();
    const genre = this.selectedGenre !== 'all' ? this.selectedGenre : undefined;

    if (query) {
      return forkJoin({
        movies: this.movieService.searchMovies(query, genre),
        series: this.serieService.searchSeries(query, genre)
      });
    } 
    
    if (genre) {
      return forkJoin({
        movies: this.movieService.getMoviesByGenre(genre),
        series: this.serieService.getSeriesByGenre(genre)
      });
    }

    return forkJoin({
      movies: this.movieService.getMovies(),
      series: this.serieService.getSeries()
    });
  }

  private triggerSearch() {
    // Generamos una clave única combinando búsqueda y género
    const searchKey = `${this.searchQuery.trim()}|${this.selectedGenre}`;
    this.searchSubject.next(searchKey);
  }

  onSearchChange(value: string) {
    if (this.searchQuery !== value) {
      this.searchQuery = value;
      this.loading = true; // <-- Feedback visual inmediato al escribir
      this.triggerSearch();
    }
  }

  onGenreChange(value: string) {
    if (this.selectedGenre !== value) {
      this.selectedGenre = value;
      this.loading = true; // <-- Feedback visual inmediato al cambiar género
      this.triggerSearch();
    }
  }

  getGenreLabel(genreValue: string | undefined): string {
    if (!genreValue) return '';
    const genre = this.genres.find(g => g.value === genreValue);
    return genre ? genre.label : genreValue;
  }
}