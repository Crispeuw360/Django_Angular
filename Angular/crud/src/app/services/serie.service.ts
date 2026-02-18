import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Serie } from '../models/serie.model';

@Injectable({
  providedIn: 'root'
})
export class SerieService {
  private apiUrl = 'http://localhost:8000/series/';
  private http = inject(HttpClient);

  getSeries(): Observable<Serie[]> {
    return this.http.get<Serie[]>(this.apiUrl);
  }

  getSerie(id: number): Observable<Serie> {
    return this.http.get<Serie>(`${this.apiUrl}${id}/`);
  }

  searchSeries(query: string): Observable<Serie[]> {
    return this.http.get<Serie[]>(`${this.apiUrl}?search=${encodeURIComponent(query)}`);
  }

  createSerie(serie: Serie): Observable<Serie> {
    return this.http.post<Serie>(this.apiUrl, serie);
  }

  updateSerie(serie: Serie): Observable<Serie> {
    return this.http.put<Serie>(`${this.apiUrl}${serie.id}/`, serie);
  }

  deleteSerie(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
