// src/app/api.service.ts
// This service connects Angular frontend with backend APIs
// We use HttpClient to call .NET backend endpoints

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'  // makes this service available everywhere
})
export class ApiService {
  private authUrl = 'https://localhost:7288/api/Auth';        // Login & Register endpoints
  private campaignUrl = 'https://localhost:7288/api/Campaign'; // Campaign operations

  constructor(private http: HttpClient) {}

  // Register user
  register(userData: any): Observable<any> {
    // check if any field is missing
    if (!userData.username || !userData.email || !userData.password) {
      console.log('Please fill all fields before registering');
      // return empty observable (no backend call)
      return new Observable();
    } 
    else {
      // call backend register API
      return this.http.post(`${this.authUrl}/register`, userData);
    }
  }

  // Login user
  login(credentials: any): Observable<any> {
    // check if user entered both email and password
    if (!credentials.email || !credentials.password) {
      console.log('Email or password missing!');
      return new Observable();
    } 
    else {
      // call backend login API
      return this.http.post(`${this.authUrl}/login`, credentials);
    }
  }

  //  Get all campaigns
  getCampaigns(): Observable<any> {
    const token = localStorage.getItem('token'); // get saved JWT token

    // if token found → send request with authorization header
    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      return this.http.get(this.campaignUrl, { headers });
    } 
    else {
      console.log('User not authorized. Please login first.');
      return new Observable();
    }
  }

  // Add new campaign
  addCampaign(campaignData: any): Observable<any> {
    const token = localStorage.getItem('token'); // get token

    if (!token) {
      console.log('Cannot add campaign. User not logged in.');
      return new Observable();
    }

    // add token to header
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // check if campaign fields are valid
    if (!campaignData.name || !campaignData.startDate || !campaignData.endDate) {
      console.log('Please fill all campaign fields!');
      return new Observable();
    } 
    else {
      // call backend POST API to create campaign
      return this.http.post(this.campaignUrl, campaignData, { headers });
    }
  }

  // Delete campaign
  deleteCampaign(id: number): Observable<any> {
    const token = localStorage.getItem('token');

    // check if token exists
    if (!token) {
      console.log('No token found. Please login again.');
      return new Observable();
    }

    // check if ID is valid
    if (id <= 0) {
      console.log('Invalid campaign ID!');
      return new Observable();
    } 
    else {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      // send DELETE request to backend
      return this.http.delete(`${this.campaignUrl}/${id}`, { headers });
    }
  }
}
