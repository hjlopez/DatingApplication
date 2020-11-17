import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountService } from '../_services/account.service';
import { User } from '../_models/user';
import { take } from 'rxjs/operators';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private accountService: AccountService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let currentUser: User;

    // take 1 thing from observable currentUser$
    // we want to complete after receiving the current user
    // to not unsubscribe
    // if not sure that unsubscribe is needed, use the pipe and take
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => currentUser = user);
    if (currentUser){
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.token}` // attach token for every request
        }
      });
    }

    return next.handle(request);
  }
}
