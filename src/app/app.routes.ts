import { Routes } from '@angular/router';
import { Home } from './views/home/home';
import { ModalLoginComponent } from './components/modal-login/modal-login.component';
import { ShowCatalogo } from './views/show-catalogo/show-catalogo';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: Home },
    { path: 'login', component: ModalLoginComponent },
    { path: 'show-catalogo', component: ShowCatalogo },


];
