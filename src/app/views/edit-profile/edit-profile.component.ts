import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../models/user.interface';
import { ApiService } from '../../services/api-service.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModalLoginComponent } from '../../components/modal-login/modal-login.component';
import { LanguageService } from '../../services/language.service';
import { UserStateService } from '../../services/user-state.service';
import { NgClass } from '@angular/common';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [FormsModule, Footer, ModalLoginComponent, NgClass],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  userData: Usuario | null = null;
  errors: { [key: string]: string } = {};
  loading = false;
  isSpanish: boolean = true;
  showLoginModal: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  userId: number = 0;

  constructor(
    private languageService: LanguageService,
    private router: Router,
    private apiService: ApiService,
    private userStateService: UserStateService
  ) {
    this.languageService.isSpanish$.subscribe(
      isSpanish => (this.isSpanish = isSpanish)
    );
  }

  ngOnInit() {
    this.userStateService.user$.subscribe(user => {
      if (user) {
        this.userData = { ...user }; 
        this.userId = user.id;
      } else {
        
        this.router.navigate(['/']);
      }
    });
  }

  toggleLanguage(language: 'es' | 'en') {
    this.languageService.setLanguage(language);
    localStorage.setItem('language', language);
  }

  getText(es: string, en: string): string {
    return this.isSpanish ? es : en;
  }

  openLoginModal() {
    this.showLoginModal = true;
  }
  showPassword: boolean = false;

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    }
  }
  validarFormulario(): boolean {
    this.errors = {};

    if (!this.userData) {
      this.errorMessage = this.getText('Datos de usuario no disponibles', 'User data not available');
      return false;
    }

    // Nombre validation
    if (!this.userData.nombre || String(this.userData.nombre).trim() === '') {
      this.errors['nombre'] = this.getText('El nombre es obligatorio', 'Name is required');
    }

    // Apellidos validation
    if (!this.userData.apellidos || String(this.userData.apellidos).trim() === '') {
      this.errors['apellidos'] = this.getText('Los apellidos son obligatorios', 'Last name is required');
    }

    // Email validation
    if (!this.userData.email || String(this.userData.email).trim() === '') {
      this.errors['email'] = this.getText('El email es obligatorio', 'Email is required');
    } else if (!this.validarEmail(this.userData.email)) {
      this.errors['email'] = this.getText('El email no es válido', 'Email is not valid');
    }

    // Telefono validation
    if (!this.userData.telefono || String(this.userData.telefono).trim() === '') {
      this.errors['telefono'] = this.getText('El teléfono es obligatorio', 'Phone is required');
    } else if (!this.validarTelefono(String(this.userData.telefono))) {
      this.errors['telefono'] = this.getText('El teléfono debe tener 9 dígitos', 'Phone must have 9 digits');
    }

   
    if (!this.userData.password || String(this.userData.password).trim() === '') {
      this.errors['password'] = this.getText('La contraseña es obligatoria', 'Password is required');
    } else if (String(this.userData.password).length < 6) {
      this.errors['password'] = this.getText('La contraseña debe tener al menos 6 caracteres', 'Password must be at least 6 characters long');
    } else if (!/[A-Z]/.test(String(this.userData.password)) || !/[0-9]/.test(String(this.userData.password))) {
      this.errors['password'] = this.getText(
        'La contraseña debe incluir al menos una mayúscula y un número',
        'Password must include at least one uppercase letter and one number'
      );
    }

   
    return Object.keys(this.errors).length === 0;
  }
  

  validarEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validarTelefono(telefono: string): boolean {
    const re = /^\d{9}$/;
    return re.test(telefono);
  }

  guardarCambios() {
    if (this.validarFormulario() && this.userData && this.userId > 0) {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';

      

      // Ensure the ID is included
      this.userData.id = this.userId;

      this.apiService.editProfile(this.userId, this.userData).subscribe({
        next: (response) => {

          // Update user state
          this.userStateService.updateUser(this.userData!);

          // Show success message
          this.successMessage = this.getText('Perfil actualizado con éxito', 'Profile updated successfully');

          // Redirect after delay
          setTimeout(() => {
            this.router.navigate(['/showProfile']);
            this.loading = false;
          }, 1500);
        },
        error: (error) => {
          console.error('Error al actualizar el perfil:', error);

          if (error.status === 405) {
            this.errorMessage = this.getText(
              'Error: Método no permitido. Por favor, contacte al administrador.',
              'Error: Method not allowed. Please contact the administrator.'
            );
          } else if (error.status === 404) {
            this.errorMessage = this.getText('Error: Usuario no encontrado.', 'Error: User not found.');
          } else {
            this.errorMessage = this.getText(
              'Error al actualizar el perfil. Por favor, intente de nuevo.',
              'Error updating profile. Please try again.'
            );
          }

          this.loading = false;
        }
      });
    } else {
      if (this.userId <= 0) {
        this.errorMessage = this.getText('Error: ID de usuario no válido.', 'Error: Invalid user ID.');
      }
    }
  }

  cancelar() {
    this.router.navigate(['/showProfile']);
  }
}