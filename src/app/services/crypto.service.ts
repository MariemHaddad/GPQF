import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  constructor() { }
  async hashPassword(password: string): Promise<string> {
    // Convertir le mot de passe en tableau de bytes
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Calculer le hachage SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer);

    // Convertir le résultat en une chaîne hexadécimale
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashHex;
  }
}

