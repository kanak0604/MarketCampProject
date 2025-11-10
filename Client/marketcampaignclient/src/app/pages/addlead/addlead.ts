import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-lead',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './addlead.html',
  styleUrls: ['./addlead.css']
})
export class AddLeadComponent implements OnInit {
  private baseUrl = 'https://localhost:7288/api';

  leads: any[] = [];
  campaigns: any[] = [];

  newLead = {
    leadID: '',
    name: '',
    email: '',
    phoneNumber: '',
    campaignAssignment: '',
    segment: '',
    hasOpenedEmail: false,
    hasConverted: false
  };

  showModal = false;
  selectedLead: any = null;
  updatedLead: any = {};

  constructor(private http: HttpClient, private router: Router) {}

  //onit is an angular interface that allows class to run initialization code after the component is created
  ngOnInit() {
    this.loadCampaigns(); 
  }

  loadCampaigns() {
    //subscribe->response comes->emits a value next if success or error if fails
    // get - returns the observable stream of data from the backend api
    this.http.get<any>(`${this.baseUrl}/Campaign`).subscribe({//subscribe starts the async call
      next: (res) => { //next - handles sucess
        if (res.success) {
          this.campaigns = res.data;
          this.loadLeads(); 
        }
      },
      error: (err) => console.error('Error loading campaigns:', err)//handles error 
    });
  }

  loadLeads() {
    this.http.get<any>(`${this.baseUrl}/Leads`).subscribe({
      next: (res) => {
        if (res.success) {
          //map - create new arrya of lead with camp names and return the new array
          this.leads = res.data.map((lead: any) => {
            const matchedCampaign = this.campaigns.find( // find - find the first match and return the one element
              (c) =>
                c.campaignId === lead.campaignAssignment ||
                c.campaignName === lead.campaignAssignment
            );
            return {
              ...lead,
              campaignName: matchedCampaign
                ? matchedCampaign.campaignName
                : 'N/A'
            };
          });
        }
      },
      error: (err) => console.error('Error loading leads:', err)
    });
  }

  private isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phonePattern = /^\+\d{7,15}$/;
    return phonePattern.test(phone);
  }

 addLead() {
  if (!this.newLead.name || !this.newLead.email) {
    alert(' Name and Email are required.');
    return;
  }

  if (!this.isValidEmail(this.newLead.email)) {
    alert(' Please enter a valid email address.');
    return;
  }

  if (this.newLead.phoneNumber && !this.isValidPhone(this.newLead.phoneNumber)) {
    alert(' Please enter a valid phone number (e.g. +91XXXXXXXXXX).');
    return;
  }

  const selectedCampaign = this.campaigns.find(
    c => c.campaignName === this.newLead.campaignAssignment
  );

  const payload = {
    ...this.newLead,// the spread operator is used to copy all properties from this.newLead into the new payload object.
    campaignAssignment: selectedCampaign ? selectedCampaign.campaignId : null//make sure that the backend gets the id not the assignment
  };

  if (!payload.campaignAssignment) {
    alert(' Please select a valid campaign.');
    return;
  }

  payload.segment = this.getSegmentByRules(
    this.newLead.campaignAssignment,
    this.newLead.email,
    this.newLead.phoneNumber
  );

  this.http.post<any>(`${this.baseUrl}/Leads`, payload).subscribe({
    next: (res) => {
      if (res.success) {
        alert('✅ Lead added successfully!');
        this.resetLeadForm();
        this.loadLeads();
      } else {
        alert(res.message || 'Error adding lead.');
      }
    },
error: (err) => {
  console.error('Error adding lead:', err);

  if (err.status === 409) {
    alert(err.error?.message || 'Duplicate lead entry not allowed.');
  } else if (err.status === 400) {
    // Invalid data
    alert(err.error?.message || 'Invalid input. Please check your data.');
  } else {
    alert('Unexpected server error. Please try again later.');
  }
}
  });
}


  resetLeadForm() {
    this.newLead = {
      leadID: '',
      name: '',
      email: '',
      phoneNumber: '',
      campaignAssignment: '',
      segment: '',
      hasOpenedEmail: false,
      hasConverted: false
    };
  }

  getSegmentByRules(campaign: any, email: string, phone: string): string {
    if (!email) return 'General';
    const e = email.toLowerCase();

    if (campaign) {
      const c = campaign.toString().toLowerCase();
      if (c.includes('summer sale 2025')) return 'Seasonal';
      if (c.includes('corporate offer')) return 'Corporate';
      if (c.includes('new product launch')) return 'Early Adopters';
    }

    if (e.endsWith('@company.com')) return 'Corporate Leads';
    if (e.endsWith('@edu.org')) return 'Student/Academic';
    if (e.endsWith('@gmail.com') || e.endsWith('@yahoo.com')) return 'General Public';

    if (phone.startsWith('+1')) return 'US Leads';
    if (phone.startsWith('+91')) return 'India Leads';

    return 'General';
  }

  openUpdateModal(lead: any) {
    this.selectedLead = lead;
    this.updatedLead = { ...lead };//creates shallow copy of lead object - shallow means the shallow create new object but use the same references  for nested objects
    this.showModal = true;
  }

saveUpdatedLead() {
  if (!this.updatedLead.email || !this.isValidEmail(this.updatedLead.email)) {
    alert('Invalid email address.');
    return;
  }

  if (this.updatedLead.phoneNumber && !this.isValidPhone(this.updatedLead.phoneNumber)) {
    alert('Invalid phone number format.');
    return;
  }

  const matchedCampaign = this.campaigns.find(
    c => c.campaignName === this.updatedLead.campaignAssignment
  );

  const payload = {
    ...this.updatedLead,// the spread operator is used to copy all properties from this.updatedLead into the new payload object.
    campaignAssignment: matchedCampaign ? matchedCampaign.campaignId : null,
    segment: this.getSegmentByRules(
      this.updatedLead.campaignAssignment,
      this.updatedLead.email,
      this.updatedLead.phoneNumber
    )
  };

  if (!payload.campaignAssignment) {
    alert(' Please select a valid campaign before saving.');
    return;
  }

  this.http.put(`${this.baseUrl}/Leads/${this.updatedLead.leadID}`, payload).subscribe({
    next: (res: any) => {
      if (res.success) {
        alert(' Lead updated successfully!');
        this.showModal = false;
        this.loadLeads();
      } else {
        alert(res.message || 'Failed to update lead.');
      }
    },
    error: (err) => console.error('Error updating lead:', err)
  });
}

  closeModal() {
    this.showModal = false;
  }

  deleteLead(id: number) {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    this.http.delete(`${this.baseUrl}/Leads/${id}`).subscribe({
      next: (res: any) => {
        if (res.success) {
          alert(' Lead deleted successfully!');
          this.loadLeads();
        }
      },
      error: (err) => console.error('Error deleting lead:', err)
    });
  }

  cancel() {
    this.router.navigate(['/dashboard']);
  }
}
