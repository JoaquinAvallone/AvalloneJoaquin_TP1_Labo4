import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AhorcadoComponent } from './ahorcado/ahorcado/ahorcado';
import { MayorMenorComponent } from './mayor-menor/mayor-menor/mayor-menor';
import { PreguntadosComponent } from './preguntados/preguntados/preguntados';
import  { AimTrainerComponent } from './aimTrainer/aim-trainer/aim-trainer';


const routes: Routes = [
  {
    path: 'ahorcado',
    component: AhorcadoComponent
  },
  {
    path: 'mayor-menor',
    component: MayorMenorComponent
  },
  {
    path: 'preguntados',
    component: PreguntadosComponent
  },
  {
    path: 'aim-trainer',
    component: AimTrainerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JuegosRoutingModule { }
