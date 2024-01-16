import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreComponent } from './core.component';
import { CoreGuard } from '../auth/guards/core.guard';

const routes: Routes = [
  {
    path: '',
    component: CoreComponent,
    canActivate: [CoreGuard],
    loadChildren: () =>
      import('./../entities/entity.module').then((m) => m.EntityModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [],
})
export class CoreRoutingModule {}
