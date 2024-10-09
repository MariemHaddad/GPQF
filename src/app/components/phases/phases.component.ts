import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Checklist } from 'src/app/modules/checklist';
import { Phase } from 'src/app/modules/phase';
import { ChecklistService } from 'src/app/services/checklist.service';
import { PhaseService } from 'src/app/services/phase.service';
import { AuthService } from 'src/app/services/auth.service'; // Service d'authentification
import { Chart, registerables } from 'chart.js/auto';

import ChartDataLabels from 'chartjs-plugin-datalabels';
import { FormControl, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-phases',
  templateUrl: './phases.component.html',
  styleUrls: ['./phases.component.css']
})
export class PhasesComponent implements OnInit {  
  selectedProjectId: number = 0;
  isAddModalOpen: boolean = false;
  isDeleteModalOpen = false;
  phaseIdToDelete: number | undefined;
  phases: Phase[] = [];
  projetId!: number;
 
  selectedPhase?: Phase;
  message: string = '';
  isRqualite: boolean = false; 
  isEditMode: boolean = false;
  phasesToAdd: Phase[] = [];
  showForm: boolean = false;
  editPhaseForm: any;
  @ViewChild('editModal') editModal!: ElementRef;
  isModalOpen = false;
  // Variables pour les variances
  effortVariances: number[] = [];
  scheduleVariances: number[] = [];
  chartEffort: any;
  chartSchedule: any;
  internalNCRate: number = 0;  
  externalNCRate: number = 0;
  chartInternal: any;
  chartExternal: any;
  VALID_PHASE_NAMES = [
    "La conception préliminaire",
    "La conception détaillée",
    "La mise en œuvre",
    "La vérification",
    "La validation",
    "Code",
    "Spécification",
    "Livraison"
  ];

  nouvellePhase: any = {
    description: ''
  };
  filteredSuggestions: string[] = [];

  constructor(
    private phaseService: PhaseService,
    private checklistService: ChecklistService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router // Ajout de Router pour la navigation
  ) {
    this.nouvellePhase = new Phase(
      0, '', '', '', '', new Checklist(0, '', '', [], {} as Phase), '', '', 'EN_ATTENTE'
    );
  }

  ngOnInit(): void {
    this.editPhaseForm = new FormGroup({
      description: new FormControl('', Validators.required),
      objectifs: new FormControl(''),
      plannedStartDate: new FormControl(''),
      plannedEndDate: new FormControl(''),
      effectiveStartDate: new FormControl(''),
      effectiveEndDate: new FormControl(''),
      effortActuel: new FormControl(''),
      effortPlanifie: new FormControl(''),
      etat: new FormControl(''),
      statusLivraisonInterne: new FormControl(''),
      statusLivraisonExterne: new FormControl('')
    });
    // Registering Chart.js components (including scales)
    Chart.register(...registerables);

    // Subscribe to route params to get projetId
    this.route.paramMap.subscribe(params => {
      const projetIdParam = params.get('projetId');
      if (projetIdParam) {
        this.projetId = +projetIdParam;
        this.loadPhases();
      } else {
        console.error('projetId param is null.');
      }
    });

    this.isRqualite = this.authService.hasRole('Rqualite');

    // Initialize charts after loading data
    this.createCharts();
    this.createNCCharts();
  }

  onDescriptionChange() {
    const input = this.nouvellePhase.description.toLowerCase();
    this.filteredSuggestions = this.VALID_PHASE_NAMES;
}

selectSuggestion(suggestion: string) {
  this.nouvellePhase.description = suggestion; // Remplacer la description par la suggestion sélectionnée
  this.filteredSuggestions = []; // Vider la liste des suggestions après sélection
}
  openAddModal(): void {
    this.isAddModalOpen = true; // Ouvrir le modal
  }

  // Méthode pour fermer le modal d'ajout
  closeAddModal(): void {
    this.isAddModalOpen = false; // Fermer le modal
    this.resetNouvellePhase(); // Réinitialiser le formulaire
  }
  openDeleteModal(id: number): void {
    this.phaseIdToDelete = id; // Sauvegarder l'ID de la phase à supprimer
    this.isDeleteModalOpen = true; // Ouvrir le modal
  }

  // Méthode pour fermer le modal de suppression
  closeDeleteModal(): void {
    this.isDeleteModalOpen = false; // Fermer le modal
    this.phaseIdToDelete = undefined; // Réinitialiser l'ID
  }
  
  confirmDeletePhase(): void {
    if (this.phaseIdToDelete !== undefined) {
        this.phaseService.deletePhase(this.phaseIdToDelete).subscribe(
            response => {
                // Réaction après la suppression réussie
                this.phases = this.phases.filter(phase => phase.idPh !== this.phaseIdToDelete);
                this.message = response; // Utilisez la réponse texte directement
                
                // Rafraîchir l'affichage des phases
                this.loadPhases(); // Reload phases after deletion

                setTimeout(() => {
                    this.loadPhases(); // Reload phases after a short delay if needed
                }, 2000); // Ajuster le délai si nécessaire
            },
            error => {
                console.error("Erreur lors de la suppression de la phase :", error);
                alert("Une erreur s'est produite lors de la suppression de la phase.");
            }
        );
    }
    this.closeDeleteModal(); // Fermer le modal après confirmation
}
  viewCausalAnalysis(phase: Phase) {
    if (phase.checklist?.idCh) {
      this.router.navigate(['/causal-analysis', phase.checklist.idCh]);
    } else {
      console.error('Checklist ID is undefined.');
    }
  }
  loadPhases() {
    if (this.projetId) {
        this.phaseService.getPhasesByProjet(this.projetId).subscribe(
            phases => {
                this.phases = phases.map(phase => ({
                    ...phase,
                    plannedStartDate: phase.plannedStartDate ? new Date(phase.plannedStartDate).toISOString().split('T')[0] : '',
                    plannedEndDate: phase.plannedEndDate ? new Date(phase.plannedEndDate).toISOString().split('T')[0] : '',
                    effectiveStartDate: phase.effectiveStartDate ? new Date(phase.effectiveStartDate).toISOString().split('T')[0] : undefined,
                    effectiveEndDate: phase.effectiveEndDate ? new Date(phase.effectiveEndDate).toISOString().split('T')[0] : undefined
                }));

                // Chargez les checklists pour les phases
                this.phases.forEach(phase => {
                    if (phase.idPh) {
                        this.checklistService.getChecklistByPhase(phase.idPh).subscribe(
                            checklist => {
                                phase.checklist = checklist;
                            },
                            error => {
                                if (error.status === 404) {
                                    phase.checklist = null; // Aucune checklist trouvée
                                } else {
                                    console.error('Erreur lors de la récupération de la checklist pour la phase:', error);
                                }
                            }
                        );
                    }
                });

                this.calculateRates(); // Calculer les taux NC

                // Récupérer les taux de NC externes et internes
                this.phaseService.getTauxNCExterne(this.projetId).subscribe(rate => {
                    this.externalNCRate = rate;
                    this.createNCCharts(); // Créer les graphiques après récupération
                });

                this.phaseService.getTauxNCInterne(this.projetId).subscribe(rate => {
                    this.internalNCRate = rate;
                    this.createNCCharts(); // Créer les graphiques après récupération
                });

                
           // Créer les graphiques NC après le calcul
          this.loadVariances(); 
          if (this.phases.length === 0) {
            this.message = 'Aucune phase disponible pour ce projet.';
          }
        },
        error => {
          console.error('Error loading phases:', error);
          this.message = 'Erreur lors du chargement des phases.';
        }
      );
    }
  }
 
  addPhases() {
    console.log('Phases to add before sending:', this.phasesToAdd);

    this.phaseService.addPhases(this.phasesToAdd, this.projetId).subscribe(
        response => {
            console.log('Server response:', response); 
            this.closeAddModal();// Confirm response
            this.loadPhases(); // Reload phases
            this.resetNouvellePhase(); // Reset form
            this.phasesToAdd = []; // Clear list
        },
        error => {
            console.error('Erreur lors de l\'ajout des phases:', error);
            this.message = this.getErrorMessage(error);
        }
    );
  }

  addPhaseToList(phase: Phase) {
    console.log('Adding phase to list:', phase);
    this.phasesToAdd.push(phase);
    console.log('Current phases to add:', this.phasesToAdd);
  }

  initializeChecklist(phaseId: number) {
    this.checklistService.initializeChecklist(phaseId).subscribe(
      checklist => {
        console.log('Checklist initialisée:', checklist);
        this.message = 'Checklist initialisée avec succès.';
        this.loadPhases();
      },
      error => {
        console.error('Erreur lors de l\'initialisation de la checklist:', error);
        this.message = 'Erreur lors de l\'initialisation de la checklist.';
      }
    );
  }

  updateChecklistStatus(checklist: Checklist, status: string, remarque: string) {
    if (checklist.idCh) {
      this.checklistService.updateChecklistStatus(checklist.idCh, status, remarque).subscribe(
        response => {
          console.log('Statut de la checklist mis à jour:', response);
          this.message = 'Statut de la checklist mis à jour avec succès.';
          this.loadPhases();
        },
        error => {
          console.error('Erreur lors de la mise à jour du statut de la checklist:', error);
          this.message = 'Erreur lors de la mise à jour du statut de la checklist.';
        }
      );
    } else {
      console.error('Checklist ID is undefined.');
    }
  }

  updateChecklistItems(checklist: Checklist) {
    if (checklist.idCh) {
      this.checklistService.updateChecklistItems(checklist.idCh, checklist.items).subscribe(
        response => {
          console.log('Items de la checklist mis à jour:', response);
          this.message = 'Items de la checklist mis à jour avec succès.';
          this.loadPhases();
        },
        error => {
          console.error('Erreur lors de la mise à jour des items de la checklist:', error);
          this.message = 'Erreur lors de la mise à jour des items de la checklist.';
        }
      );
    } else {
      console.error('Checklist ID is undefined.');
    }
  }

  viewChecklist(phase: Phase) {
    if (phase.idPh) {
      this.router.navigate(['/checklists', phase.idPh], {
        queryParams: { phaseDescription: phase.description, projectName: this.projetId }
      });
    } else {
      console.error('Phase ID is undefined.');
    }
  }
 
  deletePhase(id: number | undefined): void {
    if (id === undefined) {
        console.error("ID de phase non défini.");
        return;
    }

    // La confirmation se fait via le modal maintenant
    this.phaseIdToDelete = id; // Sauvegarder l'ID de la phase à supprimer
    this.isDeleteModalOpen = true; // Ouvrir le modal
}
editPhase(phase: Phase) {
  this.selectedPhase = { ...phase }; 
  this.isEditMode = true;
  this.editPhaseForm.setValue({
    description: phase.description || '',
    objectifs: phase.objectifs || '',
    plannedStartDate: phase.plannedStartDate || '',
    plannedEndDate: phase.plannedEndDate || '',
    effectiveStartDate: phase.effectiveStartDate || '',
    effectiveEndDate: phase.effectiveEndDate || '',
    effortActuel: phase.effortActuel || '',
    effortPlanifie: phase.effortPlanifie || '',
    etat: phase.etat || '',
    statusLivraisonInterne: phase.statusLivraisonInterne || '',
    statusLivraisonExterne: phase.statusLivraisonExterne || ''
  });
  this.isModalOpen = true; // Ouvre le modal ici
}
savePhase() {
  if (this.selectedPhase) {
    console.log('Tentative de mise à jour de la phase...');
    this.phaseService.updatePhase(this.selectedPhase).subscribe(
      response => {
        console.log('Phase mise à jour:', response);

        // Refresh the phases list
        this.loadPhases(); 

        // Close the modal and reset the form
        this.resetEditMode(); 

        // Optional: Display success message
        this.message = 'Phase mise à jour avec succès.';
      },
      error => {
        console.error('Erreur lors de la mise à jour de la phase:', error);
        this.message = 'Erreur lors de la mise à jour de la phase.';
      }
    );
  }
}
  resetEditMode() {
    this.selectedPhase = undefined; // Clear the selected phase
    this.isEditMode = false; // Exit edit mode
    this.editPhaseForm.reset(); // Reset the form if you're using a reactive form
  }

getErrorMessage(error: any): string {
  // Handle error messages based on error structure
  return 'Une erreur s\'est produite.';
}

onSubmitEditPhase() {
  if (this.editPhaseForm.valid) {
    const updatedPhase = this.editPhaseForm.value;
    updatedPhase.idPh = this.selectedPhase!.idPh; // Ajoutez l'ID de la phase à l'objet mis à jour

    this.phaseService.updatePhase(updatedPhase).subscribe(
      response => {
        console.log('Phase mise à jour:', response);
        this.loadPhases(); // Recharger les phases après mise à jour
        this.message = 'Phase mise à jour avec succès.';
        this.closeModal(); // Fermer le modal après le succès de la mise à jour
      },
      error => {
        console.error('Erreur lors de la mise à jour de la phase:', error);
        this.message = 'Erreur lors de la mise à jour de la phase.';
      }
    );
  }
}

// Call closeModal here if necessary


closeModal() {
  this.isModalOpen = false;  // Ferme le modal
  this.editPhaseForm.reset();  // Réinitialise le formulaire
  this.selectedPhase = undefined; // Efface la phase sélectionnée
  this.isEditMode = false; // Sort du mode édition
}
  openModal() {
    this.isModalOpen = true;
  }

  // Méthode pour fermer la modale
  
  private formatDate(dateString: string | undefined): string | undefined {
    return dateString ? new Date(dateString).toISOString().split('T')[0] : undefined;
  }
  
  resetNouvellePhase(): void {
    this.nouvellePhase = new Phase(
      0, '', '', '', '', new Checklist(0, '', '', [], {} as Phase), '', '', 'EN_ATTENTE'
    );
  }
  loadVariances() {
    this.effortVariances = [];
    this.scheduleVariances = [];

    this.phases.forEach(phase => {
      if (phase.idPh) {
        this.phaseService.getEffortVariance(phase.idPh).subscribe(effort => {
          console.log(`Effort variance for phase ${phase.description}:`, effort);
          this.effortVariances.push(effort);
        });
        this.phaseService.getScheduleVariance(phase.idPh).subscribe(schedule => {
          console.log(`Schedule variance for phase ${phase.description}:`, schedule);
          this.scheduleVariances.push(schedule);
        });
      }
    });

    // Delay to ensure data is ready before creating charts
    setTimeout(() => {
      console.log('Effort Variances:', this.effortVariances);
      console.log('Schedule Variances:', this.scheduleVariances);
      this.createCharts();
    }, 1000); // Wait for data to load before rendering charts
  }

  createCharts() {
    setTimeout(() => {
      const ctxEffort = document.getElementById('effortChart') as HTMLCanvasElement;
      const ctxSchedule = document.getElementById('scheduleChart') as HTMLCanvasElement;
  
      if (this.chartEffort) {
        this.chartEffort.destroy();
      }
  
      this.chartEffort = new Chart(ctxEffort, {
        type: 'line',
        data: {
          labels: this.phases.map(p => p.description), // Phase labels
          datasets: [{
            label: 'Effort Variance',
            data: this.effortVariances,
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: false,
            pointRadius: 5, // Adjust point size
            pointBackgroundColor: 'rgba(75, 192, 192, 1)'
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Effort Variance'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Phases'
              }
            }
          },
          plugins: {
            datalabels: {
              anchor: 'end',
              align: 'top',
              formatter: (value) => `${value.toFixed(2)}h`, // Format values as hours with 2 decimals
              font: {
                size: 10
              }
            }
          }
        },
        plugins: [ChartDataLabels]
      });
  
      if (this.chartSchedule) {
        this.chartSchedule.destroy();
      }
  
      this.chartSchedule = new Chart(ctxSchedule, {
        type: 'line',
        data: {
          labels: this.phases.map(p => p.description), // Phase labels
          datasets: [{
            label: 'Schedule Variance',
            data: this.scheduleVariances,
            borderColor: 'rgba(153, 102, 255, 1)',
            fill: false,
            pointRadius: 5,
            pointBackgroundColor: 'rgba(153, 102, 255, 1)'
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Schedule Variance'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Phases'
              }
            }
          },
          plugins: {
            datalabels: {
              anchor: 'end',
              align: 'top',
              formatter: (value) => `${value.toFixed(2)} days`, // Format as days
              font: {
                size: 10
              }
            }
          }
        },
        plugins: [ChartDataLabels]
      });
    }, 500); // Delay to ensure proper rendering
  }
  

  createNCCharts() {
    // Ensure internal and external rates are calculated before creating charts
    this.calculateRates();

    // Check if the internalNCRate and externalNCRate are valid
    if (this.internalNCRate == null || this.externalNCRate == null) {
        console.error('Invalid NCRates:', { internalNCRate: this.internalNCRate, externalNCRate: this.externalNCRate });
        return; // Early return to avoid errors
    }

    // Créez le graphique interne
    this.chartInternal = new Chart('chartInternal', {
        type: 'bar', // ou le type de graphique que vous souhaitez
        data: {
            labels: ['Project'], // Remplacez par vos labels
            datasets: [{
                label: 'NC Interne',
                data: [this.internalNCRate], // Remplacez par vos données réelles
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                datalabels: {
                    display: true,
                    align: 'end',
                    anchor: 'end'
                }
            }
        }
    });

    // Créez le graphique externe
    this.chartExternal = new Chart('chartExternal', {
        type: 'bar',
        data: {
            labels: ['Project'], // Remplacez par vos labels
            datasets: [{
                label: 'NC Externe',
                data: [this.externalNCRate], // Remplacez par vos données réelles
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                datalabels: {
                    display: true,
                    align: 'end',
                    anchor: 'end'
                }
            }
        }
    });
}

calculateRates() {
    let internalCount = 0;
    let externalCount = 0;
    const totalCount = this.phases.length;

    if (totalCount === 0) {
        this.internalNCRate = 0;
        this.externalNCRate = 0;
        return; // Early return if there are no phases
    }

    this.phases.forEach(phase => {
      if (phase.statusLivraisonInterne === 'NC') {
          internalCount++;
      }
      if (phase.statusLivraisonExterne === 'NC') {
          externalCount++;
      }
  });

  this.internalNCRate = (internalCount / totalCount) * 100;
  this.externalNCRate = (externalCount / totalCount) * 100;
}
}


