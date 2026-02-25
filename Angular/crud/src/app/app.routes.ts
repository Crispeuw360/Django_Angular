import { Routes } from '@angular/router';
import { MovieComponent } from './movie/movie.component';
import { SerieComponent } from './serie/serie.component';
import { MediaDetailComponent } from './media-detail/media-detail.component';
import { SearchComponent } from './search/search.component';
import { LoginComponent } from './auth/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'movies', component: MovieComponent, canActivate: [authGuard] },
    { path: 'series', component: SerieComponent, canActivate: [authGuard] },
    { path: 'movie/:id', component: MediaDetailComponent, canActivate: [authGuard], data: { type: 'movie' } },
    { path: 'serie/:id', component: MediaDetailComponent, canActivate: [authGuard], data: { type: 'serie' } },
    { path: 'search', component: SearchComponent, canActivate: [authGuard] },
    { path: '', redirectTo: '/movies', pathMatch: 'full' }
];
