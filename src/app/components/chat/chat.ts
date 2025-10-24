import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';

// Servicios
import { AuthService } from '../../servicios/auth/auth';
import { ChatService, ChatMessage } from '../../servicios/chat/chat';
import { NotificationService } from '../../servicios/notification/notification';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './chat.html',
  styleUrls: ['./chat.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private chatService = inject(ChatService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  messages: ChatMessage[] = [];
  newMessage: string = '';
  isLoggedIn: boolean = false;
  isChatOpen: boolean = false;
  currentUser: any = null;
  showChatButton: boolean = false;
  
  private messagesSubscription?: Subscription;
  private authSubscription: any;
  private routerSubscription?: Subscription;
  private chatInitialized: boolean = false;

  // Rutas donde NO mostrar el chat
  private hiddenRoutes = [
    '/login', 
    '/registro',
    '/signup',
    '/register'
  ];

  async ngOnInit() {
    // Primero verificar la ruta actual
    this.checkRouteVisibility(this.router.url);
    
    // Suscribirse a cambios de ruta
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.checkRouteVisibility(event.url);
      });

    // Suscribirse a mensajes PRIMERO
    this.messagesSubscription = this.chatService.messages$.subscribe({
      next: (messages) => {
        this.messages = messages;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error en suscripción de mensajes:', error);
      }
    });

    // Luego suscribirse a autenticación
    this.authSubscription = this.authService.onAuth((event, session) => {
      this.handleAuthChange(session);
    });

    // Verificar estado inicial
    await this.checkAuthState();
  }

  private checkRouteVisibility(url: string) {
    // Mostrar chat solo si NO está en rutas de autenticación
    const shouldHide = this.hiddenRoutes.some(route => 
      url.includes(route) || url === route
    );
    
    const previousState = this.showChatButton;
    this.showChatButton = !shouldHide;
    
    // Si cambió de no mostrar a mostrar Y está logueado, inicializar chat
    if (!previousState && this.showChatButton && this.isLoggedIn && !this.chatInitialized) {
      this.initializeChat();
    }
    
    // Si cambió de mostrar a no mostrar, destruir chat
    if (previousState && !this.showChatButton) {
      this.destroyChat();
    }
  }

  private async checkAuthState() {
    try {
      this.currentUser = await this.authService.getUser();
      this.isLoggedIn = !!this.currentUser;
      
      if (this.isLoggedIn && this.showChatButton && !this.chatInitialized) {
        this.initializeChat();
      }
    } catch (error) {
      console.error('Error verificando auth state:', error);
    }
  }

  private handleAuthChange(session: any) {
    const wasLoggedIn = this.isLoggedIn;
    this.isLoggedIn = !!session?.user;
    this.currentUser = session?.user;
    
    if (this.isLoggedIn && this.showChatButton && !this.chatInitialized) {
      // Usuario se logueó y puede ver el chat
      this.initializeChat();
    } else if (!this.isLoggedIn && wasLoggedIn) {
      // Usuario se deslogueó
      this.destroyChat();
    }
  }

  private async initializeChat() {
    if (this.chatInitialized) {
      return;
    }
    
    try {
      await this.chatService.initializeChat();
      this.chatInitialized = true;
    } catch (error) {
      console.error('Error inicializando chat:', error);
      this.chatInitialized = false;
    }
  }

  private destroyChat() {
    if (this.chatInitialized) {
      this.chatService.destroy();
      this.chatInitialized = false;
      this.messages = [];
    }
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      this.scrollToBottom();
    }
  }

  async sendMessage() {
    if (!this.newMessage.trim()) return;

    if (!this.isLoggedIn) {
      this.showLockedMessage();
      return;
    }

    // Validar longitud del mensaje
    if (this.newMessage.length > 255) {
      this.notificationService.showAlert('El mensaje no puede tener más de 255 caracteres', 'error', 3000);
      return;
    }

    try {
      await this.chatService.sendMessage(this.newMessage);
      this.newMessage = '';
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      this.notificationService.showAlert('Error al enviar el mensaje', 'error');
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
    
    // Prevenir escribir más de 255 caracteres
    if (this.newMessage.length >= 255 && event.key !== 'Backspace' && event.key !== 'Delete') {
      event.preventDefault();
      this.notificationService.showAlert('Máximo 255 caracteres permitidos', 'warning', 2000);
    }
  }

  showLockedMessage() {
    this.notificationService.showAlert('Debes iniciar sesión para usar el chat', 'error', 3000);
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  formatTime(timestamp: string): string {
    return this.chatService.formatTime(timestamp);
  }

  isMyMessage(message: ChatMessage): boolean {
    return message.user_id === this.currentUser?.id;
  }

  ngOnDestroy() {
    this.messagesSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
    this.destroyChat();
    
    if (this.authSubscription) {
      this.authSubscription();
    }
  }
}