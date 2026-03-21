import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api-service.service';
import { Usuario } from '../../models/user.interface';
import { LanguageService } from '../../services/language.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create-user',
  imports: [RouterLink, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css'
})
export class CreateUserComponent {
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isSpanish: boolean = true;
  showAlert: boolean = false;
  isProcessing: boolean = false;
  emailEnUso: boolean = false;
  @Input() tipo: 'usuario' | 'barbero' = 'usuario';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private languageService: LanguageService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef

  ) {
    this.languageService.isSpanish$.subscribe(
      isSpanish => this.isSpanish = isSpanish
    );
   }
   ngOnInit() {
    const rol = this.route.snapshot.data['rol'];
     this.createPupil.get('email')?.valueChanges.subscribe(() => {
        this.emailEnUso = false;
    });
    this.createPupil.patchValue({
      rol: rol
    });
  }
  getText(es: string, en: string): string {
    return this.isSpanish ? es : en;
  }
  passwordsMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsDoNotMatch: true };
  };

  togglePasswordVisibility(field: string): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  createPupil = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    apellido: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    telefono: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{9}$/)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(5)] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    rol: new FormControl('', { nonNullable: true })
  }, { validators: this.passwordsMatchValidator });

  @Output() confirm = new EventEmitter<void>();


  public createPupils(alumno: Usuario): void {
    this.apiService.registerUser(alumno).subscribe({
        next: (response) => {
            if (response) {
                this.showAlert = true;
                setTimeout(() => {
                    this.showAlert = false;
                    this.confirm.emit();
                    this.router.navigate(['/admin/users']);
                }, 3000);
            }
        },
        error: (error) => {
            this.isProcessing = false;
            if (error.status === 409) {
                this.emailEnUso = true;
            } else {
                console.error("Error al crear el usuario.", error);
            }
            this.cdr.detectChanges();
        }
    });
}

  onSubmit() {
    if (this.createPupil.invalid) {
      this.createPupil.markAllAsTouched();
      return;
    }
    let pupil: Usuario = {
      id: 0,
      nombre: this.createPupil.getRawValue().nombre,
      apellidos: this.createPupil.getRawValue().apellido,
      telefono: Number(this.createPupil.getRawValue().telefono),
      
      email: this.createPupil.getRawValue().email,
      password: this.createPupil.getRawValue().password,
      confirm_password: this.createPupil.getRawValue().confirmPassword,
      citas_reservadas: [],
      rol: 'usuario',
    };
    this.isProcessing = true;
    this.cdr.detectChanges();
    this.createPupils(pupil);
  }

  
  getControl(controlName: string) {
    return this.createPupil.get(controlName);
  }

}
