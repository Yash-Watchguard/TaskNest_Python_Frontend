import { Component, OnInit, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { UpdateProfileDetails, user } from '../models/user.model';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { UserService } from '../services/user.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {

  private userservice = inject(UserService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  OpenProfileBar = signal(true);
  OpenEditMenu = signal(false);
  isLoading = signal(false);

  currentUser!: user | null;

  userProfile = this.userservice.userProfile;

  profileForm!: FormGroup;

  userId:string|null=localStorage.getItem('userId')

  constructor() {
    effect(() => {
      const profile = this.userProfile();
      if (profile.Name) {
        this.profileForm.patchValue({
          name: profile.Name,
          email: profile.Email.replace('USER#',''),
          phoneNumber: profile.PhoneNumber,
        });
      }
    });
  }

  ngOnInit(): void {

    this.currentUser = this.authService.getCurrentUser();
    console.log(this.userProfile())
    
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    });

    if (this.currentUser?.Email && !this.userProfile().Name) {
      this.loadProfile();
    }
  }

  loadProfile(): void {
    
    this.isLoading.set(true);
    this.userservice.GetProfile(this.userId as string).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
        this.isLoading.set(false);
      },
    });
  }

  toggleEditMode(): void {
    if (this.isLoading()) return;
    if (!this.userProfile().Name) {
      this.loadProfile();
    }
    this.OpenProfileBar.set(false);
    this.OpenEditMenu.set(true);
  }

  toggleProfileMode(): void {
    this.OpenProfileBar.set(true);
    this.OpenEditMenu.set(false);
    this.profileForm.reset();
  }

  saveChanges(): void {
    if (this.profileForm.valid && !this.isLoading()) {
      this.isLoading.set(true);
      const updatedDetails: UpdateProfileDetails = this.profileForm.value;
      this.userservice
        .updateUserProfile(this.userProfile().Id, updatedDetails)
        .subscribe({
          next: () => {
            this.userservice.GetProfile(this.userProfile().Id).subscribe({
              next: () => {
                this.isLoading.set(false);
                this.toggleProfileMode();
              },
              error: (err: HttpErrorResponse) => {
                console.log(err);
                this.isLoading.set(false);
              },
            });
          },
          error: (err: HttpErrorResponse) => {
            console.log(err);
            this.isLoading.set(false);
          },
        });
    }
  }

  cancelEdit(): void {
    this.toggleProfileMode();
  }
  close(){
    window.history.back();
  }
}
