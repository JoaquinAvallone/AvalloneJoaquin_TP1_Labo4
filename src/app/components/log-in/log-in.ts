import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, Validators, FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../servicios/auth/auth';

@Component({
  selector: 'app-log-in',
  imports: [RouterModule, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './log-in.html',
  styleUrls: ['./log-in.scss']
})
export class LogIn implements OnInit {
  loading: boolean = false;
  errorMsg: boolean = false;
  errorText: string = '';
  formLogin: ReturnType<FormBuilder['group']>;

  constructor(private router: Router, private fb: FormBuilder, private auth: AuthService) {
    this.formLogin = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async ngOnInit() {
    const session = await this.auth.getSession();
    if(session) {
      this.router.navigate(['/home']);
    }
  }

  async onLogin() {
    this.loading = true;
    this.errorMsg = false;
    this.errorText = '';
    this.formLogin.markAllAsTouched();
    this.formLogin.updateValueAndValidity({ emitEvent: true });

    if (this.formLogin.invalid){
      this.loading = false;
      return;
    }

    const { email, password } = this.formLogin.value as any;

    try {
      const { error } = await this.auth.signIn(email, password);

      if (error) {
        this.errorText = this.getErrorMessage(error);
        this.errorMsg = true;
        return;
      }

      this.router.navigateByUrl("/home", { replaceUrl: true });

    } catch (error) {
      this.errorText = 'Error inesperado al iniciar sesión';
      this.errorMsg = true;
    } finally {
      this.loading = false;
    }
  }

  private getErrorMessage(error: any): string {
    if (error.message?.includes('Invalid login credentials')) {
      return 'Email o contraseña incorrectos';
    } else if (error.status === 400) {
      return 'Datos de login inválidos';
    } else {
      return error.message || 'Error al iniciar sesión';
    }
  }

  async quickLogin(user: { email: string, password: string }) {
    this.formLogin.patchValue(user);
  }

  closeError() { 
    this.errorMsg = false; 
  }
}
