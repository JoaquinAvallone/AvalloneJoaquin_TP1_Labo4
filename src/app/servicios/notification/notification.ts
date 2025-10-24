import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  showAlert(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success', duration: number = 5000) {
    this.showDesktopToast(message, type, duration);
  }

  private showDesktopToast(message: string, type: string, duration: number) {
    const toastId = 'desktop-toast-' + Date.now();
    
    const toastHtml = `
      <div id="${toastId}" class="desktop-toast toast show" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header text-black">
          <i class="bi ${this.getIcon(type)} me-2 fs-5"></i>
          <strong class="me-auto">${this.getTitle(type)}</strong>
          <small class="text-black-50">${this.getCurrentTime()}</small>
          <button type="button" class="btn-close ms-2 " data-bs-dismiss="toast" aria-label="cerrar"></button>
        </div>
        <div class="toast-body bg-light">
          <div class="d-flex align-items-center">
            <div class="flex-grow-1">${message}</div>
            <div class="progress ms-3" style="width: 80px; height: 4px;">
              <div class="progress-bar ${this.getProgressBarClass(type)}" role="progressbar" style="width: 100%;"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    const container = this.getDesktopToastContainer();
    container.insertAdjacentHTML('beforeend', toastHtml);

    // Animación de progreso
    this.startProgressAnimation(toastId, duration);

    // Auto-remover después de la duración
    setTimeout(() => {
      this.removeToast(toastId);
    }, duration);

    // Cerrar manualmente
    const closeBtn = document.querySelector(`#${toastId} .btn-close`);
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.removeToast(toastId);
      });
    }
  }

  private getDesktopToastContainer(): HTMLElement {
    let container = document.getElementById('desktop-toast-container');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'desktop-toast-container';
      container.className = 'desktop-toast-container';
      document.body.appendChild(container);
    }
    
    return container;
  }

  private startProgressAnimation(toastId: string, duration: number) {
    setTimeout(() => {
      const progressBar = document.querySelector(`#${toastId} .progress-bar`) as HTMLElement;
      if (progressBar) {
        progressBar.style.transition = `width ${duration}ms linear`;
        progressBar.style.width = '0%';
      }
    }, 100);
  }

  private removeToast(toastId: string) {
    const toast = document.getElementById(toastId);
    if (toast) {
      toast.style.transform = 'translateX(100%)';
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  }

  private getHeaderClass(type: string): string {
    switch (type) {
      case 'error': return 'bg-danger';
      case 'warning': return 'bg-warning';
      case 'info': return 'bg-info';
      default: return 'bg-success';
    }
  }

  private getProgressBarClass(type: string): string {
    switch (type) {
      case 'error': return 'bg-danger';
      case 'warning': return 'bg-warning';
      case 'info': return 'bg-info';
      default: return 'bg-success';
    }
  }

  private getTitle(type: string): string {
    switch (type) {
      case 'error': return 'Error';
      case 'warning': return 'Advertencia';
      case 'info': return 'Información';
      default: return 'Éxito';
    }
  }

  private getIcon(type: string): string {
    switch (type) {
      case 'error': return 'bi-exclamation-octagon-fill';
      case 'warning': return 'bi-exclamation-triangle-fill';
      case 'info': return 'bi-info-circle-fill';
      default: return 'bi-check-circle-fill';
    }
  }

  private getCurrentTime(): string {
    return new Date().toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}