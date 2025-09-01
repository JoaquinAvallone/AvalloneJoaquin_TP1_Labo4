import { Routes } from '@angular/router';
import { LogIn } from './components/log-in/log-in';
import { Home } from './components/home/home';
import { QuienSoy } from './components/quien-soy/quien-soy';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: "full" },
    { path: 'home', component: Home, },
    { path: 'login', component: LogIn },
    { path: 'about', component: QuienSoy },
    //path: 'perfil', component: Perfil },
    //path: 'juegos', component: Juegos },
    { path: '**', redirectTo: '/home', pathMatch: "full" },

];
