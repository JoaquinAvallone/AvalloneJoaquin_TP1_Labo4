import { Component, OnInit, HostListener, inject } from '@angular/core';
import { AuthService } from '../../servicios/auth/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoggedIn: boolean = false;
  userEmail: string = '';
  isUserMenuOpen: boolean = false;
  isAdmin: boolean = false;
  isLoading: boolean = true;

  async ngOnInit() {
    await this.checkAuthState();
    
    this.authService.onAuth((event, session) => {
      this.handleAuthChange(event, session);
    });
  }

  private async handleAuthChange(event: any, session: any) {
    console.log('Auth event:', event, 'Session:', session);
    
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      this.isLoggedIn = true;
      await this.loadUserData();
    } else if (event === 'SIGNED_OUT') {
      this.isLoggedIn = false;
      this.isAdmin = false;
      this.userEmail = '';
      this.isUserMenuOpen = false;
    }
    
    this.isLoading = false;
  }

  private async checkAuthState() {
    try {
      this.isLoading = true;
      this.isLoggedIn = await this.authService.isAuthenticated();
      console.log('Is logged in:', this.isLoggedIn);
      
      if (this.isLoggedIn) {
        await this.loadUserData();
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      this.isLoggedIn = false;
    } finally {
      this.isLoading = false;
    }
  }

  private async loadUserData() {
    try {
      const user = await this.authService.getUser();
      console.log('User data:', user);
      
      if (user) {
        this.userEmail = user.email || '';
        
        // Verificar si es administrador
        this.isAdmin = await this.authService.esAdministrador(user.id);
        console.log('Is admin:', this.isAdmin, 'User ID:', user.id);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  async logOut() {
    try {
      await this.authService.signOut();
      this.isUserMenuOpen = false;
      this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      this.cleanAuthStorage();
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }

  private cleanAuthStorage(): void {
    const authKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('sb-') && key.endsWith('-auth-token')
    );
    authKeys.forEach(key => localStorage.removeItem(key));
    
    const sessionAuthKeys = Object.keys(sessionStorage).filter(key =>
      key.startsWith('sb-') && key.endsWith('-auth-token')
    );
    sessionAuthKeys.forEach(key => sessionStorage.removeItem(key));
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const userMenu = document.querySelector('.user-menu-container');
    if (userMenu && !userMenu.contains(event.target as Node)) {
      this.isUserMenuOpen = false;
    }
  }
}