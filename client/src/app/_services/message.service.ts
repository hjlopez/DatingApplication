import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Group } from '../_models/group';
import { Message } from '../_models/message';
import { MessageParams } from '../_models/messageParams';
import { PaginatedResult } from '../_models/pagination';
import { User } from '../_models/user';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl = environment.apiUrl;
  messageParams: MessageParams;
  hubUrl = environment.hubUrl;
  private hubConnection: HubConnection;
  private messageThreadSource = new BehaviorSubject<Message[]>([]);
  messageThread$ = this.messageThreadSource.asObservable();

  constructor(private http: HttpClient)
  {
    this.messageParams = new MessageParams();
  }

  createHubConnection(user: User, otherUsername: string): void
  {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'message?user=' + otherUsername, {
        accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch(error => console.log(error));

    this.hubConnection.on('ReceivedMessageThread', messages => {
      this.messageThreadSource.next(messages);
    });

    this.hubConnection.on('NewMessage', message => {
      this.messageThread$.pipe(take(1)).subscribe(messages => {
        this.messageThreadSource.next([...messages, message]);
      });
    });

    this.hubConnection.on('UpdateGroup', (group: Group) => {
      if (group.connections.some(x => x.username === otherUsername))
      {
        this.messageThread$.pipe(take(1)).subscribe(messages => {
          messages.forEach(message => {
            if (!message.dateRead)
            {
              message.dateRead = new Date(Date.now());
            }
          });

          this.messageThreadSource.next([...messages]);
        });
      }
    });
  }

  stopHubConnection(): void
  {
    if (this.hubConnection)
    {
      this.hubConnection.stop();
    }
  }

  // getMessages(pageNumber: number, pageSize: number, container: string): Observable<PaginatedResult<Message[]>>
  getMessages(messageParams: MessageParams): Observable<PaginatedResult<Message[]>>
  {
    let params = getPaginationHeaders(messageParams.pageNumber, messageParams.pageSize);

    params = params.append('Container', messageParams.container);

    return getPaginatedResult<Message[]>(this.baseUrl + 'messages', params, this.http);
  }

  getMessageParams(): MessageParams
  {
    return this.messageParams;
  }

  getMessageThread(username: string): Observable<Message[]>
  {
    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + username);
  }

  async sendMessage(username: string, content: string): Promise<any>
  {
    // parameters should match dto
    // if name in dto is same as the paremeter, {parameterDto: parameter} is not needed
    // return this.http.post<Message>(this.baseUrl + 'messages', {recipientUsername: username, content});
    return this.hubConnection.invoke('SendMessage', {recipientUsername: username, content})
      .catch(error => console.log(error));
  }

  deleteMessage(id: number): Observable<object>
  {
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }
}
