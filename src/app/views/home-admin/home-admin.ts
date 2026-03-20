import { Component } from '@angular/core';
import { DashboardAdmin } from "../../components/dashboard-admin/dashboard-admin";
import { ShowClients } from "../show-clients/show-clients";
import { AsideAdmin } from "../../components/aside-admin/aside-admin";

@Component({
  selector: 'app-home-admin',
  imports: [DashboardAdmin, ShowClients, AsideAdmin],
  templateUrl: './home-admin.html',
  styleUrl: './home-admin.css',
})
export class HomeAdmin {}
