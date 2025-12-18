import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoaderService } from '../../core/services/loader.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  auth = inject(AuthService);
  router = inject(Router);
  toast = inject(ToastService);
  loader = inject(LoaderService);

  email = '';
  emailSent = false;

  onSubmit() {
    if (!this.email) {
      this.toast.show('Please enter your email address.', 'error');
      return;
    }

    this.loader.show();
    this.auth.forgotPassword(this.email).subscribe({
      next: (response: any) => {
        this.loader.hide();
        this.emailSent = true;
        setTimeout(() => {
          this.toast.show(response.message || 'Password reset link sent to your email.');
        }, 100);
      },
      error: (err) => {
        this.loader.hide();
        setTimeout(() => {
          this.toast.show('Something went wrong. Please try again.', 'error');
        }, 100);
      }
    });
  }
}