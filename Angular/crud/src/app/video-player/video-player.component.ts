import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface EpisodeInfo {
  id?: number;
  title: string;
  season_number: number;
  episode_number: number;
  video?: string;
}

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.css'
})
export class VideoPlayerComponent implements AfterViewInit, OnDestroy {
  @Input() src: string = '';
  @Input() poster: string = '';
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() episodes: EpisodeInfo[] = [];
  @Input() currentEpisodeIndex: number = -1;
  @Input() nextVideoAvailable: boolean = false;
  @Input() totalSeasons: number = 1;
  @Output() close = new EventEmitter<void>();
  @Output() ended = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() selectEpisode = new EventEmitter<number>();

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('progressBar') progressBar!: ElementRef<HTMLDivElement>;

  isPlaying = false;
  isMuted = false;
  isFullscreen = false;
  currentTime = 0;
  duration = 0;
  volume = 1;
  showControls = true;
  showVolumeSlider = false;
  showEpisodeList = false;
  selectedSeason: number = 1;
  
  private controlsTimeout: any;
  private hideControlsDelay = 3000;

  get seasonsArray(): number[] {
    return Array.from({ length: this.totalSeasons }, (_, i) => i + 1);
  }

  get episodesForSelectedSeason(): EpisodeInfo[] {
    return this.episodes.filter(e => e.season_number === this.selectedSeason);
  }

  selectSeason(season: number) {
    this.selectedSeason = season;
  }

  ngAfterViewInit(): void {
    const video = this.videoElement.nativeElement;
    
    video.addEventListener('timeupdate', this.onTimeUpdate.bind(this));
    video.addEventListener('loadedmetadata', this.onLoadedMetadata.bind(this));
    video.addEventListener('ended', this.onEnded.bind(this));
    video.addEventListener('play', () => this.isPlaying = true);
    video.addEventListener('pause', () => this.isPlaying = false);
    
    // Auto play
    video.play().catch(() => {
      // Autoplay was prevented
      this.isPlaying = false;
    });
  }

  ngOnDestroy(): void {
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
    }
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange() {
    this.isFullscreen = !!document.fullscreenElement;
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.videoElement) return;

    switch (event.key.toLowerCase()) {
      case ' ':
      case 'k':
        event.preventDefault();
        this.togglePlay();
        break;
      case 'f':
        event.preventDefault();
        this.toggleFullscreen();
        break;
      case 'm':
        event.preventDefault();
        this.toggleMute();
        break;
      case 'arrowleft':
        event.preventDefault();
        this.seek(-10);
        break;
      case 'arrowright':
        event.preventDefault();
        this.seek(10);
        break;
      case 'arrowup':
        event.preventDefault();
        this.changeVolume(0.1);
        break;
      case 'arrowdown':
        event.preventDefault();
        this.changeVolume(-0.1);
        break;
      case 'escape':
        if (this.isFullscreen) {
          this.toggleFullscreen();
        } else {
          this.onClose();
        }
        break;
    }
  }

  onTimeUpdate() {
    this.currentTime = this.videoElement.nativeElement.currentTime;
  }

  onLoadedMetadata() {
    this.duration = this.videoElement.nativeElement.duration;
  }

  onEnded() {
    this.isPlaying = false;
    this.ended.emit();
  }

  togglePlay() {
    const video = this.videoElement.nativeElement;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  toggleMute() {
    const video = this.videoElement.nativeElement;
    video.muted = !video.muted;
    this.isMuted = video.muted;
  }

  toggleFullscreen() {
    const container = this.videoElement.nativeElement.parentElement;
    
    if (!document.fullscreenElement) {
      container?.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  seek(seconds: number) {
    const video = this.videoElement.nativeElement;
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, this.duration));
  }

  changeVolume(delta: number) {
    const video = this.videoElement.nativeElement;
    this.volume = Math.max(0, Math.min(1, this.volume + delta));
    video.volume = this.volume;
    this.isMuted = this.volume === 0;
  }

  onProgressClick(event: MouseEvent) {
    const bar = this.progressBar.nativeElement;
    const rect = bar.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    this.videoElement.nativeElement.currentTime = pos * this.duration;
  }

  onVolumeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.volume = parseFloat(input.value);
    this.videoElement.nativeElement.volume = this.volume;
    this.isMuted = this.volume === 0;
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00';
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  getProgress(): number {
    return this.duration ? (this.currentTime / this.duration) * 100 : 0;
  }

  onMouseMove() {
    this.showControls = true;
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
    }
    if (this.isPlaying) {
      this.controlsTimeout = setTimeout(() => {
        this.showControls = false;
      }, this.hideControlsDelay);
    }
  }

  onMouseLeave() {
    if (this.isPlaying) {
      this.showControls = false;
    }
  }

  onClose() {
    this.videoElement.nativeElement.pause();
    this.close.emit();
  }

  onNext() {
    this.next.emit();
  }

  onSelectEpisode(index: number) {
    this.selectEpisode.emit(index);
    this.showEpisodeList = false;
  }

  toggleEpisodeList() {
    this.showEpisodeList = !this.showEpisodeList;
  }
}
