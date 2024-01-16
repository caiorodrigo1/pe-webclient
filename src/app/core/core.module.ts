import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { SharedModule } from '../shared/shared.module';
import { CoreRoutingModule } from './core-routing.module';
import { CoreComponent } from './core.component';
import { AuthInterceptor } from '../auth/interceptors/auth.interceptor';
import { AuthExpiredInterceptor } from '../auth/interceptors/auth-expired.interceptor';

import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { FooterComponent } from './layout/footer/footer.component';

@NgModule({
  imports: [SharedModule, RouterModule, CoreRoutingModule],
  declarations: [
    CoreComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthExpiredInterceptor,
      multi: true,
    },
  ],
})
export class CoreModule {}
