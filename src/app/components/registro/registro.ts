import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../../servicios/auth/auth';
import { Usuarios } from '../../servicios/usuarios/usuarios';
import { ReactiveFormsModule } from '@angular/forms';
import { Usuario } from '../../clases/usuario';

@Component({
  selector: 'app-registro',
  imports: [CommonModule, FormsModule, RouterLink, ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss'
})
export class Registro {
  loading: boolean = false;
  errorMsg: boolean = false;
  errorText = "Ocurrió un error";
  formRegister: ReturnType<FormBuilder["group"]>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private usuariosService: Usuarios
  ) {
    this.formRegister = this.fb.group({
      nombre: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      confirm: ["", [Validators.required]],
    }, { validators: this.passwordsMatch })
  }

  passwordsMatch: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const pass = group.get("password")?.value ?? "";
    const conf = group.get("confirm")?.value ?? "";
    const confirmCtrl = group.get("confirm");
    if (!confirmCtrl) return null;

    const others = { ...(confirmCtrl.errors ?? {}) };
    delete (others as any)["passwordmatch"];

    if (conf && pass !== conf) {
      confirmCtrl.setErrors({ ...others, passwordmatch: true });
      return { passwordmatch: true };
    } else {
      confirmCtrl.setErrors(Object.keys(others).length ? others : null);
      return null;
    }
  };

  async onRegister() {
    this.loading = true;
    this.errorMsg = false;
    this.formRegister.markAllAsTouched();
    this.formRegister.updateValueAndValidity({ emitEvent: true });
    
    if (this.formRegister.invalid) {
      this.loading = false;
      return;
    }

    const v = this.formRegister.value as any;
    const nombre: string = (v.nombre).trim();
    const email: string = (v.email).trim().toLowerCase();
    const password: string = v.password;

    try {
      if (await this.usuariosService.existsByEmail(email)) {
        this.errorText = "Correo ya registrado";
        this.errorMsg = true;
        this.loading = false;
        return;
      }

      const { data, error } = await this.authService.signUp(email, password);
      
      if (error) {
        this.errorText = "Error en autenticación: " + error.message;
        this.errorMsg = true;
        this.loading = false;
        return;
      }

      if (!data?.user) {
        this.errorText = "No se pudo registrar el usuario";
        this.errorMsg = true;
        this.loading = false;
        return;
      }

      const usuario = new Usuario(nombre, email, data.user.id);
      
      try {
        await this.usuariosService.createFromUser(usuario);
      } catch (e: any) {
        const pgCode = e?.code as string | undefined;
        const details = String(e?.details ?? "").toLowerCase();
        
        if (pgCode === "23505" || details.includes("already exists")) {
          if (details.includes("correo") || details.includes("email")) {
            this.errorText = "Correo ya registrado";
          } else {
            this.errorText = "Registro duplicado";
          }
        } else {
          console.error(e);
          this.errorText = "Error guardando usuario";
        }
        this.errorMsg = true;
        return;
      }

      // Redirigir al home
      this.router.navigateByUrl("/home", { replaceUrl: true });

    } catch (err: any) {
      console.error(err);
      this.errorText = "Error inesperado: " + (err.message || err);
      this.errorMsg = true;
    }
  }

  closeError() { 
    this.errorMsg = false; 
  }
}