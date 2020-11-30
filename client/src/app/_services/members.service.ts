import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LikesParams } from '../_models/likesParams';
import { Member } from '../_models/member';
import { PaginatedResult } from '../_models/pagination';
import { User } from '../_models/user';
import { UserParams } from '../_models/userParams';
import { AccountService } from './account.service';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';


@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members: Member[] = [];
  memberCache = new Map();
  user: User;
  userParams: UserParams;
  likesParams: LikesParams;

  constructor(private http: HttpClient, private accountService: AccountService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
      this.user = user;
      this.userParams = new UserParams(user);
      this.likesParams = new LikesParams();
    });
  }

  getUserParams(): UserParams{
    return this.userParams;
  }

  getLikesParams(): LikesParams
  {
    return this.likesParams;
  }

  setUserParams(params: UserParams): void
  {
    this.userParams = params;
  }

  resetUserParams(): UserParams
  {
    this.userParams = new UserParams(this.user);
    return this.userParams;
  }

  addLike(username: string): Observable<any>
  {
    return this.http.post(this.baseUrl + 'likes/' + username, {});
  }

  getLikes(likesparams: LikesParams): Observable<PaginatedResult<Partial<Member[]>>>
  {
    let params = getPaginationHeaders(likesparams.pageNumber, likesparams.pageSize);
    params = params.append('predicate', likesparams.predicate);
    return getPaginatedResult<Partial<Member[]>>(this.baseUrl + 'likes', params, this.http);
  }

  getMembers(userParams: UserParams): Observable<PaginatedResult<Member[]>> {
    // if (this.members.length > 0) { return of(this.members); } // of() -> to return as an observable
    const response = this.memberCache.get(Object.values(userParams).join('-')); // get caching here
    if (response)
    {
      return of(response);
    }

    let params = getPaginationHeaders(userParams.pageNumber, userParams.pageSize);

    params = params.append('minAge', userParams.minAge.toString());
    params = params.append('maxAge', userParams.maxAge.toString());
    params = params.append('gender', userParams.gender.toString());
    params = params.append('orderBy', userParams.orderBy);

    return getPaginatedResult<Member[]>(this.baseUrl + 'users', params, this.http).pipe(
      map(res => {
        this.memberCache.set(Object.values(userParams).join('-'), res); // set caching here
        return res;
      })
    );
  }

  getMember(username: string): Observable<Member> {
    // .reduce -> reduces the array to a single array
    const member = [...this.memberCache.values()].reduce((arr, elem) => arr.concat(elem.result), [])
                .find((mem: Member) => mem.username === username);

    if (member)
    {
      return of(member);
    }

    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  updateMember(member: Member): Observable<any> {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    );
  }

  setMainPhoto(photoId: number): Observable<object> {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number): Observable<object> {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }
}
