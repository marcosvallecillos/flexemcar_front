import { Routes } from '@angular/router';
import { Home } from './views/home/home';
import { ShowReserves } from './views/show-reserves/show-reserves';
import { ShowVehicles } from './views/show-vehicles/show-vehicles';
import { RateServiceComponent } from './views/rate-service/rate-service.component';
import { ModalLoginComponent } from './components/modal-login/modal-login.component';
import { ShowProfileComponent } from './views/show-profile/show-profile.component';
import { AuthUserGuard } from './guards/auth-user.guard';
import { EditProfileComponent } from './views/edit-profile/edit-profile.component';
import { AdminGuard } from './guards/auth.guard';
import { DashboardAdmin } from './components/dashboard-admin/dashboard-admin';
import { ShowClients } from './views/show-clients/show-clients';
import { CreateUserComponent } from './views/create-user/create-user.component';
import { AsideAdmin } from './components/aside-admin/aside-admin';
import { ReservationsComponent } from './views/reservations/reservations.component';
import { ReserveComponent } from './views/reserve/reserve.component';
import { reservasAnuladas } from './views/reservasAnuladas/reservasAnuladas.component';
import { ShowCatalogo } from './views/show-catalogo/show-catalogo';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // ✅ Admin no puede entrar al home ni a rutas de usuario
  { path: 'home', component: Home },
  { path: 'show-reserves', component: ShowReserves },
  { path: 'show-vehicles', component: ShowVehicles },
  { path: 'rate-service/:id', component: RateServiceComponent },
  { path: 'login', component: ModalLoginComponent },
  { path: 'showProfile', component: ShowProfileComponent, canActivate: [AuthUserGuard] },
  { path: 'editProfile', component: EditProfileComponent, canActivate: [AuthUserGuard] },
  { path: 'new-reserve', component: ReserveComponent, canActivate: [AuthUserGuard] },
  {
    path: 'admin',
    component: AsideAdmin,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardAdmin },
      { path: 'users', component: ShowClients },
      { path: 'create-users', component: CreateUserComponent },
      { path: 'reservations', component: ReservationsComponent },
      { path: 'reservasAnuladas', component: reservasAnuladas },
      { path: 'catalogo', component: ShowCatalogo },
      { path: 'create-vehicle', loadComponent: () => import('./views/create-vehicle/create-vehicle').then(m => m.CreateVehicle) }
    ]
  },
];