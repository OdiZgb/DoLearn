// login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
declare const google: any; // add at the top
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatSnackBarModule // Added MatSnackBarModule here
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }
  ngOnInit() {
    google.accounts.id.initialize({
      client_id: '1027061470306-0qttu3c6aeglcc0pkmpt3d5b466aqof3.apps.googleusercontent.com',
      callback: (response: any) => this.handleGoogleCredential(response.credential)
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        if (this.loginForm.value.rememberMe) {
          localStorage.setItem('rememberedEmail', this.loginForm.value.email);
        }
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid email or password';
        this.showErrorToast();
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