import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { JuegosRoutingModule } from './juegos-routing-module';
import { AhorcadoComponent } from './ahorcado/ahorcado/ahorcado';
import { MayorMenorComponent } from './mayor-menor/mayor-menor/mayor-menor';
import { PreguntadosComponent } from './preguntados/preguntados/preguntados';
import { AimTrainerComponent } from './aimTrainer/aim-trainer/aim-trainer';

@NgModule({
  declarations: [
    AhorcadoComponent,
    MayorMenorComponent,
    PreguntadosComponent,
    AimTrainerComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    JuegosRoutingModule
  ]
})
export class JuegosModule { }
