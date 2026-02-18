import { Routes } from '@angular/router';
import { MovieComponent } from './movie/movie.component';
import { SerieComponent } from './serie/serie.component';
import { MediaDetailComponent } from './media-detail/media-detail.component';
import { SearchComponent } from './search/search.component';

export const routes: Routes = [
    { path: 'movies', component: MovieComponent },
    { path: 'series', component: SerieComponent },
    { path: 'movie/:id', component: MediaDetailComponent, data: { type: 'movie' } },
    { path: 'serie/:id', component: MediaDetailComponent, data: { type: 'serie' } },
    { path: 'search', component: SearchComponent },
    { path: '', redirectTo: '/movies', pathMatch: 'full' }
];
