import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CauseIshikawa } from 'src/app/modules/causeIshikawa';
import { Pourquoi } from 'src/app/modules/pourquoi';
import { CausalAnalysisService } from 'src/app/services/causal-analysis.service';
import { AnalyseCausale } from 'src/app/modules/analyseCausale';
import { ActivatedRoute } from '@angular/router';
import { ChecklistService } from 'src/app/services/checklist.service';
import { AuthService } from 'src/app/services/auth.service';
import { PlanAction } from 'src/app/modules/planAction';

@Component({
  selector: 'app-causal-analysis',
  templateUrl: './causal-analysis.component.html',
  styleUrls: ['./causal-analysis.component.css']
})
export class CausalAnalysisComponent implements OnInit {
  checklistId: number | undefined;
  analyseCausaleId: number | undefined;
  analyseCausale: AnalyseCausale = new AnalyseCausale(0, '', '', '', 0, [], []);
  savedAnalyseCausale: any = null;
  isRqualite!: boolean; 
  loading: boolean = false;
  planAction: PlanAction | undefined;
  editMode: boolean = false;
  categoriesIshikawa: string[] = [
    'MILIEU',
    'MATIERE',
    'MOYEN_MATERIEL',
    'METHODE',
    'MAIN_D_OEUVRE',
    'MANAGEMENT',
    'MOYENS_FINANCIERS'
  ];
  constructor(
    private route: ActivatedRoute,
    private causalAnalysisService: CausalAnalysisService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isRqualite = this.authService.hasRole('RQUALITE');

    this.route.paramMap.subscribe(params => {
      const id = params.get('checklistId');
      this.checklistId = id ? +id : undefined;
      if (this.checklistId && this.checklistId > 0) {
        this.loadCausalAnalysis();
      } else {
        console.error('ID de checklist invalide:', this.checklistId);
      }
    });
  }

  updateActionPlan() {
    if (this.planAction) {
        this.causalAnalysisService.updatePlan(this.planAction).subscribe(
            response => {
                console.log('Plan d\'action mis à jour avec succès:', response);
                this.planAction = response; // Assurez-vous de mettre à jour le plan d'action avec la réponse
                this.loadActionPlan(); // Recharger les données après la mise à jour
            },
            error => {
                if (error.status === 403) {
                    console.error('Accès refusé: vous n\'avez pas les autorisations nécessaires pour mettre à jour ce plan d\'action.');
                } else {
                    console.error('Erreur lors de la mise à jour du plan d\'action:', error);
                }
            }
        );
    }
}
  loadCausalAnalysis() {
    this.loading = true;
    if (this.checklistId !== undefined) {
      this.causalAnalysisService.getCausalAnalysisByChecklistId(this.checklistId).subscribe(
        analysis => {
          if (analysis) {
            this.analyseCausale = analysis;
            this.savedAnalyseCausale = analysis;
            console.log('Analyse causale chargée:', this.analyseCausale);
            this.cdr.detectChanges(); // Force UI update
          }
          this.loadActionPlan();
          this.loading = false;
        },
        error => {
          console.error('Erreur lors du chargement de l\'analyse causale:', error);
          this.loading = false;
        }
      );
    } else {
      console.error('ID de checklist invalide:', this.checklistId);
    }
  }

  loadActionPlan() {
    if (this.analyseCausale && this.analyseCausale.idAN) {
        this.causalAnalysisService.getActionPlanByAnalysisId(this.analyseCausale.idAN).subscribe(
            plan => {
                this.planAction = plan; // Assurez-vous que le plan d'action est correctement assigné
                console.log('Plan d\'action chargé:', this.planAction); // Ajoutez un log ici
                this.editMode = false; // Désactiver le mode édition après avoir chargé les données
                this.cdr.detectChanges();
            },
            error => {
                console.error('Erreur lors du chargement du plan d\'action:', error);
            }
        );
    } else {
        console.error('Analyse causale invalide:', this.analyseCausale);
    }
}


  initializeAnalysis() {
    if (this.analyseCausale.methodeAnalyse === 'FIVE_WHYS') {
      this.analyseCausale.cinqPourquoi = [
        new Pourquoi(0, '', 0, ''),
        new Pourquoi(0, '', 0, ''),
        new Pourquoi(0, '', 0, ''),
        new Pourquoi(0, '', 0, ''),
        new Pourquoi(0, '', 0, '')
      ];
    }
  }
  saveCausalAnalysis() {
    if (this.checklistId !== undefined) {
      this.causalAnalysisService.saveCausalAnalysis(this.analyseCausale, this.checklistId).subscribe(
        result => {
          console.log('Réponse du serveur:', result);
          this.savedAnalyseCausale = result; // Si vous avez besoin d'enregistrer le message
  
          // Créer le plan d'action après la sauvegarde de l'analyse causale
          console.log('Analyse Causale avant création du plan d\'action:', this.analyseCausale);
          this.createActionPlan(this.savedAnalyseCausale.idAN); 
  
          // Rafraîchir la page pour afficher les nouvelles données
          window.location.reload(); // Cela rafraîchira la page
        },
        error => {
          console.error('Erreur lors de la sauvegarde de l\'analyse causale:', error);
        }
      );
    }
  }
  createActionPlan(analyseCausaleId: number) {
    const planAction: PlanAction = new PlanAction();
    planAction.leconTirees = "Leçons tirées de l'analyse";
  
    // Associer l'analyse causale sauvegardée au plan d'action
    const analyseCausale = new AnalyseCausale(analyseCausaleId, '', '', '', 0, [], []);
    planAction.analyseCausale = analyseCausale;
  
    // Vous pouvez accéder aux "5 Whys" via l'analyse causale lorsque nécessaire
    if (this.analyseCausale.methodeAnalyse === 'FIVE_WHYS' && this.analyseCausale.cinqPourquoi) {
      console.log('Ajout des 5 Whys via analyse causale:', this.analyseCausale.cinqPourquoi);
      // Aucune copie directe dans planAction, juste la référence dans l'analyse causale
    }
  
    this.causalAnalysisService.createActionPlan(planAction).subscribe(
      response => {
        console.log('Plan d\'action créé avec succès:', response);
        this.refreshData(); // Rafraîchit les données
      },
      error => {
        console.error('Erreur lors de la création du plan d\'action:', error);
      }
    );
  }

  refreshData() {
    this.loadCausalAnalysis();
    this.loadActionPlan();
    this.cdr.detectChanges(); // Detect changes after all data has loaded
  }

  addCause() {
    if (this.isRqualite) {
      this.analyseCausale.causesIshikawa.push(new CauseIshikawa(0, '', '', 0, ''));
    } else {
      console.error('Action non autorisée pour cet utilisateur.');
    }
  }
}
