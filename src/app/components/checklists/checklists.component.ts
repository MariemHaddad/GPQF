import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Checklist } from 'src/app/modules/checklist';
import { AuthService } from 'src/app/services/auth.service';
import { ChecklistService } from 'src/app/services/checklist.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-checklists',
  templateUrl: './checklists.component.html',
  styleUrls: ['./checklists.component.css']
})
export class ChecklistsComponent implements OnInit {
  phaseDescription: string = '';
  NomP: string = '';
  isRQualite: boolean = false; // Variable pour vérifier si l'utilisateur est RQUALITE
  isEditing: boolean = false;  // Variable pour vérifier si on est en mode édition
  checklist: Checklist = {
    idCh: 0,
    status: '',
    remarque: '',
    items: [] // Initialiser les items avec un tableau vide
  };

  statusOptions: string[] = ['EN_ATTENTE', 'ACCEPTE', 'REFUSE']; // Liste des options pour le statut

  constructor(
    private route: ActivatedRoute,
    private checklistService: ChecklistService,
    private authService: AuthService, // Injection du service d'authentification
    private router: Router 
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const phaseId = +params.get('phaseId')!;
      this.phaseDescription = this.route.snapshot.queryParamMap.get('phaseDescription') || '';
      this.NomP = this.route.snapshot.queryParamMap.get('NomP') || '';
  
      // Vérifier le rôle de l'utilisateur
      this.isRQualite = this.authService.hasRole('RQUALITE');
      console.log('isRQualite:', this.isRQualite); // Ajoutez ce log pour vérifier la valeur
  
      if (phaseId) {
        this.checklistService.getChecklistByPhase(phaseId).subscribe(
          checklist => {
            this.checklist = checklist;
          },
          error => {
            console.error('Erreur lors de la récupération de la checklist:', error);
          }
        );
      }
    });
  }

  startEditing() {
    console.log('Mode édition activé'); // Ajoutez ce log pour vérifier si la méthode est appelée
    this.isEditing = true;
  }

  saveChecklist() {
    console.log('Sauvegarde des modifications'); // Ajoutez ce log pour vérifier si la méthode est appelée
    this.checklistService.updateChecklist(this.checklist).subscribe(
      response => {
        console.log('Checklist mise à jour avec succès');
        if (this.checklist.status === 'REFUSE') {
          if (confirm('Vous devez remplir une analyse causale pour définir la raison de refus de la checklist. Voulez-vous continuer ?')) {
            this.router.navigate(['/causal-analysis', this.checklist.idCh]);
          }
        }
        this.isEditing = false; // Quitter le mode édition après la sauvegarde
      },
      error => {
        console.error('Erreur lors de la mise à jour de la checklist:', error);
      }
    );
  }
}