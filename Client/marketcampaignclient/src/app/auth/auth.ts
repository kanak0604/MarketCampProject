// auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private timerId: any;
  private sessionTimeout = 30 * 60 * 1000; // default 30 minutes
  private remainingTimeSubject = new BehaviorSubject<number>(this.sessionTimeout);
  remainingTime$ = this.remainingTimeSubject.asObservable();

  constructor(private router: Router) {}

  login(token: string, expiresIn: number) {
    // Save token and expiry in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('loginTime', Date.now().toString());
    localStorage.setItem('expiresIn', expiresIn.toString());

    this.sessionTimeout = expiresIn; // set timeout from backend
    this.startTimer();
    this.router.navigate(['/campaign-dashboard']);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('expiresIn');

    if (this.timerId) clearInterval(this.timerId);

    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    const loginTime = Number(localStorage.getItem('loginTime'));
    const expiresIn = Number(localStorage.getItem('expiresIn'));

    if (!token || !loginTime || !expiresIn) return false;

    const elapsed = Date.now() - loginTime;
    if (elapsed > expiresIn) {
      this.logout();
      return false;
    }

    return true;
  }

  startTimer() {
    if (this.timerId) clearInterval(this.timerId);

    const loginTime = Number(localStorage.getItem('loginTime'));
    const expiresIn = Number(localStorage.getItem('expiresIn'));
    
    this.timerId = setInterval(() => {
      const elapsed = Date.now() - loginTime;
      const remaining = Math.max(0, expiresIn - elapsed);
      this.remainingTimeSubject.next(remaining);

      if (remaining <= 0) {
        this.logout();
      }
    }, 1000);
  }

  formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
  }
}
