import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { AnalyseCausale } from '../modules/analyseCausale';  // Corrigez le chemin du modèle
import { PlanAction } from '../modules/planAction';

@Injectable({
  providedIn: 'root'
})
export class CausalAnalysisService {
  private apiUrl = 'http://localhost:8080/api/analyseCausale'; // URL de l'API

  constructor(private http: HttpClient) {}

  // Ajouter une analyse causale
  saveCausalAnalysis(analysis: AnalyseCausale, checklistId: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/add?checklistId=${checklistId}`, analysis, { responseType: 'text' as 'json' });
}
getActionPlanByAnalysisId(analyseCausaleId: number): Observable<PlanAction> {
  return this.http.get<PlanAction>(`http://localhost:8080/api/planAction/analyseCausale/${analyseCausaleId}/planAction`);
}
createActionPlan(planAction: PlanAction): Observable<PlanAction> {
  return this.http.post<PlanAction>(`http://localhost:8080/api/planAction/add`, planAction);
}
  // Ajouter un Pourquoi à une analyse causale
  addPourquoi(id: number, pourquoi: any): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/${id}/addPourquoi`, pourquoi);
  }

  // Ajouter une Cause Ishikawa à une analyse causale
  addCauseIshikawa(id: number, cause: any): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/${id}/addCauseIshikawa`, cause);
  }
  getCausalAnalysisByChecklistId(checklistId: number): Observable<AnalyseCausale> {
    return this.http.get<AnalyseCausale>(`${this.apiUrl}/byChecklist/${checklistId}`)
      .pipe(
        catchError((error) => {
          console.error('Erreur lors de la récupération de l\'analyse causale:', error);
          return throwError(error);
        })
      );
  }
  updatePlan(planAction: PlanAction): Observable<any> {
    console.log('Plan à mettre à jour:', planAction); // Log du plan d'action
    
    return this.http.put(`http://localhost:8080/api/planAction/actions/update/${planAction.idPa}`, planAction.actions)
    .pipe(
        switchMap(() => 
            this.http.put(`http://localhost:8080/api/planAction/update/${planAction.idPa}`, { leconTirees: planAction.leconTirees })
        ),
        catchError(error => {
          console.error('Erreur lors de la mise à jour du plan d\'action:', error);
          return throwError(error);
      })
    );
}
}