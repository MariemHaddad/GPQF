export class User {
    nom: any;
    prenom: any;
    email: any;
    motDePasse: any;
    role: any;
  
    constructor(nom: any, prenom: any, email: any, motDePasse: any, role: any) {
      this.nom = nom;
      this.prenom = prenom;
      this.email = email;
      this.motDePasse = motDePasse;
      this.role = role;
    }
  }