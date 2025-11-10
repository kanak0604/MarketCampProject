import { Component } from '@angular/core';
import * as Papa from 'papaparse';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-bulkupload',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './bulkupload.html',
  styleUrls: ['./bulkupload.css']
})
export class BulkUploadComponent {
  file: File | null = null;
  parsedLeads: any[] = [];
  validLeads: any[] = [];
  invalidLeads: any[] = [];
  uploadSummary: any = null;
  uploadDetails: any = null;

  currentPage = 1;
  itemsPerPage = 6;
  paginatedLeads: any[] = [];

  private baseUrl = 'https://localhost:7288/api/Leads/bulk';

  constructor(private http: HttpClient) {}

  onFileSelect(event: any) {
    //when user selects a file it triggers this function and store the csv file in this.file
    this.file = event.target.files[0];//holds the selected file
    this.parsedLeads = [];//all rows after converting to json
    this.invalidLeads = [];
    this.validLeads = [];
    this.uploadSummary = null;//data returned from backend after upload

    if (this.file && this.file.name.endsWith('.csv')) {
      Papa.parse(this.file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          //create a set to track duplicate emails 
          const emailsSeen = new Set<string>();
          //parsing the csv file and mapping each row to a lead object
          this.parsedLeads = result.data.map((row: any, index: number) => {
            const lead = {
              //converting each row into lead obj
              Name: row.Name?.trim() || '',
              Email: row.Email?.trim() || '',
              PhoneNumber: row.PhoneNumber?.trim() || '',
              CampaignName: row.CampaignName?.trim() || '',
              Segment: this.mapSegment(row),
              Errors: [] as string[]
            };

            //validation checking of names,invalid mails,campaign name and duplicate emails
            if (!lead.Name) lead.Errors.push('Name missing');
            if (!this.isValidEmail(lead.Email)) lead.Errors.push('Invalid email');
            if (!lead.CampaignName) lead.Errors.push('Campaign missing');
            //if email already exists in the set then its duplicate
            if (emailsSeen.has(lead.Email)) lead.Errors.push('Duplicate email');
            emailsSeen.add(lead.Email);

            return lead;
          });
          //separating valid and invalid leads based on errors
          this.validLeads = this.parsedLeads.filter(l => l.Errors.length === 0);
          this.invalidLeads = this.parsedLeads.filter(l => l.Errors.length > 0);
          this.updatePagination();
        }
      });
    } else {
      alert('Please select a valid CSV file.');
    }
  }

  mapSegment(row: any): string {
    //automatically assign the segment based on rules 
    const campaign = (row.CampaignName || '').toLowerCase();
    const email = (row.Email || '').toLowerCase();
    const phone = (row.PhoneNumber || '');

    if (campaign.includes('summer')) return 'Seasonal';
    if (campaign.includes('corporate')) return 'Corporate';
    if (campaign.includes('launch')) return 'Early Adopters';
    if (email.endsWith('@company.com')) return 'Corporate Leads';
    if (email.endsWith('@edu.org')) return 'Student/Academic';
    if (email.endsWith('@gmail.com') || email.endsWith('@yahoo.com')) return 'General Public';
    if (phone.startsWith('+1')) return 'US Leads';
    if (phone.startsWith('+91')) return 'India Leads';
    return 'General';
  }
  //regex pattern
  isValidEmail(email: string): boolean {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }
  //if no input in valid leads
  uploadValidLeads() {
    if (this.validLeads.length === 0) {
      alert('No valid leads to upload.');
      return;
    }

    const payload = this.validLeads.map(l => ({
      Name: l.Name,
      Email: l.Email,
      PhoneNumber: l.PhoneNumber,
      Segment: l.Segment,
      CampaignAssignment: null
    }));

    this.http.post(this.baseUrl, payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.uploadSummary = res.summary;
          this.uploadDetails = res.details;
        } else {
          alert(res.message || ' Error uploading leads.');
        }
      },
      error: (err) => {
        console.error('Display error:', err);
        alert(' Error displaying leads.');
      }
    });
  }

  updatePagination() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedLeads = this.parsedLeads.slice(start, end);
  }

  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.parsedLeads.length) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }
}
