import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './components/auth/login/login.component';
import { ForgetpasswordComponent } from './components/auth/forgetpassword/forgetpassword.component';
import { AdminComponent } from './components/auth/admin/admin.component';
import { AuthService } from './services/auth.service';
import { JwtModule } from '@auth0/angular-jwt';
import { UsersComponent } from './components/auth/admin/users/users.component';
import { JwtInterceptorService } from './services/jwt-interceptor.service';  // Ensure this path is correct

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    RegisterComponent,
    HomeComponent,
    AdminComponent,
    LoginComponent,
    ForgetpasswordComponent,
    UsersComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule, // Import ReactiveFormsModule
    FormsModule,         // Import FormsModule
    AppRoutingModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptorService, multi: true },
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
