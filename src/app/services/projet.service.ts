import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Projet } from 'src/app/modules/projet';
import { User } from '../modules/user';
import { TauxNCData } from '../modules/taux-nc-data.model';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {  private baseUrl = 'http://localhost:8080/api/projet';


  constructor(private http: HttpClient) { }

  getChefsDeProjet(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/chefsdeprojet`);
  }

  getResponsablesQualite(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/responsablesqualite`);
  }

  getProjetsByActivite(activiteId: number): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.baseUrl}/activites/${activiteId}/projets`);
  }

  ajouterProjet(projet: Projet, activiteId: number, responsableQualiteNom: string, nomC: string, chefDeProjetNom?: string): Observable<any> {
    let params = new HttpParams()
      .set('activiteId', activiteId.toString())
      .set('responsableQualiteNom', responsableQualiteNom)
      .set('nomC', nomC);

    if (chefDeProjetNom) {
      params = params.set('chefDeProjetNom', chefDeProjetNom);
    }

    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      params
    };

    return this.http.post(`${this.baseUrl}/ajouter`, projet, options);
  }
  getTauxNCData(activiteId: number): Observable<TauxNCData[]> {
    return this.http.get<TauxNCData[]>(`${this.baseUrl}/activite/${activiteId}/tauxNC`);
}
}