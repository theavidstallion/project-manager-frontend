import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: 'profile.html' 
})
export class Profile implements OnInit {
  authService = inject(AuthService);
  toast = inject(ToastService);
  
  userIdDisplay = '';
  profileForm = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.userIdDisplay = user.userId;
      this.profileForm = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.username || '',
        phoneNumber: user.phoneNumber || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    }
  }

  showPasswordError(): boolean {
    const { currentPassword, newPassword, confirmPassword } = this.profileForm;
    
    // Only show error if user has started typing passwords
    const hasPasswordInput = currentPassword || newPassword || confirmPassword;
    
    if (!hasPasswordInput) return false;

    // Check for mismatches or missing fields
    if (newPassword && newPassword !== confirmPassword) return true;
    if (newPassword && !currentPassword) return true;
    if (newPassword && newPassword.length < 6) return true;
    
    return false;
  }

  getPasswordErrorMessage(): string {
    const { currentPassword, newPassword, confirmPassword } = this.profileForm;
    
    if (newPassword && newPassword.length < 6) {
      return 'New password must be at least 6 characters';
    }
    if (newPassword && !currentPassword) {
      return 'Current password is required to change password';
    }
    if (newPassword !== confirmPassword) {
      return 'New passwords do not match';
    }
    
    return '';
  }

  onUpdateProfile() {
    // Validation
    if (!this.profileForm.firstName || !this.profileForm.lastName) {
      this.toast.show('First name and last name are required', 'error');
      return;
    }

    // If user is trying to change password, validate
    const isChangingPassword = this.profileForm.newPassword || this.profileForm.confirmPassword || this.profileForm.currentPassword;
    
    if (isChangingPassword && this.showPasswordError()) {
      this.toast.show(this.getPasswordErrorMessage(), 'error');
      return;
    }

    // Prepare payload - only include password fields if user is changing password
    const payload: any = {
      firstName: this.profileForm.firstName,
      lastName: this.profileForm.lastName,
      phoneNumber: this.profileForm.phoneNumber
    };

    if (isChangingPassword && this.profileForm.newPassword) {
      payload.currentPassword = this.profileForm.currentPassword;
      payload.newPassword = this.profileForm.newPassword;
    }

    // Submit
    this.authService.updateProfile(payload).subscribe({
      next: (response: any) => {
        Swal.fire({
          title: 'Success!',
          text: response.message || 'Profile updated successfully!',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        // Clear password fields after successful update
        this.profileForm.currentPassword = '';
        this.profileForm.newPassword = '';
        this.profileForm.confirmPassword = '';

        // Update local user info (if needed)
        const currentUser = this.authService.currentUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            firstName: this.profileForm.firstName,
            lastName: this.profileForm.lastName,
            phoneNumber: this.profileForm.phoneNumber
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      },
      error: (err) => {
        const message = err.error?.message || err.error || 'Failed to update profile';
        Swal.fire('Error', message, 'error');
      }
    });
  }
}