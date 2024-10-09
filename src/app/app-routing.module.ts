import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './components/auth/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { ForgetpasswordComponent } from './components/auth/forgetpassword/forgetpassword.component';
import { AdminComponent } from './components/auth/admin/admin.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { PhasesComponent } from './components/phases/phases.component';
import { ChecklistsComponent } from './components/checklists/checklists.component';
import { CausalAnalysisComponent } from './components/causal-analysis/causal-analysis.component';

const routes: Routes = [
   // Redirection par défaut
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgetpassword', component: ForgetpasswordComponent },
  { path: 'home', component: HomeComponent },

  { path: 'admin', component: AdminComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'home/:activityId/projects', component: ProjectsComponent },
  {path:'activites/:id',component: ProjectsComponent},
  { path: 'projects/:projetId/phases', component: PhasesComponent },
  { path: 'phases/:projetId', component: PhasesComponent },
  { path: 'checklists/:phaseId', component: ChecklistsComponent },
  { path: 'causal-analysis/:checklistId', component: CausalAnalysisComponent },
  { path: '**', redirectTo: '/projects' } // Redirection pour les routes non définies
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
