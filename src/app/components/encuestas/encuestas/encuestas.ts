import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ResultadosService } from '../../../servicios/resultado/resultados';
import { NotificationService } from '../../../servicios/notification/notification';
import { Router, RouterModule } from '@angular/router';


function alMenosUnCkbSeleccionado(control: any): { [key: string]: any } | null {
  const array = control as FormArray;
  if (array && array.controls) {
    const alMenosUnoSeleccionado = array.controls.some((ctrl: any) => ctrl.value === true);
    return alMenosUnoSeleccionado ? null : { alMenosUnCkbSeleccionado: true };
  }
  return { alMenosUnCkbSeleccionado: true };
}

@Component({
  selector: 'app-encuestas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './encuestas.html',
  styleUrl: './encuestas.scss'
})
export class Encuestas implements OnInit {
  private notificationService = inject(NotificationService);
  private resultadosService = inject(ResultadosService);

  form!: FormGroup;

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  inicializarFormulario(): void {
    this.form = new FormGroup({
      nombre: new FormControl('', [
        Validators.required, 
        Validators.maxLength(50),
        Validators.minLength(2),
        Validators.pattern('^[a-zA-Z ]+$')
      ]),
      apellido: new FormControl('', [
        Validators.maxLength(50),
        Validators.minLength(2),
        Validators.required, 
        Validators.pattern('^[a-zA-Z ]+$')
      ]),
      edad: new FormControl('', [
        Validators.required, 
        Validators.min(18), 
        Validators.max(99)
      ]),
      telefono: new FormControl('', [
        Validators.required, 
        Validators.pattern('^[0-9]+$'),
        Validators.minLength(8),
        Validators.maxLength(10),
      ]),
      rdbExperiencia: new FormControl('', [Validators.required]),
      ckbFuncionalidades: new FormArray([
        new FormControl(false), 
        new FormControl(false), 
        new FormControl(false), 
        new FormControl(false),
      ], alMenosUnCkbSeleccionado),
      // COMENTARIOS AHORA SON OPCIONALES - sin Validators.required
      textComentario: new FormControl('', [
        Validators.maxLength(500) // Solo mantener el límite de caracteres
      ]),
    });
  }

  async EnviarForm() {
    if (this.form.valid) {
      try {
        const datosFormulario = this.prepararDatosParaEnvio();
        await this.resultadosService.GuardarEncuesta(datosFormulario);
        
        this.notificationService.showAlert('¡Encuesta enviada correctamente! Gracias por compartir tu opinión.', 'success');
        
        this.form.reset();
        this.reiniciarCheckboxes();
        
      } catch (error) {
        console.error('Error al enviar encuesta:', error);
        this.notificationService.showAlert('No se pudo enviar la encuesta. Por favor, intenta nuevamente.', 'error');
      }
    } else {
      this.marcarControlesComoTouched();
      this.notificationService.showAlert('Por favor completa todos los campos requeridos correctamente.', 'warning');
    }
  }

  private prepararDatosParaEnvio(): any {
    const formValue = { ...this.form.value };
    const funcionalidadesSeleccionadas = this.obtenerFuncionalidadesSeleccionadas(formValue.ckbFuncionalidades);
    
    return {
      ...formValue,
      ckbFuncionalidades: funcionalidadesSeleccionadas
    };
  }

  private obtenerFuncionalidadesSeleccionadas(ckbArray: boolean[]): string[] {
    const opciones = ['Mas juegos', 'Opciones de personalizacion', 'Modos de dificultad', 'Agregar musica'];
    return ckbArray
      .map((seleccionado, index) => seleccionado ? opciones[index] : null)
      .filter(opcion => opcion !== null) as string[];
  }

  private reiniciarCheckboxes(): void {
    const checkboxesArray = this.ckbFuncionalidades as FormArray;
    checkboxesArray.controls.forEach(control => {
      control.setValue(false);
    });
  }

  private marcarControlesComoTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          arrayControl.markAsTouched();
        });
      } else if (control) {
        control.markAsTouched();
      }
    });
  }

  // Getters para los controles del formulario
  get nombre() {
    return this.form.get('nombre');
  }
  
  get apellido() {
    return this.form.get('apellido');
  }

  get edad() {
    return this.form.get('edad');
  }

  get telefono() {
    return this.form.get('telefono');
  }

  get rdbExperiencia() {
    return this.form.get('rdbExperiencia');
  }

  get ckbFuncionalidades() {
    return this.form.get('ckbFuncionalidades');
  }

  get textComentario() {
    return this.form.get('textComentario');
  }

  campoEsInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return control ? control.invalid && control.touched : false;
  }

  obtenerMensajeError(campo: string): string {
    const control = this.form.get(campo);
    
    if (!control || !control.errors) return '';
    
    if (control.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (control.hasError('pattern')) {
      if (campo === 'nombre' || campo === 'apellido') {
        return 'Solo se permiten letras y espacios';
      }
      if (campo === 'telefono') {
        return 'Solo se permiten números';
      }
    }
    
    if (control.hasError('min') || control.hasError('max')) {
      return 'La edad debe ser entre 18 y 99 años';
    }
    
    if (control.hasError('alMenosUnCkbSeleccionado')) {
      return 'Debes seleccionar al menos una opción';
    }
    
    if (control.hasError('maxlength')) {
      if (campo === 'telefono') {
        return 'El numero de teléfono no puede exceder los 10 dígitos';
      }
      if (campo === 'nombre') {
        return 'El nombre no puede exceder los 50 caracteres';
      }
      if (campo === 'apellido') {
        return 'El apellido no puede exceder los 50 caracteres';
      }
    }

    if (control.hasError('minlength')) {
      if (campo === 'telefono') {
        return 'El numero de teléfono no puede tener menos de 8 dígitos';
      }
      if (campo === 'nombre') {
        return 'El nombre no puede tener menos de 2 caracteres';
      }
      if (campo === 'apellido') {
        return 'El apellido no puede tener menos de 2 caracteres';
      }
    }

    return 'Campo inválido';
  }
}