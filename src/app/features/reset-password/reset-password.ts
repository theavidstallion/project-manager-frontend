import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoaderService } from '../../core/services/loader.service';
import { ToastService } from '../../core/services/toast.service';
import { CommonModule } from '@angular/common';
import { ResetPasswordRequest } from '../../core/models/auth.models';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})

export class ResetPassword implements OnInit {
  auth = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  toast = inject(ToastService);
  loader = inject(LoaderService);

  userId = '';
  token = '';
  newPassword = '';
  confirmPassword = '';
  isSuccess = false;
  isInvalidLink = false;

  ngOnInit() {
    this.userId = this.route.snapshot.queryParams['userId'];
    this.token = this.route.snapshot.queryParams['token'];

    if (!this.userId || !this.token) {
      this.isInvalidLink = true;
    }
  }

  onSubmit() {
    if (!this.newPassword || !this.confirmPassword) {
      this.toast.show('Please fill in all fields.', 'error');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.toast.show('Passwords do not match.', 'error');
      return;
    }

    if (this.newPassword.length < 6) {
      this.toast.show('Password must be at least 6 characters long.', 'error');
      return;
    }

    this.loader.show();
    
    this.auth.resetPassword({
      userId: this.userId,
      token: this.token,
      newPassword: this.newPassword
    }).subscribe({
      next: (response: any) => {
        this.loader.hide();
        this.isSuccess = true;
        setTimeout(() => {
          this.toast.show(response.message || 'Password reset successful! Please login.');
        }, 100);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.loader.hide();
        setTimeout(() => {
          const msg = err.error?.message || 'Failed to reset password. The link may have expired.';
          this.toast.show(msg, 'error');
        }, 100);
      }
    });
  }
}