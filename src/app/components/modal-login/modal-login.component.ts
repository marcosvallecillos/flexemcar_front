import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { Usuario } from '../../models/user.interface';
import { ApiService } from '../../services/api-service.service';
import { UserStateService } from '../../services/user-state.service';

@Component({
  selector: 'app-modal-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './modal-login.component.html',
  styleUrl: './modal-login.component.css'
})
export class ModalLoginComponent {
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();

  loginForm: FormGroup;
  registerForm: FormGroup;
  isRegister: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  errorMessage: string = '';
  goodMessage: string = '';
  isLoading: boolean = false;
  isSpanish: boolean = true;
  showAlert: boolean = false;

  constructor(
    private languageService: LanguageService,
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private apiService: ApiService,
    private userStateService: UserStateService
  ) {
    // Formulario de login
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    // Formulario de registro
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(5)]],
      confirmPassword: ['', [Validators.required]],
      rol: ['usuario', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });

    this.setDefaultRole();

    this.languageService.isSpanish$.subscribe(isSpanish => {
      this.isSpanish = isSpanish;
    });
  }

  passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const group = control as FormGroup;
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsDoNotMatch: true };
  };

  toggleTab(isRegister: boolean) {
    this.isRegister = isRegister;
    this.errorMessage = '';
    this.loginForm.reset();
    this.registerForm.reset();
    this.setDefaultRole();
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.errorMessage = this.getText('Por favor, completa todos los campos correctamente', 'Please fill all fields correctly');
      this.loginForm.markAllAsTouched();
      return;
    }
  
    this.isLoading = true;
    this.errorMessage = '';
  
    const { email, password } = this.loginForm.value;

    this.apiService.loginUser(email, password).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        
        if (response && response.status === 'ok') {
          const userData: Usuario = {
            id: response.id,
            email: response.email,
            nombre: response.nombre,
            apellidos: response.apellidos,
            telefono: response.telefono,
            password: '',
            confirm_password: '',
            rol: response.rol,
            citas_reservadas: [],
          };
          
          this.authService.login(userData);
          this.userStateService.updateUser(userData);
          this.close.emit();
          this.router.navigate(['/home-barber']);
        } else {
          this.errorMessage = this.getText('Credenciales inválidas', 'Invalid credentials');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        this.errorMessage = this.getText(
          'Error al iniciar sesión. Por favor, verifica tus credenciales.',
          'Login error. Please check your credentials.'
        );
      }
    });
  }
  
  registrarUsuario() {
    if (this.registerForm.invalid || this.registerForm.hasError('passwordsDoNotMatch')) {
      this.errorMessage = this.getText(
        'Por favor, completa todos los campos correctamente y verifica que las contraseñas coincidan',
        'Please fill all fields correctly and ensure passwords match'
      );
      this.registerForm.markAllAsTouched();
      return;
    }
  
    this.isLoading = true;
    this.errorMessage = '';
    this.goodMessage = '';
    
    const email = this.registerForm.get('email')?.value;
    
    // Primero verificamos si el usuario ya existe
    this.apiService.getAllUsers().subscribe({
      next: (users) => {
        const userExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());
        
        if (userExists) {
          this.isLoading = false;
          this.errorMessage = this.getText(
            'Este correo electrónico ya está registrado. Por favor, utiliza otro correo o inicia sesión.',
            'This email is already registered. Please use a different email or sign in.'
          );
          this.registerForm.get('email')?.setValue('');
          this.registerForm.get('email')?.markAsTouched();
          return;
        }
        
        // Si el usuario no existe, procedemos con el registro
        const usuario: Usuario = {
          id: 0,
          nombre: this.registerForm.get('nombre')?.value,
          apellidos: this.registerForm.get('apellido')?.value,
          email: email,
          telefono: Number(this.registerForm.get('telefono')?.value),
          password: this.registerForm.get('password')?.value,
          confirm_password: this.registerForm.get('confirmPassword')?.value,
          rol: 'usuario',
          citas_reservadas: [],
        };
      
        this.apiService.registerUser(usuario).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.showAlert = true;
            this.goodMessage = this.getText(
              'Registro exitoso, ahora puedes iniciar sesión',
              'Registration successful, you can now log in'
            );
            
            setTimeout(() => {
              this.showAlert = false;
              this.isRegister = false;
              this.registerForm.reset();
              this.setDefaultRole();
            }, 3000);
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = this.getText(
              'Error al registrar el usuario, intenta de nuevo',
              'Error registering user, please try again'
            );
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getText(
          'Error al verificar el usuario, intenta de nuevo',
          'Error checking user, please try again'
        );
      }
    });
  }

  onClose() {
    this.close.emit();
    this.errorMessage = '';
    this.loginForm.reset();
    this.registerForm.reset();
    this.setDefaultRole();
  }

  private setDefaultRole() {
    this.registerForm.patchValue({ rol: 'usuario' });
  }

  getText(es: string, en: string): string {
    return this.isSpanish ? es : en;
  }

  getControl(controlName: string) {
    return this.isRegister ? this.registerForm.get(controlName) : this.loginForm.get(controlName);
  }
}