import { Component, OnInit } from '@angular/core';
import { Activite } from 'src/app/modules/activite';

import { ActiviteService } from 'src/app/services/activite.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  loggedInUsername: string = '';
  pendingUsers: any[] = [];
  activites: Activite[] = []; // This should match your template
    newActivite: Activite = new Activite(0, '');
  nouveauNom: string = '';
  allUsers: any[] = []; 
  userIdToBlock: number | undefined;
  isBlockModalOpen: boolean = false;
  isEditModalOpen = false; // Variable pour contrôler l'ouverture du modal
  userToEdit: any = {}; 
  isDeleteModalOpen = false;
  activiteToDelete: Activite | null = null;
  isEditModalAOpen = false; // Variable pour contrôler l'ouverture du modal
  activiteToEdit: Activite | null = null;
  accountStatusMap: { [key: string]: string } = {
    APPROVED: 'Approuvé',
    REJECTED: 'Refusé',
    PENDING: 'En Attente',
    BLOCKED: 'Bloqué'
  };
  roles: { value: string, label: string }[] = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'DIRECTEUR', label: 'Directeur' },
    { value: 'CHEFDEPROJET', label: 'Chef de projet' },
    { value: 'RQUALITE', label: 'Responsable qualité' }
  ];
  constructor(private authService: AuthService, private activiteService: ActiviteService) {}

  ngOnInit(): void {
    this.loggedInUsername = this.authService.getLoggedInUsername();
    this.loadPendingUsers();
    this.loadActivites();
    this.loadAllUsers();
 
  }
  getRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'Admin';
      case 'DIRECTEUR':
        return 'Directeur';
      case 'CHEFDEPROJET':
        return 'Chef de projet';
      case 'RQUALITE':
        return 'Responsable qualité';
      default:
        return role; // Retourne le rôle original si aucune correspondance
    }
  }
  getAccountStatusLabel(status: string): string {
    return this.accountStatusMap[status] || status; // Renvoie le statut ou le statut par défaut
  }

  openEditModalA(activite: Activite): void {
    this.activiteToEdit = { ...activite }; // Cloner l'activité pour éviter les modifications directes
    this.isEditModalAOpen = true; // Ouvrir le modal
  }

  closeEditModalA(): void {
    this.isEditModalAOpen = false; // Fermer le modal
    this.activiteToEdit = null; // Réinitialiser l'activité à modifier
  }
  confirmUpdateActivite(): void {
    if (this.activiteToEdit) {
        this.activiteService.modifierActivite(this.activiteToEdit.idA, this.activiteToEdit.nomA).subscribe({
            next: (response: any) => { // Indiquer le type de la réponse ici
                console.log('Message de succès:', response.message); // Accéder au message
                console.log('Nouveau nom de l\'activité:', response.nouveauNom); // Accéder au nouveau nom
                this.loadActivites(); // Rafraîchir la liste des activités
                this.closeEditModalA(); // Fermer le modal
            },
            error: (error) => {
                console.error('Error during update:', error);
            }
        });
    }
}
  modifierActivite(idA: number, nouveauNom: string): void {
    console.log('ID de l\'activité à modifier :', idA);
    console.log('Nouveau nom de l\'activité :', nouveauNom);

    // Appeler la méthode modifierActivite avec l'identifiant et le nouveau nom
    this.activiteService.modifierActivite(idA, nouveauNom).subscribe(() => {
        this.loadActivites();
    }, error => {
        console.error('Error updating activite', error);
    });
}
  
  resetNewActivite(): void {
    this.newActivite = new Activite(0, '');
  }

  openDeleteModal(activite: Activite): void {
    this.activiteToDelete = activite; // Sauvegarder l'activité à supprimer
    this.isDeleteModalOpen = true; // Ouvrir le modal de suppression
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false; // Fermer le modal de suppression
    this.activiteToDelete = null; // Réinitialiser l'activité à supprimer
  }

  supprimerActivite(idA: number): void {
    this.activiteService.supprimerActivite(idA).subscribe(() => {
      this.loadActivites();
      this.closeDeleteModal(); // Fermer le modal après la suppression
    }, error => {
      console.error('Error deleting activite', error);
    });
  }
  confirmSupprimerActivite(): void {
    if (this.activiteToDelete) {
        this.activiteService.supprimerActivite(this.activiteToDelete.idA).subscribe({
            next: (response) => {
                console.log(response); // Affiche "Activité supprimée avec succès."
                this.loadActivites(); // Rafraîchir la liste des activités
            },
            error: (err) => {
                console.error('Error deleting activite', err);
                // Gérez l'erreur de suppression ici
            }
        });
        this.closeDeleteModal(); // Fermer le modal après la suppression
    }
}

  loadAllUsers(): void {
    this.authService.getAllUsers().subscribe((data: any[]) => {
      console.log('Utilisateurs chargés :', data); // Ajoutez cette ligne pour vérifier les utilisateurs
      this.allUsers = data;
    });
  }

  loadPendingUsers(): void {
    this.authService.getPendingUsers().subscribe((data: any[]) => {
      this.pendingUsers = data;
    });
  }
  loadActivites(): void {
    this.activiteService.getActivites().subscribe((data: Activite[]) => {
      this.activites = data;
    });
  }approveAccount(userId: number): void {
    this.authService.approveAccount(userId).subscribe(response => {
        console.log('Response from server:', response);
        this.loadPendingUsers();
     
    }, error => {
        console.error('Error approving account', error);
        alert('Une erreur est survenue lors de l\'approbation du compte.');
        
        // Ajoutez plus d'informations sur l'erreur
        if (error.error) {
            console.error('Error details:', error.error);
        } else {
            console.error('No error details available.');
        }
    });
}
  ajouterActivite(): void {
    this.activiteService.ajouterActivite(this.newActivite).subscribe({
        next: (response: any) => {
            console.log('Message:', response.message); // Afficher le message de succès
            this.loadActivites(); // Rafraîchir la liste des activités
            this.resetNewActivite(); // Réinitialiser l'activité ajoutée
        },
        error: (error) => {
            console.error('Error adding activite', error);
        }
    });
}

 

openBlockModal(id: number): void {
  this.userIdToBlock = id; // Sauvegarder l'ID de l'utilisateur à bloquer
  this.isBlockModalOpen = true; // Ouvrir le modal
}

closeBlockModal(): void {
  this.isBlockModalOpen = false; // Fermer le modal
  this.userIdToBlock = undefined; // Réinitialiser l'ID
}

confirmBlockUser(): void {
  if (this.userIdToBlock !== undefined) {
      this.authService.blockUser(this.userIdToBlock).subscribe(
          response => {
              // Réaction après le blocage réussi
              this.loadAllUsers(); // Rafraîchir la liste des utilisateurs après blocage
              this.closeBlockModal(); // Fermer le modal après confirmation
          },
          error => {
              console.error("Erreur lors du blocage de l'utilisateur :", error);
              alert("Une erreur s'est produite lors du blocage de l'utilisateur.");
          }
      );
  }
}
openEditModal(user: any): void {
  this.userToEdit = { ...user }; // Cloner l'utilisateur pour éviter les modifications directes
  this.isEditModalOpen = true; // Ouvrir le modal
}

closeEditModal(): void {
  this.isEditModalOpen = false; // Fermer le modal
  this.userToEdit = {}; // Réinitialiser l'utilisateur à un objet vide
}

confirmUpdateUser(): void {
  if (this.userToEdit && this.userToEdit.idU) {
      this.authService.updateUser(this.userToEdit.idU, this.userToEdit).subscribe(() => {
          this.loadAllUsers(); // Recharger la liste des utilisateurs après modification
          this.closeEditModal(); // Fermer le modal après la mise à jour
      }, error => {
          console.error('Erreur lors de la mise à jour de l\'utilisateur', error);
      });
  }
}}