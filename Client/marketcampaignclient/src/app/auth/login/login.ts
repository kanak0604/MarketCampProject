import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';//ngmodel
import { CommonModule } from '@angular/common';//ngif,ngfor
import { HttpClient } from '@angular/common/http';//to call backend api 
import { Router ,RouterModule} from '@angular/router';//router module provide the routing features
//Router is a service that is used to navigate programmatically

@Component({
  selector: 'app-login',
  imports: [FormsModule,CommonModule,RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  message = ''

  private backend = 'https://localhost:7288/api/Auth'

//constructor with dependency injection
  constructor(private http:HttpClient,private router:Router){}

  loginUser(){
    //payload object are the object that carries some data to send to the backend
    const data = {email:this.email, password:this.password};

    //check if email or password is empty 
    if(this.email ==='' || this.password ===''){
      this.message = "Email or password can't be empty"
    }
    //this sends data to the backend 
    else{
      //post - send data using post method
      this.http.post(`${this.backend}/login`,data).subscribe({
        next:(res:any) => {
          //if backend says success = true
          if(res.sucess === true){
            //store token in local storage
            localStorage.setItem('token',res.data.token);

            //show message and go to dashboard after 1 min
            this.message = 'Login successful';
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
              }, 1000);
            }
          else{
            //backend says false 
            this.message = res.message || 'invalid credential';
          }
        },
        error : (err) => {
          // If backend not reachable or error occurred
          console.log('Login error', err);
          this.message = 'Server not reachable'
        }
      });
    }
  }
}
