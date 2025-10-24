import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from '../../../../servicios/notification/notification';
import { PuntajesService } from '../../../../servicios/puntajes/puntajes';

@Component({
  selector: 'app-mayor-menor',
  standalone: false,
  templateUrl: './mayor-menor.html',
  styleUrls: ['./mayor-menor.scss']
})
export class MayorMenorComponent implements OnInit {

  http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private puntajesService = inject(PuntajesService);
  private router = inject(Router);

  apiUrl: string = "https://www.deckofcardsapi.com/api/deck/"

  deckOfCards: any = {};
  currentCard: any = {};
  nextCard: any = {};
  allCards: any[] = [];
  currentCardIndex: number = 0;

  message: string = "";
  score: number = 0;
  life: number = 5;
  loading: boolean = false;
  apiError: boolean = false;
  showErrorEffect: boolean = false;
  gameFinished: boolean = false;

  ngOnInit() {
    this.getDeckOfCards();
  }

  async getDeckOfCards(decks: number = 1) {
    try {
      this.loading = true;
      this.apiError = false;
      this.gameFinished = false;
      const url = this.apiUrl + 'new/shuffle/?deck_count=' + decks;
      const observable = this.http.get(url);
      const response: any = await firstValueFrom(observable);
      this.deckOfCards = response;
      console.log('Mazo creado:', this.deckOfCards);
      
      await this.drawAllCards();
    } 
    catch (error: any) {
      console.error('Error con API de cartas:', error);
      this.apiError = true;
      this.notificationService.showAlert('El servicio de cartas no está disponible en este momento. Por favor, intenta más tarde.', 'error');
    }
    finally {
      this.loading = false;
    }
  }

  async drawAllCards() {
    try {
      const url = this.apiUrl + this.deckOfCards.deck_id + '/draw/?count=52';
      const observable = this.http.get(url);
      const response: any = await firstValueFrom(observable);
      this.allCards = response.cards;
      this.currentCard = {
        cards: [this.allCards[0]],
        remaining: this.allCards.length - 1
      };
      this.currentCardIndex = 0;
      console.log(`✅ ${this.allCards.length} cartas cargadas`);
    } 
    catch (error: any) {
      console.error('Error al obtener cartas:', error);
      this.apiError = true;
      this.notificationService.showAlert('Error al obtener las cartas. Por favor, intenta más tarde.', 'error');
    }
  }

  getNextCard() {
    this.currentCardIndex++;
    
    if (this.currentCardIndex < this.allCards.length) {
      this.nextCard = {
        cards: [this.allCards[this.currentCardIndex]],
        remaining: this.allCards.length - this.currentCardIndex - 1
      };
      return true;
    }
    return false;
  }

  getCardValue(value: string): number {
    const cardValues: { [key: string]: number } = {
      "ACE": 1,
      "KING": 13,
      "QUEEN": 12,
      "JACK": 11
    };
    return cardValues[value] || parseInt(value);
  }

  async checkWinner(isHigher: boolean) {
    if (this.apiError || this.gameFinished) return;

    this.loading = true;

    try {
      const hasNextCard = this.getNextCard();
      
      if (!hasNextCard || !this.nextCard.cards) {
        this.finishGame('victory');
        return;
      }

      const currentValue = this.getCardValue(this.currentCard.cards[0].value);
      const nextValue = this.getCardValue(this.nextCard.cards[0].value);

      if (currentValue === nextValue) {
        this.message = `${currentValue} es igual que ${nextValue} ¡SAFASTE!`;
        this.currentCard = this.nextCard;
        return;
      }
    
      const isCorrect = (isHigher && nextValue > currentValue) || (!isHigher && nextValue < currentValue);
    
      if (isCorrect) {
        this.message = `¡CORRECTO! ${nextValue} es ${isHigher ? 'mayor' : 'menor'} que ${currentValue}`;
        this.score++;
      } else {
        this.message = `¡INCORRECTO! ${nextValue} no es ${isHigher ? 'mayor' : 'menor'} que ${currentValue}`;
        this.life--;
        
        this.showErrorEffect = true;
        setTimeout(() => {
          this.showErrorEffect = false;
        }, 500);

        if (this.life <= 0) {
          this.finishGame('defeat');
          return;
        }
      }

      this.currentCard = this.nextCard;

      if (this.currentCard.remaining === 0) {
        this.finishGame('victory');
      }

    } catch (error) {
      console.log('Error en checkWinner:', error);
    } finally {
      this.loading = false;
    }
  }

  private async finishGame(result: 'victory' | 'defeat') {
    this.gameFinished = true;
    
    if (result === 'victory') {
      this.message = `¡Completaste todo el mazo!<br>Puntaje final: ${this.score}`;
    } else {
      this.message = `¡Has perdido todas tus vidas!<br>Puntaje final: ${this.score}`;
    }

    try {
      await this.puntajesService.guardarPuntaje('mayor-menor', this.score);
      console.log('Puntaje guardado exitosamente');
    } catch (error) {
      console.error('Error al guardar el puntaje:', error);
      // SOLO NOTIFICAR ERROR GRAVE - cuando falla la base de datos
      this.notificationService.showAlert('Error al guardar la puntuación en la base de datos', 'error');
    }
  }

  async higher() {
    if (this.loading || this.apiError || this.gameFinished) return;
    await this.checkWinner(true);
  }

  async lower() {
    if (this.loading || this.apiError || this.gameFinished) return;
    await this.checkWinner(false);
  }

  volverAlHome() {
    this.router.navigate(['/home']);
  }

  async resetGame() {
    this.score = 0;
    this.life = 5;
    this.message = "";
    this.nextCard = {};
    this.currentCard = {};
    this.allCards = [];
    this.currentCardIndex = 0;
    this.apiError = false;
    this.showErrorEffect = false;
    this.gameFinished = false;
    await this.getDeckOfCards();
  }
}