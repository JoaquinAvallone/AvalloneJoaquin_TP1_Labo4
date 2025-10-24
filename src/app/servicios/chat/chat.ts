import { Injectable, inject } from '@angular/core';
import { supabase } from '../../../supabase.client';
import { AuthService } from '../auth/auth';
import { RealtimeChannel } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';

export interface ChatMessage {
  id?: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private authService = inject(AuthService);
  
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  
  private channel: RealtimeChannel | null = null;
  private isInitialized = false;
  private retryCount = 0;
  private maxRetries = 3;

  async initializeChat() {
    if (this.isInitialized) {
      return;
    }
    
    await this.loadMessages();
    await this.subscribeToMessages();
    this.isInitialized = true;
  }

  private async loadMessages() {
    try {
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Error cargando mensajes:', error);
        throw error;
      }
      
      this.messagesSubject.next(data || []);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  }

  private async subscribeToMessages(): Promise<void> {
    return new Promise((resolve) => {
      if (this.channel) {
        supabase.removeChannel(this.channel);
        this.channel = null;
      }

      const channelName = `sala-juegos-chat-${Date.now()}`;
      
      setTimeout(() => {
        this.channel = supabase
          .channel(channelName, {
            config: {
              broadcast: { self: false },
              presence: { key: 'chat' }
            }
          })
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'chat_messages'
            },
            (payload) => {
              const newMessage = payload.new as ChatMessage;
              
              if (newMessage && newMessage.id && newMessage.message) {
                this.addMessageToState(newMessage);
              } else {
              }
            }
          )
          .subscribe((status, error) => {
            
            if (status === 'SUBSCRIBED') {
              this.retryCount = 0;
              resolve();
            } else if (status === 'CHANNEL_ERROR' || error) {
              this.retryCount++;
              
              if (this.retryCount <= this.maxRetries) {
                setTimeout(() => this.subscribeToMessages(), 3000);
              } else {
                resolve();
              }
            } else {
              resolve();
            }
          });
      }, 1000);
    });
  }

  private addMessageToState(newMessage: ChatMessage) {
    const currentMessages = this.messagesSubject.value;
    
    const isDuplicate = currentMessages.some(msg => msg.id === newMessage.id);
    if (!isDuplicate) {
      this.messagesSubject.next([...currentMessages, newMessage]);
    } else {
      console.log('Mensaje duplicado, ignorando');
    }
  }

  async sendMessage(message: string): Promise<ChatMessage> {
    const user = await this.authService.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const messageData = {
      user_id: user.id,
      username: user.email?.split('@')[0] || 'Usuario',
      message: message.trim(),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('chat_messages')
      .insert([messageData])
      .select()
      .single();

    if (error) {
      console.error('Error enviando mensaje:', error);
      throw error;
    }

    this.addMessageToState(data);
    
    return data;
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }

  destroy() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.isInitialized = false;
    this.retryCount = 0;
  }
}