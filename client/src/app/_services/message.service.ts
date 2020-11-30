import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Message } from '../_models/message';
import { MessageParams } from '../_models/messageParams';
import { PaginatedResult } from '../_models/pagination';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl = environment.apiUrl;
  messageParams: MessageParams;

  constructor(private http: HttpClient)
  {
    this.messageParams = new MessageParams();
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

  sendMessage(username: string, content: string): Observable<Message>
  {
    // parameters should match dto
    // if name in dto is same as the paremeter, {parameterDto: parameter} is not needed
    return this.http.post<Message>(this.baseUrl + 'messages', {recipientUsername: username, content});
  }

  deleteMessage(id: number): Observable<object>
  {
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }
}
