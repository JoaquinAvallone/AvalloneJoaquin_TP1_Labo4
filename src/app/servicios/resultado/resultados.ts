import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResultadosService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  async GuardarEncuesta(encuestaData: any) {
    // Filtrar solo las funcionalidades seleccionadas
    const funcionalidadesSeleccionadas = this.obtenerFuncionalidadesSeleccionadas(encuestaData.ckbFuncionalidades);

    const { data, error } = await this.supabase
      .from('encuestas')
      .insert([
        {
          nombre: encuestaData.nombre,
          apellido: encuestaData.apellido,
          edad: encuestaData.edad,
          telefono: encuestaData.telefono,
          experiencia: encuestaData.rdbExperiencia,
          funcionalidades_deseadas: funcionalidadesSeleccionadas,
          comentarios: encuestaData.textComentario
          // created_at se llena automáticamente
        }
      ])
      .select();

    if (error) {
      console.error('Error guardando encuesta:', error);
      throw error;
    }

    return data;
  }

  async ObtenerTodasLasEncuestas() {
    try {
      console.log('Consultando tabla encuestas...');
      
      // QUITAR el .order('created_at') porque la columna no existe
      const { data, error } = await this.supabase
        .from('encuestas')
        .select('*');

      if (error) {
        console.error('Error de Supabase:', error);
        throw error;
      }

      console.log('Encuestas obtenidas:', data);
      return data || [];
      
    } catch (error) {
      console.error('Error en ObtenerTodasLasEncuestas:', error);
      throw error;
    }
  }

  async ObtenerEncuestasPaginadas(pagina: number, limite: number = 10) {
    const desde = (pagina - 1) * limite;
    const hasta = desde + limite - 1;

    const { data, error, count } = await this.supabase
      .from('encuestas')
      .select('*', { count: 'exact' })
      .range(desde, hasta);

    if (error) {
      console.error('Error obteniendo encuestas paginadas:', error);
      throw error;
    }

    return { data, total: count || 0 };
  }

  // Obtener estadísticas de las encuestas
  async ObtenerEstadisticasEncuestas() {
    const { data, error } = await this.supabase
      .from('encuestas')
      .select('experiencia, edad');

    if (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }

    // Calcular estadísticas
    const estadisticas = {
      total: data?.length || 0,
      porExperiencia: this.contarPorExperiencia(data || []),
      edadPromedio: this.calcularEdadPromedio(data || []),
      funcionalidadesPopulares: await this.obtenerFuncionalidadesPopulares()
    };

    return estadisticas;
  }

  // Obtener encuestas por rango de fechas
  async ObtenerEncuestasPorFecha(desde: Date, hasta: Date) {
    const { data, error } = await this.supabase
      .from('encuestas')
      .select('*')
      .gte('created_at', desde.toISOString())
      .lte('created_at', hasta.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo encuestas por fecha:', error);
      throw error;
    }

    return data;
  }

  // Métodos auxiliares privados
  private obtenerFuncionalidadesSeleccionadas(ckbFuncionalidades: any[]): string[] {
    const opciones = ['Mas juegos', 'Opciones de personalizacion', 'Modos de dificultad', 'Agregar musica'];
    return ckbFuncionalidades
      .map((valor: any, index: number) => valor ? opciones[index] : null)
      .filter((val: string | null) => val !== null);
  }

  private contarPorExperiencia(encuestas: any[]): any {
    const conteo: any = {
      excelente: 0,
      buena: 0,
      regular: 0,
      mala: 0
    };

    encuestas.forEach(encuesta => {
      if (conteo.hasOwnProperty(encuesta.experiencia)) {
        conteo[encuesta.experiencia] += 1;
      }
    });

    return conteo;
  }

  private calcularEdadPromedio(encuestas: any[]): number {
    if (encuestas.length === 0) return 0;
    
    const sumaEdades = encuestas.reduce((total, encuesta) => total + encuesta.edad, 0);
    return Math.round(sumaEdades / encuestas.length);
  }

  private async obtenerFuncionalidadesPopulares(): Promise<any> {
    const { data, error } = await this.supabase
      .from('encuestas')
      .select('funcionalidades_deseadas');

    if (error) {
      console.error('Error obteniendo funcionalidades populares:', error);
      return {};
    }

    const conteo: any = {
      'Mas juegos': 0,
      'Opciones de personalizacion': 0,
      'Modos de dificultad': 0,
      'Agregar musica': 0
    };

    data?.forEach(encuesta => {
      encuesta.funcionalidades_deseadas?.forEach((funcionalidad: string) => {
        if (conteo.hasOwnProperty(funcionalidad)) {
          conteo[funcionalidad] += 1;
        }
      });
    });

    return conteo;
  }

  // Método para eliminar una encuesta (solo si necesitas administración)
  async EliminarEncuesta(id: number) {
    const { error } = await this.supabase
      .from('encuestas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando encuesta:', error);
      throw error;
    }

    return true;
  }
}