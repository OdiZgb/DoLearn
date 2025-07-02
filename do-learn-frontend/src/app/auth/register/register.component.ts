// register.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
declare const google: any; // add at the top
@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'], // Reuse login styles
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  errorMessage = '';
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }
  ngOnInit() {
    google.accounts.id.initialize({
      client_id: '1027061470306-0qttu3c6aeglcc0pkmpt3d5b466aqof3.apps.googleusercontent.com',
      callback: (response: any) => this.handleGoogleCredential(response.credential)
    });
  }
  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    
    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        this.router.navigate(['/dashboard']);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid email or password';
      }
    });
  }

 
    private showErrorToast() {
    this.snackBar.open(this.errorMessage, 'Dismiss', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      verticalPosition: 'bottom',
      horizontalPosition: 'end'
    });
  }
    startGoogleSignIn() {
    google.accounts.id.prompt(); // shows the popup
  }
 
   handleGoogleCredential(idToken: string) {
    this.isLoading = true;
    this.authService.googleLogin(idToken).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Google login failed';
        this.showErrorToast();
      }
    });
  }
}