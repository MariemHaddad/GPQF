import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as bcrypt from 'bcryptjs';
import { AuthService } from 'src/app/services/auth.service';
import { CryptoService } from 'src/app/services/crypto.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {Form: FormGroup;
  errorMessage: string = '';
  message: string = '';

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder) {
    this.Form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {}

  login() {
    if (this.Form.invalid) {
      console.log('Form is invalid');
      this.displayValidationErrors();
      return;
    }

    console.log('Form values:', this.Form.value);

    this.authService.authenticate(this.Form.value.email, this.Form.value.password).subscribe({
      next: (data: { token: string; id: string; role: string }) => {
        console.log('Login successful:', data);
        this.authService.setToLocalStorage("token", data.token);
        this.authService.setToLocalStorage("id", data.id);
        this.authService.setToLocalStorage("role", data.role);

        if (data.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err: { status: number }) => {
        console.error('Login error:', err);
        if (err.status === 401) {
          this.message = 'Bad Credential';
        }
      }
    });
  }

  displayValidationErrors() {
    for (const key in this.Form.controls) {
      if (this.Form.controls.hasOwnProperty(key)) {
        const control = this.Form.controls[key];
        if (control.invalid) {
          console.error(`Validation error in ${key}:`, control.errors);
        }
      }
    }
  }
}