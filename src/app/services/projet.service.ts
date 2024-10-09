import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Projet } from 'src/app/modules/projet';
import { User } from '../modules/user';
import { TauxNCData } from '../modules/taux-nc-data.model';
import { TauxNCSemestrielResponse } from '../modules/taux-nc-semestriel-response.model';
import { SatisfactionDataDTO } from '../modules/satisfaction-data.model';
import { DDEDataDTO } from '../modules/dde-data-dto';
import { NombreDeRunSemestrielResponse } from '../modules/nombre-de-run-semestriel-response.model';

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
      params,
      responseType: 'text' as 'json'  // <-- Ceci indique à Angular de traiter la réponse comme du texte
    };
  
    return this.http.post(`${this.baseUrl}/ajouter`, projet, options);
  }
  getTauxNCData(activiteId: number): Observable<TauxNCData[]> {
    return this.http.get<TauxNCData[]>(`${this.baseUrl}/activite/${activiteId}/tauxNC`);
}
getTauxNCSemestriels(activiteId: number): Observable<TauxNCSemestrielResponse[]> {
  return this.http.get<TauxNCSemestrielResponse[]>(`${this.baseUrl}/activite/${activiteId}/tauxNCSemestriels`);
}
getSatisfactionData(activiteId: number): Observable<SatisfactionDataDTO[]> {
  return this.http.get<SatisfactionDataDTO[]>(`${this.baseUrl}/satisfaction/${activiteId}`);
}
modifierProjet(projetId: number, projet: Projet): Observable<any> {
  return this.http.put(`${this.baseUrl}/modifier/${projetId}`, projet, {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    responseType: 'text' // Ajouter cette option pour spécifier que la réponse est du texte
  });
}
supprimerProjet(projetId: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/supprimer/${projetId}`, {
    responseType: 'text' // Spécifier que la réponse attendue est du texte
  });
}
getDDESemestriels(activiteId: number): Observable<DDEDataDTO> {
  return this.http.get<DDEDataDTO>(`${this.baseUrl}/activite/${activiteId}/ddeSemestriels`);
}
getNombreDeRunParSemestre(activiteId: number) {
  return this.http.get<NombreDeRunSemestrielResponse[]>(`${this.baseUrl}/runs-semestriels/${activiteId}`);
}
getTauxRealisation8DSemestriel(activiteId: number): Observable<{ [key: string]: number[] }> {
  return this.http.get<{ [key: string]: number[] }>(`${this.baseUrl}/tauxRealisation8D/${activiteId}`);
}
getTauxCBySemestre(activiteId: number): Observable<{ [key: string]: number[] }> {
  return this.http.get<{ [key: string]: number[] }>(`${this.baseUrl}/activite/${activiteId}/tauxC`);
}
getTauxLiberation(activiteId: number): Observable<{ projet: string, taux: number }[]> {
  return this.http.get<{ [key: string]: number }>(`${this.baseUrl}/activites/${activiteId}/taux-liberation-semestriel`).pipe(
    map(data => Object.entries(data).map(([projet, taux]) => ({ projet, taux })))
  );
}
}