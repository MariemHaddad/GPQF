import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
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
  ajouterActivite(activite: Activite): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ajouter`, activite);
}
  modifierActivite(idA: number, nouveauNom: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/modifier/${idA}`, nouveauNom, {});
}
supprimerActivite(idA: number): Observable<string> {
  return this.http.delete<string>(`${this.baseUrl}/supprimer/${idA}`, { responseType: 'text' as 'json' });
}
}