import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PuntajesService } from '../../../../servicios/puntajes/puntajes';

@Component({
  selector: 'app-aim-trainer',
  standalone: false,
  templateUrl: './aim-trainer.html',
  styleUrls: ['./aim-trainer.scss']
})
export class AimTrainerComponent implements OnInit, OnDestroy {
  juegoIniciado: boolean = false;
  juegoTerminado: boolean = false;
  puntuacion: number = 0;
  tiempoRestante: number = 30;
  intervaloTiempo: any;
  intervaloTargets: any;
  objetivos: any[] = [];
  objetivosAcertados: number = 0;
  objetivosFallados: number = 0;

  constructor(
    private router: Router,
    private puntajesService: PuntajesService
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.limpiarIntervalos();
  }

  volverAlHome() {
    this.router.navigate(['/']);
  }

  iniciarJuego() {
    this.juegoIniciado = true;
    this.juegoTerminado = false;
    this.puntuacion = 0;
    this.tiempoRestante = 30;
    this.objetivos = [];
    this.objetivosAcertados = 0;
    this.objetivosFallados = 0;

    // Intervalo del temporizador
    this.intervaloTiempo = setInterval(() => {
      this.tiempoRestante--;
      if (this.tiempoRestante <= 0) {
        this.finalizarJuego();
      }
    }, 1000);

    // Generar primeros objetivos
    this.generarObjetivos();
  }

  generarObjetivos() {
    const cantidadObjetivos = 8;
    this.objetivos = [];

    for (let i = 0; i < cantidadObjetivos; i++) {
      const direccion = Math.random() > 0.5 ? 1 : -1;
      const nuevoObjetivo = {
        id: i,
        top: Math.random() * 70 + 10, // 10% a 80%
        left: Math.random() * 80 + 10, // 10% a 90%
        visible: true,
        size: 50,
        direccion: direccion,
        velocidad: Math.random() * 0 + 0.05
      };
      this.objetivos.push(nuevoObjetivo);
    }

    // Iniciar animación de movimiento
    this.iniciarAnimacion();

    // Ocultar objetivos después de 3 segundos
    setTimeout(() => {
      this.objetivos.forEach(objetivo => objetivo.visible = false);
      if (this.tiempoRestante > 0) {
        setTimeout(() => this.generarObjetivos(), 500);
      }
    }, 3000);
  }

  iniciarAnimacion() {
    const animar = () => {
      if (this.juegoTerminado) return;

      this.objetivos.forEach(objetivo => {
        if (objetivo.visible) {
          // Mover objetivo horizontalmente
          objetivo.left += objetivo.direccion * objetivo.velocidad;
          
          // Rebotar en los bordes
          if (objetivo.left <= 5 || objetivo.left >= 95) {
            objetivo.direccion *= -1;
          }
        }
      });

      if (this.tiempoRestante > 0) {
        requestAnimationFrame(animar);
      }
    };

    requestAnimationFrame(animar);
  }

  enObjetivoClick(objetivo: any) {
    if (!objetivo.visible || this.juegoTerminado) return;

    this.objetivosAcertados++;
    this.puntuacion += 1;
    objetivo.visible = false;
  }

  enAreaClick(event: any) {
    const clickEnObjetivo = this.objetivos.some(objetivo => 
      objetivo.visible && this.esClickEnObjetivo(event, objetivo)
    );

    if (!clickEnObjetivo && this.juegoIniciado && !this.juegoTerminado) {
      this.objetivosFallados++;
    }
  }

  esClickEnObjetivo(event: any, objetivo: any): boolean {
    const rect = event.target.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const objetivoX = (objetivo.left / 100) * rect.width;
    const objetivoY = (objetivo.top / 100) * rect.height;
    const radio = objetivo.size / 2;

    const distancia = Math.sqrt(
      Math.pow(clickX - objetivoX, 2) + Math.pow(clickY - objetivoY, 2)
    );

    return distancia <= radio;
  }

  finalizarJuego() {
    this.limpiarIntervalos();
    this.juegoTerminado = true;
    this.objetivos = [];

    // Guardar puntaje
    this.guardarPuntaje();
  }

  async guardarPuntaje() {
    try {
      await this.puntajesService.guardarPuntaje('aim', this.puntuacion);
    } catch (error) {
      console.error('Error guardando puntaje:', error);
    }
  }

  reiniciarJuego() {
    this.limpiarIntervalos();
    this.iniciarJuego();
  }

  terminarJuego() {
    this.limpiarIntervalos();
    this.juegoIniciado = false;
    this.juegoTerminado = false;
    this.objetivos = [];
  }

  private limpiarIntervalos() {
    if (this.intervaloTiempo) {
      clearInterval(this.intervaloTiempo);
      this.intervaloTiempo = null;
    }
    if (this.intervaloTargets) {
      clearInterval(this.intervaloTargets);
      this.intervaloTargets = null;
    }
  }
}