import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { Checklist } from '../modules/checklist';
import { ChecklistItem } from '../modules/checklistItem';

@Injectable({
  providedIn: 'root'
})
export class ChecklistService {
  private apiUrl = 'http://localhost:8080/api/checklists';

  constructor(private http: HttpClient) { }

  getChecklistByPhase(phaseId: number): Observable<Checklist> {
    return this.http.get<Checklist>(`${this.apiUrl}/byPhase/${phaseId}`);
  }

  initializeChecklist(phaseId: number): Observable<any> {
    const params = new HttpParams().set('phaseId', phaseId.toString());
    return this.http.post(`${this.apiUrl}/initialize`, null, { params }).pipe(
      catchError(err => throwError(err))
    );
  }

  updateChecklistStatus(checklistId: number, status: string, remarque: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateStatus/${checklistId}`, { status, remarque });
  }

  updateChecklistItems(checklistId: number, items: ChecklistItem[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateItems/${checklistId}`, items);
  }
  updateChecklist(checklist: Checklist): Observable<any> {
    console.log('Checklist à mettre à jour:', checklist); // Log the checklist data
    return this.http.put(`${this.apiUrl}/updateItems/${checklist.idCh}`, checklist.items, { responseType: 'text' }).pipe(
      switchMap(() => this.http.put(`${this.apiUrl}/updateStatus/${checklist.idCh}`, { status: checklist.status, remarque: checklist.remarque }, { responseType: 'text' }))
    );
  }}