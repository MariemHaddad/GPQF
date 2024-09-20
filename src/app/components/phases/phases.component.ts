import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Checklist } from 'src/app/modules/checklist';
import { Phase } from 'src/app/modules/phase';
import { ChecklistService } from 'src/app/services/checklist.service';
import { PhaseService } from 'src/app/services/phase.service';
import { AuthService } from 'src/app/services/auth.service'; // Service d'authentification
import { Chart, registerables } from 'chart.js/auto';

import ChartDataLabels from 'chartjs-plugin-datalabels';
@Component({
  selector: 'app-phases',
  templateUrl: './phases.component.html',
  styleUrls: ['./phases.component.css']
})
export class PhasesComponent implements OnInit {
  phases: Phase[] = [];
  projetId!: number;
  nouvellePhase: Phase; 
  selectedPhase?: Phase;
  message: string = '';
  isRqualite: boolean = false; 
  isEditMode: boolean = false;
  phasesToAdd: Phase[] = [];
  showForm: boolean = false;
  // Variables pour les variances
  effortVariances: number[] = [];
  scheduleVariances: number[] = [];
  chartEffort: any;
  chartSchedule: any;

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
  }

  loadPhases() {
    if (this.projetId) {
      this.phaseService.getPhasesByProjet(this.projetId).subscribe(
        phases => {
          console.log('Phases reçues:', phases);
          this.phases = phases.map(phase => ({
            ...phase,
            plannedStartDate: phase.plannedStartDate ? new Date(phase.plannedStartDate).toISOString().split('T')[0] : '',
            plannedEndDate: phase.plannedEndDate ? new Date(phase.plannedEndDate).toISOString().split('T')[0] : '',
            effectiveStartDate: phase.effectiveStartDate ? new Date(phase.effectiveStartDate).toISOString().split('T')[0] : undefined,
            effectiveEndDate: phase.effectiveEndDate ? new Date(phase.effectiveEndDate).toISOString().split('T')[0] : undefined
          }));

          // Load checklists for phases
          this.phases.forEach(phase => {
            if (phase.idPh) {
              this.checklistService.getChecklistByPhase(phase.idPh).subscribe(
                checklist => {
                  phase.checklist = checklist;
                },
                error => {
                  if (error.status === 404) {
                    phase.checklist = null; // No checklist found
                  } else {
                    console.error('Erreur lors de la récupération de la checklist pour la phase:', error);
                  }
                }
              );
            }
          });

          // Load variances
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

  addPhases() {
    console.log('Phases to add before sending:', this.phasesToAdd); // Verify data

    this.phaseService.addPhases(this.phasesToAdd, this.projetId).subscribe(
        response => {
            console.log('Server response:', response); // Confirm response
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
  
  viewCausalAnalysis(phase: Phase) {
    if (phase.checklist?.idCh) {
      this.router.navigate(['/causal-analysis', phase.checklist.idCh]);
    } else {
      console.error('Checklist ID is undefined.');
    }
  }
  
  private formatDate(dateString: string | undefined): string | undefined {
    return dateString ? new Date(dateString).toISOString().split('T')[0] : undefined;
  }
  
  private resetNouvellePhase() {
    this.nouvellePhase = new Phase(
      0, '', '', '', '', new Checklist(0, '', '', [], {} as Phase), '', '', 'EN_ATTENTE'
    );
  }

  private getErrorMessage(error: any): string {
    if (error.error instanceof ErrorEvent) {
      return `Erreur côté client: ${error.error.message}`;
    } else {
      return `Erreur côté serveur: ${error.status} - ${error.message}`;
    }
  }
}