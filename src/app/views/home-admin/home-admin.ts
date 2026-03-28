import { Component } from '@angular/core';
import { DashboardAdmin } from "../../components/dashboard-admin/dashboard-admin";
import { ShowClients } from "../show-clients/show-clients";
import { AsideAdmin } from "../../components/aside-admin/aside-admin";
import { ShowCatalogo } from '../show-catalogo/show-catalogo';

@Component({
  selector: 'app-home-admin',
  imports: [DashboardAdmin, ShowClients, AsideAdmin,ShowCatalogo],
  templateUrl: './home-admin.html',
  styleUrl: './home-admin.css',
})
export class HomeAdmin {}
