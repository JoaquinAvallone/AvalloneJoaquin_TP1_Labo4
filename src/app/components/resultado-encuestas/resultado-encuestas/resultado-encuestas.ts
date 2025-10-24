// encuesta-results.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ResultadosService } from '../../../servicios/resultado/resultados';
import { NotificationService } from '../../../servicios/notification/notification';

@Component({
  selector: 'app-encuesta-results',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './resultado-encuestas.html',
  styleUrl: './resultado-encuestas.scss'
})
export class ResultadoEncuestas implements OnInit {
  private resultadosService = inject(ResultadosService);
  private notificationService = inject(NotificationService);

  encuestas: any[] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargarEncuestas();
  }

  async cargarEncuestas() {
    try {
      this.encuestas = await this.resultadosService.ObtenerTodasLasEncuestas();
    } catch (error) {
      console.error('Error:', error);
      this.notificationService.showAlert('Error al cargar encuestas', 'error');
    } finally {
      this.cargando = false;
    }
  }

  hayEncuestas(): boolean {
    return this.encuestas.length > 0;
  }

  async eliminarEncuesta(id: number) {
    if (confirm('¿Eliminar encuesta?')) {
      try {
        await this.resultadosService.EliminarEncuesta(id);
        this.notificationService.showAlert('Encuesta eliminada', 'success');
        this.cargarEncuestas();
      } catch (error) {
        this.notificationService.showAlert('Error al eliminar', 'error');
      }
    }
  }
}