import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth';
import { supabase } from '../../../supabase.client';

@Injectable({
  providedIn: 'root'
})
export class PuntajesService {

  private juegos = ['ahorcado', 'aim', 'mayor-menor', 'preguntados'];

  constructor(private authService: AuthService) {}

  async guardarPuntaje(nombreJuego: string, puntuacion: number) {
    try {
      const usuario = await this.authService.getUser();
      
      const scoreData = {
        usuario_id: usuario!.id,
        puntuacion: puntuacion,
        correo: usuario!.email
      };

      const { data, error } = await supabase
        .from(nombreJuego)
        .insert([scoreData]);

      if (error) {
        console.error(`Error guardando puntaje en ${nombreJuego}:`, error);
        return null;
      }

      console.log(`Puntaje guardado en ${nombreJuego}:`, data);
      return data;

    } catch (error) {
      console.error(`Error guardando puntaje en ${nombreJuego}:`, error);
      return null;
    }
  }

  /**
   * Obtener historial de puntajes de un usuario
   */
  async obtenerPuntajesUsuario(nombreJuego: string, limite: number = 10) {
    const usuario = await this.authService.getUser();
    
    const { data, error } = await supabase
      .from(nombreJuego)
      .select('*')
      .eq('usuario_id', usuario!.id)
      .order('created_at', { ascending: false })
      .limit(limite);

    if (error) {
      console.error(`Error obteniendo puntajes de ${nombreJuego}:`, error);
      return [];
    }

    return data || [];
  }

  /**
   * Obtener todos los puntajes de un juego (para rankings)
   */
  async obtenerTodosLosPuntajes(nombreJuego: string) {
    const { data, error } = await supabase
      .from(nombreJuego)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error obteniendo todos los puntajes de ${nombreJuego}:`, error);
      return [];
    }

    return data || [];
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
    horas = horas ? horas : 12; // 0 should be 12
    
    return `${dia}/${mes}/${anio} ${horas}:${minutos} ${ampm}`;
  }

  /**
   * Generar ranking por mejor puntuación (máximo)
   */
  async generarRankingMejorPuntuacion(juego: string): Promise<any[]> {
    const puntajes = await this.obtenerTodosLosPuntajes(juego);
    
    // Agrupar por usuario y encontrar la máxima puntuación
    const ranking = puntajes.reduce((acc: any[], puntaje) => {
      const usuarioExistente = acc.find(item => item.correo === puntaje.correo);
      
      if (!usuarioExistente) {
        acc.push({
          correo: puntaje.correo,
          mejor_puntuacion: puntaje.puntuacion,
          fecha: puntaje.created_at,
          usuario_id: puntaje.usuario_id
        });
      } else if (puntaje.puntuacion > usuarioExistente.mejor_puntuacion) {
        usuarioExistente.mejor_puntuacion = puntaje.puntuacion;
        usuarioExistente.fecha = puntaje.created_at;
      }
      
      return acc;
    }, []);
    
    // Ordenar por mejor puntuación (descendente) y tomar top 5
    return ranking
      .sort((a, b) => b.mejor_puntuacion - a.mejor_puntuacion)
      .slice(0, 5)
      .map(item => ({
        ...item,
        fecha_formateada: this.formatearFecha(item.fecha)
      }));
  }

  /**
   * Generar ranking por promedio de puntuación
   */
  async generarRankingPromedio(juego: string): Promise<any[]> {
    const puntajes = await this.obtenerTodosLosPuntajes(juego);
    
    // Calcular promedio por usuario
    const promedios = puntajes.reduce((acc: any, puntaje) => {
      if (!acc[puntaje.correo]) {
        acc[puntaje.correo] = {
          total: 0,
          cantidad: 0,
          usuario_id: puntaje.usuario_id
        };
      }
      acc[puntaje.correo].total += puntaje.puntuacion;
      acc[puntaje.correo].cantidad += 1;
      return acc;
    }, {});
    
    // Convertir a array y calcular promedio
    const ranking = Object.keys(promedios).map(correo => ({
      correo,
      promedio: parseFloat((promedios[correo].total / promedios[correo].cantidad).toFixed(2)),
      total_juegos: promedios[correo].cantidad,
      usuario_id: promedios[correo].usuario_id
    }));
    

    return ranking
      .sort((a, b) => b.promedio - a.promedio)
      .slice(0, 5);
  }


  async generarRankingTotalJuegos(juego: string): Promise<any[]> {
    const puntajes = await this.obtenerTodosLosPuntajes(juego);
    

    const conteo = puntajes.reduce((acc: any, puntaje) => {
      acc[puntaje.correo] = (acc[puntaje.correo] || 0) + 1;
      return acc;
    }, {});
    
    const ranking = Object.keys(conteo).map(correo => ({
      correo,
      total_juegos: conteo[correo]
    }));
    
    // Ordenar por total de juegos (descendente) y tomar top 5
    return ranking
      .sort((a, b) => b.total_juegos - a.total_juegos)
      .slice(0, 5);
  }


  async obtenerTodosLosRankings(juego: string) {
    return {
      mejorPuntuacion: await this.generarRankingMejorPuntuacion(juego),
      promedio: await this.generarRankingPromedio(juego),
      totalJuegos: await this.generarRankingTotalJuegos(juego)
    };
  }

  async obtenerRankingsTodosLosJuegos() {
    const resultados: any = {};
    
    for (const juego of this.juegos) {
      resultados[juego] = await this.obtenerTodosLosRankings(juego);
    }
    
    return resultados;
  }
}