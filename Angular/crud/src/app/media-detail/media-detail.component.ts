import { Component, inject, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '../services/movie.service';
import { SerieService } from '../services/serie.service';
import { Movie } from '../models/movie.model';
import { Serie, Episode } from '../models/serie.model';
import { CommonModule } from '@angular/common';
import { VideoPlayerComponent } from '../video-player/video-player.component';

@Component({
  selector: 'app-media-detail',
  standalone: true,
  imports: [CommonModule, VideoPlayerComponent],
  templateUrl: './media-detail.component.html',
  styleUrl: './media-detail.component.css'
})
export class MediaDetailComponent implements OnInit {
  item: Movie | Serie | undefined;
  type: 'movie' | 'serie' = 'movie';
  loading = true;
  error: string | null = null;
  selectedEpisode: Episode | null = null;
  selectedEpisodeIndex: number = -1;
  showVideoPlayer = false;
  videoSrc = '';
  videoTitle = '';
  videoSubtitle = '';
  
  @ViewChild('previewVideo') previewVideoRef: ElementRef<HTMLVideoElement> | undefined;
  
  route = inject(ActivatedRoute);
  movieService = inject(MovieService);
  serieService = inject(SerieService);
  cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.type = this.route.snapshot.data['type'];
      
      if (id) {
        this.loading = true;
        this.error = null;
        this.item = undefined;
        this.selectedEpisode = null;
        this.cdr.detectChanges();
        
        if (this.type === 'movie') {
          this.movieService.getMovie(id).subscribe({
            next: (movie) => {
              console.log('Movie loaded:', movie);
              this.item = movie;
              this.loading = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('Error fetching movie:', err);
              this.error = 'Error loading movie.';
              this.loading = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          this.serieService.getSerie(id).subscribe({
            next: (serie) => {
              console.log('Serie loaded:', serie);
              this.item = serie;
              if (serie.episode_list && serie.episode_list.length > 0) {
                 // Optionally select the first episode
                 // this.selectedEpisode = serie.episode_list[0];
              }
              this.loading = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('Error fetching serie:', err);
              this.error = 'Error loading serie.';
              this.loading = false;
              this.cdr.detectChanges();
            }
          });
        }
      } else {
        this.loading = false;
        this.error = 'Invalid ID.';
        this.cdr.detectChanges();
      }
    });
  }

  isSerie(item: Movie | Serie): item is Serie {
    return (item as Serie).seasons !== undefined;
  }

  selectEpisode(episode: Episode) {
    this.selectedEpisode = episode;
    if (this.item && this.isSerie(this.item) && this.item.episode_list) {
      this.selectedEpisodeIndex = this.item.episode_list.findIndex(e => e.id === episode.id);
    }
  }

  getSeasonsArray(serie: Movie | Serie): number[] {
    if (!this.isSerie(serie)) return [];
    return Array.from({length: serie.seasons}, (_, i) => i + 1);
  }

  getEpisodesForSeason(serie: Movie | Serie, season: number): Episode[] {
    if (!this.isSerie(serie)) return [];
    return serie.episode_list ? serie.episode_list.filter(e => e.season_number === season) : [];
  }

  scrollToVideo() {
    const videoSection = document.getElementById('video-section');
    if (videoSection) {
      videoSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onEpisodeHover(episode: Episode) {
    // Video preview will be handled by CSS hover and the video element's properties
  }

  onEpisodeLeave() {
    // Stop any preview video if needed
  }

  openVideoPlayer() {
    if (!this.item) return;
    
    if (this.isSerie(this.item) && this.selectedEpisode) {
      this.videoSrc = this.selectedEpisode.video || '';
      this.videoTitle = this.selectedEpisode.title;
      this.videoSubtitle = `S${this.selectedEpisode.season_number} E${this.selectedEpisode.episode_number}`;
    } else if (!this.isSerie(this.item)) {
      this.videoSrc = this.item.video || '';
      this.videoTitle = this.item.title;
      this.videoSubtitle = `${this.item.year}`;
    }
    
    if (this.videoSrc) {
      this.showVideoPlayer = true;
    }
  }

  closeVideoPlayer() {
    this.showVideoPlayer = false;
  }

  onNextEpisode() {
    if (!this.item || !this.isSerie(this.item)) return;
    
    const episodes = this.item.episode_list;
    if (!episodes || this.selectedEpisodeIndex >= episodes.length - 1) return;
    
    const nextEpisode = episodes[this.selectedEpisodeIndex + 1];
    this.selectedEpisode = nextEpisode;
    this.selectedEpisodeIndex = this.selectedEpisodeIndex + 1;
    this.videoSrc = nextEpisode.video || '';
    this.videoTitle = nextEpisode.title;
    this.videoSubtitle = `S${nextEpisode.season_number} E${nextEpisode.episode_number}`;
  }

  onSelectEpisodeFromPlayer(index: number) {
    if (!this.item || !this.isSerie(this.item)) return;
    
    const episodes = this.item.episode_list;
    if (!episodes || index < 0 || index >= episodes.length) return;
    
    const episode = episodes[index];
    this.selectedEpisode = episode;
    this.selectedEpisodeIndex = index;
    this.videoSrc = episode.video || '';
    this.videoTitle = episode.title;
    this.videoSubtitle = `S${episode.season_number} E${episode.episode_number}`;
  }

  hasNextEpisode(): boolean {
    if (!this.item || !this.isSerie(this.item)) return false;
    const episodes = this.item.episode_list;
    return episodes ? this.selectedEpisodeIndex < episodes.length - 1 : false;
  }

  getEpisodesForPlayer() {
    if (!this.item || !this.isSerie(this.item)) return [];
    return this.item.episode_list || [];
  }
}
