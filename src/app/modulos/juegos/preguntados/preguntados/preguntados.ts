import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { PuntajesService } from '../../../../servicios/puntajes/puntajes';

@Component({
  selector: 'app-preguntados',
  standalone: false,
  templateUrl: './preguntados.html',
  styleUrls: ['./preguntados.scss']
})
export class PreguntadosComponent implements OnInit {
  todosLosPaises: any[] = [];
  paisesPregunta: any[] = [];
  preguntaActual: any = null;
  opciones: string[] = [];
  puntuacion: number = 0;
  preguntasRespondidas: number = 0;
  juegoTerminado: boolean = false;
  cargando: boolean = false;
  respuestaSeleccionada: string | null = null;
  mostrarResultado: boolean = false;
  esCorrecto: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private puntajesService: PuntajesService
  ) {}

  ngOnInit() {
    this.iniciarJuego();
  }

  volverAlHome() {
    this.router.navigate(['/']);
  }

  async iniciarJuego() {
    this.puntuacion = 0;
    this.preguntasRespondidas = 0;
    this.juegoTerminado = false;
    this.paisesPregunta = [];
    this.respuestaSeleccionada = null;
    this.mostrarResultado = false;
    this.preguntaActual = null;
    
    if (this.todosLosPaises.length === 0) {
      await this.cargarTodosLosPaises();
    }
    
    this.generarNuevasPreguntas();
  }

  async cargarTodosLosPaises() {
    this.cargando = true;
    
    try {
      const data: any = await this.http.get('https://restcountries.com/v3.1/all?fields=name,flags,translations').toPromise();
      
      this.todosLosPaises = data
        .filter((pais: any) => 
          pais.flags?.png && 
          pais.name?.common &&
          pais.translations?.spa?.common
        )
        .sort(() => Math.random() - 0.5)
        .slice(0, 50);
      
    } catch (error) {
      console.error('Error cargando países:', error);
    } finally {
      this.cargando = false;
    }
  }

  generarNuevasPreguntas() {
    const paisesMezclados = [...this.todosLosPaises]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    
    this.paisesPregunta = paisesMezclados;
    this.siguientePregunta();
  }

  siguientePregunta() {
    if (this.preguntasRespondidas >= 5) {
      this.finalizarJuego();
      return;
    }

    this.preguntaActual = this.paisesPregunta[this.preguntasRespondidas];
    this.generarOpciones();
    this.respuestaSeleccionada = null;
    this.mostrarResultado = false;
  }

  generarOpciones() {
    const paisCorrecto = this.preguntaActual.translations.spa.common;
    
    const opcionesIncorrectas = this.todosLosPaises
      .filter(p => p.translations.spa.common !== paisCorrecto)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(p => p.translations.spa.common);
    
    this.opciones = this.mezclarOpciones([
      paisCorrecto,
      ...opcionesIncorrectas
    ]);
  }

  mezclarOpciones(opciones: string[]): string[] {
    return [...opciones].sort(() => Math.random() - 0.5);
  }

  seleccionarRespuesta(respuesta: string) {
    if (this.mostrarResultado || this.juegoTerminado) return;

    this.respuestaSeleccionada = respuesta;
    this.mostrarResultado = true;
    this.esCorrecto = respuesta === this.preguntaActual.translations.spa.common;

    if (this.esCorrecto) {
      this.puntuacion++;
    }

    setTimeout(() => {
      this.preguntasRespondidas++;
      this.siguientePregunta();
    }, 1500);
  }

  async finalizarJuego() {
    this.juegoTerminado = true;
    // NOTA: NO limpiamos preguntaActual para que se mantenga visible la última bandera

    // Guardar puntaje
    try {
      await this.puntajesService.guardarPuntaje('preguntados', this.puntuacion);
    } catch (error) {
      console.error('Error guardando puntaje:', error);
    }
  }

  reiniciarJuego() {
    this.iniciarJuego();
  }

  obtenerBandera(): string {
    return this.preguntaActual?.flags?.png || '';
  }

  obtenerMensajeFinal(): string {
    if (this.puntuacion >= 4) {
      return `¡EXCELENTE! Obtuviste ${this.puntuacion} de 5 puntos`;
    } else if (this.puntuacion === 3) {
      return `¡BUEN TRABAJO! Obtuviste ${this.puntuacion} de 5 puntos`;
    } else {
      return `JUEGO TERMINADO. Obtuviste ${this.puntuacion} de 5 puntos`;
    }
  }
}