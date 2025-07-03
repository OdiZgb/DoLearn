import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
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
import { CommonModule, NgIf } from '@angular/common';

declare const google: any;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
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
    MatSnackBarModule,
    NgIf
  ]
})
export class RegisterComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('googleSignInButton', { static: false }) googleSignInButton!: ElementRef;
  
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  private googleInitialized = false;

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
    this.loadGoogleAuthLibrary();
  }

  ngAfterViewInit() {
    this.checkGoogleAndRender();
  }

  private checkGoogleAndRender() {
    if (typeof google !== 'undefined' && google.accounts && this.googleSignInButton?.nativeElement) {
      this.renderGoogleButton();
    } else {
      setTimeout(() => this.checkGoogleAndRender(), 100);
    }
  }

  ngOnDestroy() {
    this.cleanupGoogleScript();
  }

  private loadGoogleAuthLibrary() {
    if (typeof google !== 'undefined') {
      this.initializeGoogle();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.id = 'google-signin-script';
    script.onload = () => {
      console.log('Google script loaded successfully');
      this.initializeGoogle();
      this.checkGoogleAndRender();
    };
    script.onerror = (error) => {
      console.error('Failed to load Google script:', error);
      this.snackBar.open('Failed to load Google Sign-In. Please disable adblocker.', 'OK', {
        duration: 10000
      });
    };
    document.head.appendChild(script);
  }

  private initializeGoogle() {
    try {
      google.accounts.id.initialize({
        client_id: '1027061470306-0qttu3c6aeglcc0pkmpt3d5b466aqof3.apps.googleusercontent.com',
        callback: (response: any) => {
          if (response?.credential) {
            this.handleGoogleCredential(response.credential);
          }
        },
        auto_select: false
      });
      this.googleInitialized = true;
    } catch (e) {
      console.error('Google initialization failed:', e);
    }
  }

  private renderGoogleButton() {
    if (!this.googleInitialized || !this.googleSignInButton?.nativeElement) {
      setTimeout(() => this.renderGoogleButton(), 100);
      return;
    }

    try {
      google.accounts.id.renderButton(
        this.googleSignInButton.nativeElement,
        {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'rectangular'
        }
      );
    } catch (e) {
      console.error('Google button render failed:', e);
      setTimeout(() => this.renderGoogleButton(), 500);
    }
  }

  private cleanupGoogleScript() {
    const script = document.getElementById('google-signin-script');
    if (script) {
      script.remove();
    }
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.cancel();
    }
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(err.error?.message || 'Registration failed. Please try again.', 'Dismiss', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  handleGoogleCredential(idToken: string) {
    if (!idToken) {
      this.snackBar.open('Invalid Google token received', 'OK');
      return;
    }
    
    this.isLoading = true;
    this.authService.googleLogin(idToken).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(
          err.error?.message || 'Google login failed. Try another method.',
          'OK',
          { duration: 5000 }
        );
      }
    });
  }
}