import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PuntajesService } from '../../../servicios/puntajes/puntajes';

interface PuntajeRanking {
  usuario_id: string;
  correo: string;
  puntuacion: number;
  fecha_formateada: string;
  created_at: string;
  id?: string; // Agregar el ID para identificar filas únicas
}

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ranking.html',
  styleUrl: './ranking.scss'
})
export class Ranking implements OnInit {
  private puntajesService = inject(PuntajesService);
  private router = inject(Router);

  // Top 5 de cada juego (pueden haber usuarios repetidos, pero no filas duplicadas)
  topAhorcado: PuntajeRanking[] = [];
  topMayorMenor: PuntajeRanking[] = [];
  topPreguntados: PuntajeRanking[] = [];
  topAimTrainer: PuntajeRanking[] = [];

  // Top 3 general (pueden haber usuarios repetidos)
  topGeneral: any[] = [];

  cargando: boolean = true;
  errorCarga: boolean = false;

  ngOnInit(): void {
    this.cargarRankings();
  }

  async cargarRankings() {
    try {
      this.cargando = true;
      this.errorCarga = false;

      // Cargar tops individuales para cada juego
      await Promise.all([
        this.cargarTopAhorcado(),
        this.cargarTopMayorMenor(),
        this.cargarTopPreguntados(),
        this.cargarTopAimTrainer()
      ]);

      // Calcular top 3 general
      this.calcularTopGeneral();

    } catch (error) {
      console.error('Error cargando rankings:', error);
      this.errorCarga = true;
    } finally {
      this.cargando = false;
    }
  }

  private async cargarTopAhorcado() {
    const puntajes = await this.puntajesService.obtenerTodosLosPuntajes('ahorcado');
    this.topAhorcado = this.obtenerTop5PuntajesUnicos(puntajes);
  }

  private async cargarTopMayorMenor() {
    const puntajes = await this.puntajesService.obtenerTodosLosPuntajes('mayor-menor');
    this.topMayorMenor = this.obtenerTop5PuntajesUnicos(puntajes);
  }

  private async cargarTopPreguntados() {
    const puntajes = await this.puntajesService.obtenerTodosLosPuntajes('preguntados');
    this.topPreguntados = this.obtenerTop5PuntajesUnicos(puntajes);
  }

  private async cargarTopAimTrainer() {
    const puntajes = await this.puntajesService.obtenerTodosLosPuntajes('aim');
    this.topAimTrainer = this.obtenerTop5PuntajesUnicos(puntajes);
  }

  /**
   * Obtiene los top 5 puntajes individuales únicos
   * (mismo usuario puede aparecer múltiples veces, pero no la misma fila de BD)
   */
  private obtenerTop5PuntajesUnicos(puntajes: any[]): PuntajeRanking[] {
    // Eliminar duplicados exactos (mismo usuario, mismo puntaje, misma fecha)
    const puntajesUnicos = this.eliminarDuplicadosExactos(puntajes);
    
    // Ordenar por puntuación y tomar top 5
    return puntajesUnicos
      .sort((a, b) => b.puntuacion - a.puntuacion)
      .slice(0, 5)
      .map(puntaje => ({
        usuario_id: puntaje.usuario_id,
        correo: puntaje.correo,
        puntuacion: puntaje.puntuacion,
        fecha_formateada: this.formatearFecha(puntaje.created_at),
        created_at: puntaje.created_at,
        id: puntaje.id // Incluir el ID para referencia
      }));
  }

  /**
   * Elimina duplicados exactos (mismo usuario + mismo puntaje + misma fecha)
   * Pero permite que el mismo usuario aparezca con diferentes puntajes/fechas
   */
  private eliminarDuplicadosExactos(puntajes: any[]): any[] {
    const seen = new Set();
    return puntajes.filter(puntaje => {
      // Crear una clave única que combine usuario + puntuación + fecha
      const clave = `${puntaje.correo}-${puntaje.puntuacion}-${puntaje.created_at}`;
      
      if (seen.has(clave)) {
        return false; // Es un duplicado exacto, filtrarlo
      }
      
      seen.add(clave);
      return true;
    });
  }

  /**
   * Formatear fecha como "24/10/2025 06:24 PM"
   */
  private formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const anio = date.getFullYear();
    
    let horas = date.getHours();
    const minutos = date.getMinutes().toString().padStart(2, '0');
    const ampm = horas >= 12 ? 'pm' : 'am';
    
    horas = horas % 12;
    horas = horas ? horas : 12;
    
    return `${dia}/${mes}/${anio} ${horas}:${minutos} ${ampm}`;
  }

  private calcularTopGeneral() {
    // Combinar todos los puntajes individuales de todos los juegos
    const todosPuntajes = [
      ...this.topAhorcado,
      ...this.topMayorMenor, 
      ...this.topPreguntados,
      ...this.topAimTrainer
    ];

    // Ordenar por puntuación y tomar top 3 (pueden haber usuarios repetidos)
    this.topGeneral = todosPuntajes
      .sort((a, b) => b.puntuacion - a.puntuacion)
      .slice(0, 3)
      .map((puntaje, index) => ({
        ...puntaje,
        posicion: index
      }));
  }

  obtenerIconoPosicion(posicion: number): string {
    switch (posicion) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${posicion + 1}°`;
    }
  }

  volverAlHome() {
    this.router.navigate(['/home']);
  }

  recargarRankings() {
    this.cargarRankings();
  }
}