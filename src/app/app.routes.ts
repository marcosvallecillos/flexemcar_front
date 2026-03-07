import { Routes } from '@angular/router';
import { Home } from './views/home/home';
import { ModalLoginComponent } from './components/modal-login/modal-login.component';
import { ShowCatalogo } from './views/show-catalogo/show-catalogo';
import { RateServiceComponent } from './views/rate-service/rate-service.component';
import { ShowProfileComponent } from './views/show-profile/show-profile.component';
import { EditProfileComponent } from './views/edit-profile/edit-profile.component';
import { ShowVehicles } from './views/show-vehicles/show-vehicles';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: Home },
    { path: 'login', component: ModalLoginComponent },
    { path: 'showProfile', component: ShowProfileComponent },
    { path: 'editProfile', component: EditProfileComponent },
    { path: 'show-catalogo', component: ShowCatalogo },
    { path: 'show-vehicles', component: ShowVehicles },

    { path: 'rate-service/:id', component: RateServiceComponent },




];
