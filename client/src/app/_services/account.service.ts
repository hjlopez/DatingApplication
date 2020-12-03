import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import {map} from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { PresenceService } from './presence.service';

// services are injectible
// can be inserted or injected into other services or components
@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;

  // 1 -> number of previous value that we want to restore
  // only null or current user object
  // reason why it's set as an observable is to be observed by other components or classes in the app
  private currentUserSource = new ReplaySubject<User>(1);
  currentUser$ = this.currentUserSource.asObservable(); // $ because it's an observable

  constructor(private http: HttpClient, private presence: PresenceService) { }

  // going to receive values from the nav bar form
  login(model: any): Observable<any>
  {
    return this.http.post(this.baseUrl + 'account/login', model).pipe(
      map((response: User) => {
        const user = response;
        if (user) {
          this.setCurrentUser(user);
          this.presence.createHubConnection(user);
        }
      })
    );
  }

  register(model: any): Observable<any>{
    return this.http.post(this.baseUrl + 'account/register', model).pipe(
      map((user: User) => {
        if (user){
          this.setCurrentUser(user);
          this.presence.createHubConnection(user);
          // return user; // to return user value if needed
        }
      })
    );
  }

  setCurrentUser(user: User): void
  {
    user.roles = [];
    const roles = this.getDecodedToken(user.token).role; // the role is not an array if there is only 1 role

    // check if return is an array
    Array.isArray(roles) ? user.roles = roles : user.roles.push(roles);

    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  logout(): void
  {
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
    this.presence.stopHubConnection();
  }

  getDecodedToken(token: string): any
  {
    // atob to decode the token
    // parts of token -> header, payload and signature
    // get payload of token
    return JSON.parse(atob(token.split('.')[1]));
  }
}
