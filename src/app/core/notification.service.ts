import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Notif { id: number; message: string; declarationId?: number; lue: boolean; dateCreation: string; }

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private hub?: signalR.HubConnection;
  items$ = new BehaviorSubject<Notif[]>([]);
  toast$ = new Subject<string>();
  /** Émet à chaque notification reçue : les pages s'en servent pour se rafraîchir. */
  incoming$ = new Subject<Notif>();

  constructor(private auth: AuthService, private http: HttpClient) {}

  start() {
    this.http.get<Notif[]>(`${environment.apiUrl}/notifications`).subscribe(l => this.items$.next(l));
    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/notifications`, { accessTokenFactory: () => this.auth.token ?? '' })
      .withAutomaticReconnect().build();
    this.hub.on('notification', (n: Notif) => {
      this.items$.next([n, ...this.items$.value]);
      this.toast$.next(n.message);
      this.incoming$.next(n);
    });
    this.hub.start().catch(err => console.error('SignalR', err));
  }
  stop() { this.hub?.stop(); this.items$.next([]); }
  marquerLues() {
    this.http.post(`${environment.apiUrl}/notifications/lues`, {}).subscribe(() =>
      this.items$.next(this.items$.value.map(n => ({ ...n, lue: true }))));
  }
}
