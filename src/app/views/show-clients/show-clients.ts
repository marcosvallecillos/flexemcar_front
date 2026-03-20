import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Usuario } from '../../models/user.interface';
import { ApiService } from '../../services/api-service.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { LanguageService } from '../../services/language.service';
import { AsideAdmin } from "../../components/aside-admin/aside-admin";

@Component({
  selector: 'app-show-clients',
  imports: [ DatePipe, FormsModule, ],
  templateUrl: './show-clients.html',
  styleUrl: './show-clients.css',
})
export class ShowClients implements OnInit {
  usuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];
  searchTerm = '';
  
  currentDate = new Date();
  loading = true;
 
  // Paginación
  currentPage = 1;
  pageSize = 7;
  totalPages = 1;
 
  // Modal confirmación eliminación
  showDeleteModal = false;
  userToDelete: Usuario | null = null;
  isSpanish: boolean = false;
  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private languageService: LanguageService,
    
    private cdr: ChangeDetectorRef
  ) {
    this.languageService.isSpanish$.subscribe(
      isSpanish => this.isSpanish = isSpanish
    );
  }

  getText(es: string, en: string): string {
    return this.isSpanish ? es : en;
  }

 
  ngOnInit() {
    this.loadUsers();
  }
    loadUsers() {
    this.loading = true;
    this.apiService.getAllUsers().subscribe({
      next: (users) => {
        this.usuarios = users;
        this.filteredUsuarios = [...users];
        this.totalPages = Math.ceil(users.length / this.pageSize);
        this.loading = false;
        this.cdr.detectChanges(); // ← fuerza actualización de la vista
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.usuarios = [];
        this.filteredUsuarios = [];
        this.loading = false;
        this.cdr.detectChanges(); // ← también en el error
      }
    });
  }
  onSearch() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredUsuarios = this.usuarios;
    } else {
      this.filteredUsuarios = this.usuarios.filter(u =>
        u.nombre?.toLowerCase().includes(term) ||
        u.apellidos?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.rol?.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredUsuarios.length / this.pageSize);
  }
 
  get paginatedUsers(): Usuario[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsuarios.slice(start, start + this.pageSize);
  }
 
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
 
  setPage(p: number) {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
  }
 
  getInitials(u: Usuario): string {
    const n = u.nombre?.[0] || '';
    const a = u.apellidos?.[0] || '';
    return (n + a).toUpperCase() || '?';
  }
 
  getAvatarColor(u: Usuario): string {
    const colors = [
      '#10b981', '#6366f1', '#f59e0b', '#ef4444',
      '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6'
    ];
    const idx = (u.id || 0) % colors.length;
    return colors[idx];
  }
 
  getRolLabel(rol: string): string {
    const map: Record<string, string> = {
      admin: 'Admin',
      user: 'Usuario',
      editor: 'Editor'
    };
    return map[rol] || rol;
  }
 
  confirmDelete(u: Usuario) {
    this.userToDelete = u;
    this.showDeleteModal = true;
  }
 
  cancelDelete() {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }
 
  executeDelete() {
    if (!this.userToDelete?.id) return;
    this.apiService.deleteUser(this.userToDelete.id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(u => u.id !== this.userToDelete!.id);
        this.onSearch();
        this.showDeleteModal = false;
        this.userToDelete = null;
      window.location.reload()
      },
      error: (err) => console.error('Error eliminando usuario:', err)
    });
  }
 
  editUser(u: Usuario) {
    this.router.navigate(['/admin/users', u.id, 'edit']);
  }
 
  addNewUser() {
    this.router.navigate(['/admin/create-users']);
  }
 
  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
 
 formatLastLogin(u: Usuario): string {
    const fecha = u.last_login; // ✅ ahora usa el campo tipado
    if (!fecha) return 'Sin acceso';
    const d = new Date(fecha);
    return d.toLocaleString('es-ES', { 
        day: '2-digit', 
        month: 'short',
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
    });
}
}