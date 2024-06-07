import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  loggedInUsername: string = '';
  pendingUsers: any[] = [];

  @Output() approvalSuccess: EventEmitter<void> = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loggedInUsername = this.authService.getLoggedInUsername();
    this.loadPendingUsers();
  }
  handleApprovalSuccess():void {this.loadPendingUsers();
  
    // Afficher un message de succès
    this.showSuccessMessage();
  }
  loadPendingUsers(): void {
    this.authService.getPendingUsers().subscribe((data: any[]) => {
      this.pendingUsers = data;
    });
  }

  approveAccount(userId: number): void {
    this.authService.approveAccount(userId).subscribe(
      () => {
        // Émettre l'événement d'approbation réussie
        this.approvalSuccess.emit();
  
        // Afficher un message de succès
        this.showSuccessMessage();
      },
      error => {
        console.error('Error approving account', error);
      }
    );
  }
  
  showSuccessMessage(): void {
    // Afficher un message de succès à l'utilisateur
    alert('L\'utilisateur a été approuvé avec succès.');
  }
}