import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, map, Observable, take, tap } from 'rxjs';
import {
  getAllUsersApiRes,
  getUsersApiRes,
  person,
  Role,
  UpdateProfileDetails,
  user,
} from '../models/user.model';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {
  private allusersobject = new BehaviorSubject<person[]>([]);
  AllUsers$ = this.allusersobject.asObservable();
  httpClient = inject(HttpClient);

  userProfile = signal<person>({
    Id: '',
    Name: '',
    Email: '',
    PhoneNumber: '',
    Role: '',
  });

  baseUrl= 'http://taskne-loadb-8sp9wzi9yryo-823826061.ap-south-1.elb.amazonaws.com/'
  baseUrl2= 'http://taskne-loadb-8sp9wzi9yryo-823826061.ap-south-1.elb.amazonaws.com/'

  GetAllUsers() {
    return this.httpClient.get<getAllUsersApiRes>(this.baseUrl+`users`).pipe(
      map((response) => {
        return response.data.map(
          (user) =>
            ({
              Id: user.Id,
              Name: user.Name,
              Email: user.Email,
              PhoneNumber: user.PhoneNumber,
              Role: user.Role as string,
            } as person)
        );
      }),
      tap((users) => {
        this.allusersobject.next(users);
      })
    );
  }

  Deleteuser(id:string,email:string): Observable<any> {
    return this.httpClient.patch(this.baseUrl2+`user/${id}/delete`,{email:email});
  }

  PromoteUser(id: string) {
    return this.httpClient.patch(this.baseUrl2+`user/${id}`, {role:"Manager"});
  }

  GetProfile(userId: string) {
    return this.httpClient.get<getUsersApiRes>(this.baseUrl2+`user/viewprofile/${userId}`).pipe(
      tap((res) => {
        this.userProfile.set(res.data);
      })
      ,
      map((res)=>{
        return ({
          Id: res.data.Id,
              Name: res.data.Name,
              Email: res.data.Email,
              PhoneNumber: res.data.PhoneNumber,
              Role: res.data.Role as string,

        }as person)
      })
    );
  }

  updateUserProfile(userId: string, data: UpdateProfileDetails) {
    return this.httpClient.patch(this.baseUrl+`users/${userId}`, data);
  }

  GetAllEmployee() {
    return this.httpClient.get<getAllUsersApiRes>(this.baseUrl+`employees`);
  }
}
