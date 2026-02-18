import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MovieService } from '../services/movie.service';
import { SerieService } from '../services/serie.service';
import { Movie } from '../models/movie.model';
import { Serie } from '../models/serie.model';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  searchQuery = '';
  movies: Movie[] = [];
  series: Serie[] = [];
  loading = false;
  hasSearched = false;
  
  private searchSubject = new Subject<string>();
  
  movieService = inject(MovieService);
  serieService = inject(SerieService);

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(query => {
      if (query.trim()) {
        this.performSearch(query);
      } else {
        this.clearResults();
      }
    });
  }

  onSearchInput() {
    this.searchSubject.next(this.searchQuery);
  }

  performSearch(query: string) {
    this.loading = true;
    this.hasSearched = true;
    
    this.movieService.searchMovies(query).subscribe({
      next: (movies) => {
        this.movies = movies;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error searching movies:', err);
        this.loading = false;
      }
    });

    this.serieService.searchSeries(query).subscribe({
      next: (series) => {
        this.series = series;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error searching series:', err);
        this.loading = false;
      }
    });
  }

  clearResults() {
    this.movies = [];
    this.series = [];
    this.hasSearched = false;
  }

  isSerie(item: Movie | Serie): item is Serie {
    return (item as Serie).seasons !== undefined;
  }
}
