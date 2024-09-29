import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CauseIshikawa } from 'src/app/modules/causeIshikawa';
import { Pourquoi } from 'src/app/modules/pourquoi';
import { CausalAnalysisService } from 'src/app/services/causal-analysis.service';
import { AnalyseCausale } from 'src/app/modules/analyseCausale';
import { ActivatedRoute } from '@angular/router';
import { Checklist } from 'src/app/modules/checklist';
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
        this.planAction = plan;
        this.cdr.detectChanges(); // Assurez-vous de mettre à jour l'UI
      },
      error => {
        console.error('Erreur lors du chargement du plan d\'action:', error);
      }
    );
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
          this.savedAnalyseCausale = result;
          this.createActionPlan(this.savedAnalyseCausale.idAN); // Assurez-vous de passer l'identifiant correct
          this.loadActionPlan();  // Charger le plan d'action après la sauvegarde
          this.cdr.detectChanges(); // Mise à jour de l'UI
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
    planAction.analyseCausale = new AnalyseCausale(analyseCausaleId, '', '', '', 0, [], []); // Utilisez l'ID correct
  
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
  // Ajouter une méthode pour charger le plan d'action
 
  addCause() {
    if (this.isRqualite) {
      this.analyseCausale.causesIshikawa.push(new CauseIshikawa(0, '', '', 0, ''));
    } else {
      console.error('Action non autorisée pour cet utilisateur.');
    }
  }
}