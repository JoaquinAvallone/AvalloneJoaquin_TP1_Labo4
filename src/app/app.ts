import { Component, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Home } from './components/home/home';
import { LogIn } from './components/log-in/log-in';
import { QuienSoy } from './components/quien-soy/quien-soy';

@Component({
  selector: 'app-root',
  imports: [RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('SalaDeJuegos');
}







