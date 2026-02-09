import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { LoginRequest, LoginResponse } from '../models/login.model';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs';
import { signupresponse, signupuserdto } from '../models/signup.model';
import { Role, user } from '../models/user.model';
import { jwt } from '../models/jwt.model';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  router = inject(Router);
  destroref = inject(DestroyRef);
  HttpClient = inject(HttpClient);

  signupsignal = signal<boolean>(false);
  newUser = signal<user | null>(null);

  baseUrl= 'http://taskne-loadb-8sp9wzi9yryo-823826061.ap-south-1.elb.amazonaws.com/'
  baseUrl2= 'http://taskne-loadb-8sp9wzi9yryo-823826061.ap-south-1.elb.amazonaws.com/'
  
  Signup(url: string, UserDetails: signupuserdto) {
    return this.HttpClient.post<signupresponse>(this.baseUrl+'signup', UserDetails);
  }

  Login(url: string, userDetails: LoginRequest) {
    return this.HttpClient.post<LoginResponse>(this.baseUrl+url, {
      email: userDetails.email,
      password: userDetails.password,
    }).pipe(
      tap((response) => {
        try {
          // Extract response fields
          const token = response.data.token;
          const name = response.data.name;
          const userId = response.data.UserId;

          // Decode token
          const user = this.jwtDecoder(token, userDetails, name);

          console.log("Response from Lambda:", response);

          // Store user
          this.newUser.set(user);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('userId', userId);
          localStorage.setItem('token', token);

        } catch (e) {
          console.log("Login parsing error:", e);
        }
      })
    );
  }

  private jwtDecoder(
    token: string,
    userDetails: LoginRequest,
    name: string
  ): user {
    const decode = jwtDecode<jwt>(token);
    return {
      Id: decode.userId,
      Name: name,
      Email: userDetails.email,
      Role:
        decode.role == 'Admin'
          ? Role.ADMIN
          : decode.role == 'Manager'
          ? Role.MANAGER
          : Role.EMPLOYEE,
    };
  }

  getCurrentUser(): user | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }
}
