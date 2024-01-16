import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { dashboardRoute } from './dashboard.route';
import { DashboardComponent } from './dashboard.component';

@NgModule({
  declarations: [DashboardComponent],
  imports: [SharedModule, RouterModule.forChild(dashboardRoute)],
})
export class DashboardModule {}
