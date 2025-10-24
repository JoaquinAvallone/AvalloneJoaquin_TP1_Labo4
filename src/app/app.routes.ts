import { Routes } from '@angular/router';
import { LogIn } from './components/log-in/log-in';
import { Home } from './components/home/home';
import { QuienSoy } from './components/quien-soy/quien-soy';
import { Registro } from './components/registro/registro';
import { Encuestas } from './components/encuestas/encuestas/encuestas';
import { Ranking } from './components/ranking/ranking/ranking';
import { authGuard } from './guards/authGuard/auth-guard-guard';
import { adminGuard } from './guards/adminGuard/admin-guard-guard';
import { noAuthGuard } from './guards/noAuthGuard/no-auth-guard-guard';
import { ResultadoEncuestas } from './components/resultado-encuestas/resultado-encuestas/resultado-encuestas';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: "full" },
    { path: 'home', component: Home, },
    { path: 'about', component: QuienSoy },
    { path: 'login', component: LogIn, canActivate: [noAuthGuard] },
    { path: 'signup', component: Registro, canActivate: [noAuthGuard] },
    { path: 'juegos', loadChildren: () => import('./modulos/juegos/juegos-module').then(m => m.JuegosModule), canActivate: [authGuard] },
    { path: 'encuestas', component: Encuestas, canActivate: [authGuard] },
    { path: 'ranking', component: Ranking, canActivate: [authGuard] },
    { path: 'resultado-encuestas', loadComponent: () => import('./components/resultado-encuestas/resultado-encuestas/resultado-encuestas').then(m => m.ResultadoEncuestas), canActivate: [adminGuard] },
    { path: '**', redirectTo: '/home', pathMatch: "full" },

];
