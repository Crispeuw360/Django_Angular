import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SerieService } from '../services/serie.service';
import { Serie } from '../models/serie.model';

@Component({
  selector: 'app-serie',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './serie.component.html',
  styleUrl: './serie.component.css'
})
export class SerieComponent implements OnInit {
  private serieService = inject(SerieService);
  private cdr = inject(ChangeDetectorRef);
  series: Serie[] = [];

  ngOnInit(): void {
    this.getSeries();
  }

  getSeries(): void {
    this.serieService.getSeries().subscribe({
      next: (data) => {
        this.series = data;
        this.cdr.detectChanges();
      },
      error: (e) => console.error(e)
    });
  }
}
