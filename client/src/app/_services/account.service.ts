import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import {map} from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';

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

  constructor(private http: HttpClient) { }

  // going to receive values from the nav bar form
  login(model: any): Observable<any>
  {
    return this.http.post(this.baseUrl + 'account/login', model).pipe(
      map((response: User) => {
        const user = response;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSource.next(user);
        }
      })
    );
  }

  register(model: any): Observable<any>{
    return this.http.post(this.baseUrl + 'account/register', model).pipe(
      map((user: User) => {
        if (user){
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSource.next(user);

          // return user; // to return user value if needed
        }
      })
    );
  }

  setCurrentUser(user: User): void
  {
    this.currentUserSource.next(user);
  }

  logout(): void
  {
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
  }
}
