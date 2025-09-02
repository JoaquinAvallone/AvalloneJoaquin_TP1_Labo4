import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-registro',
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss'
})
export class Registro {
  email: string = '';
  password: string = '';
  nombre: string = '';

  onSignup() {
    // Aquí puedes manejar la lógica de registro
  }
}
