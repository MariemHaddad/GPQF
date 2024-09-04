import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Activite } from '../modules/activite';

@Injectable({
  providedIn: 'root'
})
export class ActiviteService {
  private baseUrl = 'http://localhost:8080/activites';

  constructor(private http: HttpClient) { }

  getActivites(): Observable<Activite[]> {
    return this.http.get<Activite[]>(`${this.baseUrl}/getActivities`);
  }
  ajouterActivite(activite: Activite): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/ajouter`, activite);
  }

  modifierActivite(idA: number, nouveauNom: string): Observable<string> {
    return this.http.put<string>(`${this.baseUrl}/modifier/${idA}`, nouveauNom);
}
  supprimerActivite(idA: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/supprimer/${idA}`);
  }
}