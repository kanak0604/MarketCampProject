import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as Papa from 'papaparse';

@Component({
  selector: 'app-multileadsearch',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './multileadsearch.html',
  styleUrls: ['./multileadsearch.css']
})
export class MultiLeadSearchComponent {
  private baseUrl = 'https://localhost:7288/api/Leads/search';

  inputText: string = '';
  result: any = null;
  loading: boolean = false;
  error: string = '';

  constructor(private http: HttpClient) {}

  search() {
    this.error = '';
    this.result = null;//clear previous results
    const rawLines = this.inputText
      .split(/\r?\n/)//split the input by new line
      .map((s) => s.trim())//removes the space
      .filter((s) => s.length > 0);//filter out empty lines
    
    //validation checking
    if (rawLines.length === 0) {
      this.error = 'Please enter at least one Lead ID or Email.';
      return;
    }
    if (rawLines.length > 500) {
      this.error = 'Maximum 500 entries allowed per search.';
      return;
    }

    this.loading = true;//spinner will be shown in UI

    this.http.post<any>(this.baseUrl, rawLines).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.error = 'Something went wrong while searching.';
        this.loading = false;
      },
    });
  }

  clear() {
    //reset everything
    this.inputText = '';
    this.result = null;
    this.error = '';
  }

  exportCSV() {
    //export found data in the csv file 
    if (!this.result?.found?.length) {
      alert('No leads to export.');
      return;
    }

    const csv = Papa.unparse(this.result.found);//convert json into csv format
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    //creating a binary large object to hold the csv data for download
    const url = window.URL.createObjectURL(blob);//creating a url for blob object 
    const a = document.createElement('a');//anchor tag for clicking 
    a.href = url;
    a.download = 'FoundLeads.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
