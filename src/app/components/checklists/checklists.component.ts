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
  phaseDescription: string = '';  // Stores phase description
  NomP: string = '';  // Stores project name
  isRQualite: boolean = false;  // Determines if the user has the 'RQUALITE' role
  isEditing: boolean = false;  // Tracks if the component is in editing mode
  checklist: Checklist = {
    idCh: 0,
    status: '',
    remarque: '',
    items: []  // Initialize checklist items as an empty array
  };
  resultatItem : string[] = [
    "OK",
    "NOK",
    "NA"
  ];

  statusOptions: string[] = ['EN_ATTENTE', 'ACCEPTE', 'REFUSE'];  // Available status options
  isCausalAnalysisModalOpen: boolean = false; // Modal state for causal analysis
  phaseId: number = 0; // Store the phase ID if needed

  constructor(
    private route: ActivatedRoute,
    private checklistService: ChecklistService,
    private authService: AuthService,
    private router: Router 
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const phaseId = +(params.get('phaseId') ?? 0);  // Ensure phaseId is always a number
      this.phaseDescription = this.route.snapshot.queryParamMap.get('phaseDescription') || '';
      this.NomP = this.route.snapshot.queryParamMap.get('NomP') || '';
  
      this.isRQualite = this.authService.hasRole('RQUALITE');
      console.log('isRQualite:', this.isRQualite);
  
      if (phaseId !== 0) {  // Check if phaseId is valid (not 0)
        this.refreshChecklist(phaseId);
      }
    });
  }

  refreshChecklist(phaseId: number): void {
    this.checklistService.getChecklistByPhase(phaseId).subscribe(
      checklist => {
        this.checklist = checklist;  // Update the checklist in the component
      },
      error => {
        console.error('Erreur lors de la récupération de la checklist:', error);
      }
    );
  }

  // Enable editing mode
  startEditing() {
    console.log('Mode édition activé');
    this.isEditing = true;
  }

  // Save checklist changes
  saveChecklist() {
    console.log('Sauvegarde des modifications');
    this.checklistService.updateChecklist(this.checklist).subscribe(
      response => {
        console.log('Checklist mise à jour avec succès');
        
        if (this.checklist.status === 'REFUSE') {
          this.isCausalAnalysisModalOpen = true; // Open the causal analysis modal
        } else {
          // Refresh checklist if not refused
          if (this.checklist.idCh !== undefined) {
            this.refreshChecklist(this.checklist.idCh); // Call refreshChecklist only if idCh is defined
          } else {
            console.error('Checklist ID is undefined, cannot refresh checklist.');
          }
        }

        this.isEditing = false;
      },
      error => {
        console.error('Erreur lors de la mise à jour de la checklist:', error);
      }
    );
}
  // Method to close the causal analysis modal
  closeCausalAnalysisModal(): void {
    this.isCausalAnalysisModalOpen = false; // Close the modal
  }

  // Method to navigate to causal analysis
  navigateToCausalAnalysis(): void {
    this.router.navigate(['/causal-analysis', this.checklist.idCh]);
    this.isCausalAnalysisModalOpen = false; // Close the modal after navigation
  }
}