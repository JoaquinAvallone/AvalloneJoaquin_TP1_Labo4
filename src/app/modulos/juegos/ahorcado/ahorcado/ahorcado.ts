import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../../servicios/notification/notification';
import { PuntajesService } from '../../../../servicios/puntajes/puntajes';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ahorcado',
  standalone: false,
  templateUrl: './ahorcado.html',
  styleUrls: ['./ahorcado.scss']
})
export class AhorcadoComponent implements OnInit {

  http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private puntajesService = inject(PuntajesService);
  private router = inject(Router);

  apiUrl: string = "https://random-word-api.herokuapp.com/word";
  message: string = "";
  imageCounter: number = 1;
  loading: boolean = false;
  word: string = "";
  gameOver: boolean = false;
  keysPressed: string[] = [];
  score: number = 10;
  maxScore: number = 10;

  minLength: number = 5;
  maxLength: number = 10;

  keyboard: string[][] = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  ngOnInit() {
    this.getRandomWord();
  }

  async getRandomWord() {
    try {
      this.loading = true;
      
      const longitud = Math.floor(Math.random() * (this.maxLength - this.minLength + 1)) + this.minLength;
      
      const url = `${this.apiUrl}?number=1&length=${longitud}&lang=es`;
      
      const observable = this.http.get(url);
      const response: any = await firstValueFrom(observable);
      
      if (response && response[0]) {
        this.word = this.convertWord(response[0]);
        console.log('Palabra:', this.word);
      } else {
        throw new Error('La API no devolvió palabras');
      }
      
    } 
    catch (error: any) {
      console.log('Usando palabras locales');
      const palabrasLocales = ['ANGULAR', 'COMPUTADORA', 'PROGRAMACION', 'JAVASCRIPT', 'AHORCADO'];
      const randomIndex = Math.floor(Math.random() * palabrasLocales.length);
      this.word = palabrasLocales[randomIndex];
      
      this.notificationService.showAlert('El servicio de palabras no está disponible. Usando palabras locales.', 'warning');
    }
    finally {
      this.loading = false;
    }
  }

  convertWord(word: string): string {
    return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  }

  handleKeyPress(key: string) {
    if (this.gameOver) return;

    if (!this.keysPressed.includes(key)) {
      if (!this.word.includes(key)) {
        this.imageCounter++;
        this.score--; // ← Restar 1 punto por error
      }
      this.keysPressed.push(key);
      this.checkWinner();
    }
  }

  checkWinner() {
    if (this.imageCounter == 7) {
      this.message = "¡PERDISTE!<br>La palabra era: " + this.word;
      this.gameOver = true;
      this.finishGame('defeat');
    }
    else if(this.word.split('').every(key => this.keysPressed.includes(key))) {
      // Asegurar que el score no sea negativo
      this.score = Math.max(0, this.score);
      this.imageCounter = 8;
      this.message = `¡GANASTE!<br>Puntuación: ${this.score}/10`;
      this.gameOver = true;
      this.finishGame('victory');
    }
  }

  private async finishGame(result: 'victory' | 'defeat') {
    if (result === 'victory') {
      try {
        await this.puntajesService.guardarPuntaje('ahorcado', this.score);
        console.log('Puntaje guardado exitosamente');
      } catch (error) {
        console.error('Error al guardar el puntaje:', error);
        this.notificationService.showAlert('Error al guardar la puntuación en la base de datos', 'error');
      }
    } else {
      // En caso de derrota, no guardar puntaje (score = 0)
      this.score = 0;
    }
  }

  volverAlHome() {
    this.router.navigate(['/home']);
  }

  endGame() {
    this.message = "";
    this.imageCounter = 1;
    this.word = "";
    this.gameOver = false;
    this.keysPressed = [];
    this.score = 10; // ← Reiniciar a 10 puntos
  }

  async resetGame() {
    this.endGame();
    await this.getRandomWord();
  }

  getDisplayWord(): string {
    return this.word.split('').map(letra => 
      this.keysPressed.includes(letra) ? letra : '_'
    ).join(' ');
  }

  // Método para calcular errores cometidos
  getErroresCometidos(): number {
    return this.keysPressed.filter(key => !this.word.includes(key)).length;
  }
}