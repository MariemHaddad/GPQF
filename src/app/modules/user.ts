export class User {
  id: any;
    nom: any;
    prenom: any;
    email: any;
    motDePasse: any;
    role: any;
    accountStatus: any;
  
    constructor(id:any, nom: any, prenom: any, email: any, motDePasse: any, role: any, accountStatus:any) {
      this.nom = nom;
      this.prenom = prenom;
      this.email = email;
      this.motDePasse = motDePasse;
      this.role = role;
      this.id= id;
      this.accountStatus= accountStatus;
    }
  }