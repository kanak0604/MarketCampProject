import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule,CommonModule,RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  //properties of the file
  username = '';
  email = '';
  password = '';
  message = '';

  private backend = 'https://localhost:7288/api/Auth'

  constructor(private http:HttpClient,private router:Router){}

  registerUser(){
    if(!this.username || !this.email || !this.password){
      this.message = "all field are required";
      return; // stop if the validation fails
    }
    //creating the payload object as backend expects in order to send the req 
    const payload = {
      username : this.username,
      email : this.email,
      password: this.password
    };

    //sending post request 
    this.http.post(`${this.backend}/register`,payload).subscribe({
      next: (res: any) => {
        this.message = res?.message || "Registered successfully! Redirecting...";
        // Redirect to the login page after 1 sec
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
  },

      error : (err) => {
        console.log('register error',err);

        if(err && err.status === 0){
          this.message ='cannot reach server'
        }else {
          this.message = (err && err.error && err.error.message) || 'Registration error'
        }
      }
    });
  }
}
