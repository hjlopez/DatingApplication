import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  hubUrl = environment.hubUrl;
  private hubConnection: HubConnection;
  private onlineUsersSource = new BehaviorSubject<string[]>([]);
  onlineUsers$ = this.onlineUsersSource.asObservable();

  constructor(private toastr: ToastrService, private router: Router) { }

  createHubConnection(user: User): void
  {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', {
        accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect() // automatically attempts to reconnect if there is a connection problem
      .build();

    this.hubConnection.start().catch(error => console.log(error));

    // for hub connection, make sure the method is the same as with the configuration in the PresenceHub class
    // when user connects
    this.hubConnection.on('UserIsOnline', username => {
      this.onlineUsers$.pipe(take(1)).subscribe(usernames => {
        this.onlineUsersSource.next([...usernames, username]);
      });
      // this.toastr.info(username + ' has connected');
    });

    this.hubConnection.on('UserIsOffline', username => {
      this.onlineUsers$.pipe(take(1)).subscribe(usernames => {
        this.onlineUsersSource.next([...usernames.filter(x => x !== username)]);
      });
      // this.toastr.warning(username + ' has disconnected');
    });

    this.hubConnection.on('NewMessageReceived', ({username, knownAs}) => {
      this.toastr.info(knownAs + ' has sent you a message!')
        .onTap
        .pipe(take(1))
        .subscribe(() => this.router.navigateByUrl('/members/' + username + '?tab=3'));
    });

    this.hubConnection.on('GetOnlineUsers', (usernames: string[]) => {
      this.onlineUsersSource.next(usernames);
    });
  }

  stopHubConnection(): void
  {
    this.hubConnection.stop().catch(error => console.log(error));
  }
}
