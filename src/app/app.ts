import { Component, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Header } from "./components/header/header";
import { Footer } from './components/footer/footer';


@Component({
  selector: 'app-root',
  imports: [RouterModule, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('SalaDeJuegos');
}







