import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-log-in',
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './log-in.html',
  styleUrl: './log-in.scss'
})
export class LogIn {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router) {}

  onLogin() {
    if (this.email === 'admin@test.com' && this.password === '1234') {
      this.router.navigate(['/home']);
    }
  }
}
