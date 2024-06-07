import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup,  Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registrationForm!: FormGroup;
  message!:string;
 
  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthService
  ) { }
 
  ngOnInit(): void {
    this.registrationForm = this.formBuilder.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  createaccount() {
    if (this.registrationForm.valid) {
      this.auth.createaccount(this.registrationForm.value).subscribe({
        next: (data) => {
          this.registrationForm.reset();
          this.message = 'Account Created';
        },
        error: (err) => {
          console.log(err);
        }
      });
    } else {
      console.log('Form is invalid');
    }
  }
}