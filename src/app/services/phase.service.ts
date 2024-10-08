import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { Phase } from '../modules/phase';

@Injectable({
  providedIn: 'root'
})
export class PhaseService {

  private apiUrl = 'http://localhost:8080/api/phases'; // Remplacez par votre URL de backend

  constructor(private http: HttpClient) { }

  // Ajoute des nouvelles phases
  addPhases(phases: Phase[], projetId: number): Observable<string> {
    console.log('Sending phases:', phases); // Vérifiez les données

    return this.http.post<string>(`${this.apiUrl}/ajouterPhases`, phases, {
        params: new HttpParams().set('projetId', projetId.toString()),
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        }),
        responseType: 'text' as 'json'  // Ajustez le type de réponse si nécessaire
    });
}
  
  // Example error handler
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  updatePhaseEtat(id: number, etat: string): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/updatePhaseEtat/${id}`, { etat });
  }

  getPhasesByProjet(projetId: number): Observable<Phase[]> {
   return this.http.get<Phase[]>(`${this.apiUrl}/projet/${projetId}`, { params: { projetId: projetId.toString() } });
}
getEffortVariance(phaseId: number): Observable<number> {
  return this.http.get<number>(`${this.apiUrl}/${phaseId}/effortVariance`);
}

// Récupérer le schedule variance
getScheduleVariance(phaseId: number): Observable<number> {
  return this.http.get<number>(`${this.apiUrl}/${phaseId}/scheduleVariance`);
}
deletePhase(id: number): Observable<any> {
  return this.http.delete(`http://localhost:8080/api/phases/${id}`,{ responseType: 'text' });
}
updatePhase(phase: Phase): Observable<any> {
  return this.http.put('http://localhost:8080/api/phases/updatePhase/' + phase.idPh, phase, { responseType: 'text' });
}
getTauxNCExterne(projetId: number): Observable<number> {
  return this.http.get<number>(`${this.apiUrl}/projet/${projetId}/tauxNCExterne`);
}

getTauxNCInterne(projetId: number): Observable<number> {
  return this.http.get<number>(`${this.apiUrl}/projet/${projetId}/tauxNCInterne`);
}

}