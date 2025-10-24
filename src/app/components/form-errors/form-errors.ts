import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-form-errors',
  imports: [CommonModule],
  templateUrl: './form-errors.html',
  styleUrl: './form-errors.scss'
})
export class FormErrors {

   @Input() control!: NgModel; // Recibimos el control del input

  // Mapeo de errores más comunes
  get errorMessage(): string | null {

    if (!this.control?.errors) return null;

    if (this.control.errors['required']) {
      return 'Este campo es obligatorio';
    }
    if (this.control.errors['email']) {
      return 'Debe ingresar un correo válido';
    }
    if (this.control.errors['minlength']) {
      return `Debe tener al menos ${this.control.errors['minlength'].requiredLength} caracteres`;
    }
    if (this.control.errors['maxlength']) {
      return `No puede superar los ${this.control.errors['maxlength'].requiredLength} caracteres`;
    }
    if (this.control.errors['pattern']) {
      return 'El formato ingresado no es válido';
    }

    return null;
  }
}
