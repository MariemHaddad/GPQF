import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { AnalyseCausale } from '../modules/analyseCausale';  // Corrigez le chemin du modèle

@Injectable({
  providedIn: 'root'
})
export class CausalAnalysisService {
  private apiUrl = 'http://localhost:8080/api/analyseCausale'; // URL de l'API

  constructor(private http: HttpClient) {}

  // Ajouter une analyse causale
  saveCausalAnalysis(analysis: AnalyseCausale, checklistId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/add?checklistId=${checklistId}`, analysis);
  }

  // Ajouter un Pourquoi à une analyse causale
  addPourquoi(id: number, pourquoi: any): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/${id}/addPourquoi`, pourquoi);
  }

  // Ajouter une Cause Ishikawa à une analyse causale
  addCauseIshikawa(id: number, cause: any): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/${id}/addCauseIshikawa`, cause);
  }
  getCausalAnalysisById(checklistId: number): Observable<AnalyseCausale> {
    return this.http.get<AnalyseCausale>(`${this.apiUrl}/byChecklist/${checklistId}`);
}
}
