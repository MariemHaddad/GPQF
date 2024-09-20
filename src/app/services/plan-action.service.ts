import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlanAction } from '../modules/planAction';
import { Action } from '../modules/action';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlanActionService {
  private apiUrl = 'http://localhost:8080/api/planAction';

  constructor(private http: HttpClient) {}

  addPlanAction(planAction: PlanAction): Observable<PlanAction> {
    return this.http.post<PlanAction>(`${this.apiUrl}/add`, planAction).pipe(
      catchError(this.handleError)
    );
  }

 getPlanActionByAnalyseCausaleId(idAN: number): Observable<PlanAction> {
  return this.http.get<PlanAction>(`${this.apiUrl}/analyseCausale/${idAN}/planAction`).pipe(
    catchError(this.handleError)
  );
}
  

  getPlanActionById(id: number): Observable<PlanAction> {
    return this.http.get<PlanAction>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  updatePlanAction(id: number, planAction: PlanAction): Observable<PlanAction> {
    return this.http.put<PlanAction>(`${this.apiUrl}/update/${id}`, planAction).pipe(
      catchError(this.handleError)
    );
  }

  deletePlanAction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  addAction(action: Action): Observable<Action> {
    return this.http.post<Action>(`${this.apiUrl}/actions/add`, action).pipe(
      catchError(this.handleError)
    );
  }

  updateAction(id: number, action: Action): Observable<Action> {
    return this.http.put<Action>(`${this.apiUrl}/actions/update/${id}`, action).pipe(
      catchError(this.handleError)
    );
  }

  deleteAction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/actions/delete/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }
}