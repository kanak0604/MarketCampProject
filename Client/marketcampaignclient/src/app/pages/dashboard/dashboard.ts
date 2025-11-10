import { Component, OnInit } from '@angular/core';//we use ngonit to load data when component loads
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule} from '@angular/common/http';
//httpclient - built in service to make api calls, httpclientmodule - to use httpclient we need to import this module
import { Router, RouterModule } from '@angular/router';
//router lets us navigate programmatically and routermodule - enables route based features using routerLink

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
//implementing OnInit interface to use ngOnInit lifecycle hook 
export class DashboardComponent implements OnInit {
  private baseUrl = 'https://localhost:7288/api/Campaign';

  //arrays to hold data 
  campaigns: any[] = [];
  filteredCampaigns: any[] = [];
  paginatedCampaigns: any[] = [];

  //filter object to hold filter values 
  filters: any = {
    campaignName: '',
    startDate: '',
    endDate: '',
    status: '',
    agency: '',
    buyer: '',
    brand: ''
  };

  agencies: string[] = [];
  buyers: string[] = [];
  brands: string[] = [];

  
  currentPage = 1;//curently active page
  itemsPerPage = 5;//number of campaign per page 
  sortColumn: string = ''; //when column is sorted
  sortDirection: 'asc' | 'desc' = 'asc'; // direction can be asc or decs

  //this is the new campaign object to hold new campaign data which will be added in the html file using @input property binding
  newCampaign = {
    campaignName: '',
    startDate: '',
    endDate: '',
    status: 'Active',
    agency: '',
    buyer: '',
    brand: ''
  };

  countdown: number = 30 * 60;

  showModal = false;
  selectedCampaign: any = null;
  updatedCampaign: any = { campaignName: '', startDate: '', endDate: '', status: '' };

  selectedCampaignIds: number[] = [];
  comparisonResults: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}
  //lifecycle hook - called when component is initialized
  ngOnInit() {
    this.loadFilters();//get agency,brand and buyer data for filter dropdowns
    this.loadCampaigns();//load all the camapaign list 
    this.startCountdown();//begin the countdown timer
  }

  startCountdown() {
    //uses setimterval to decrease countdown every second
    const timer = setInterval(() => {
      if (this.countdown > 0) this.countdown--;//if time is greater than 0 keep decreaing it 
      else {
        clearInterval(timer);
        alert('Session expired! Redirecting to login...');
        this.router.navigate(['/login']);
      }
    }, 1000);
  }
 
  //fetch filter from backend and store in local arrays
  loadFilters() {
    this.http.get<any>(`${this.baseUrl}/filters`).subscribe({
      next: (res) => {
        if (res.success) {
          this.agencies = res.data.agencies;
          this.buyers = res.data.buyers;
          this.brands = res.data.brands;
        }
      },
      error: (err) => console.error('Error fetching filters:', err)
    });
  }

  loadCampaigns() {
    this.http.get<any>(this.baseUrl).subscribe({
      next: (res) => {
        if (res.success) {
          //takes data from the backend and pass each value of campaign to normalize function to standardize the data
          this.campaigns = res.data.map((c: any) => this.normalizeCampaign(c));

          this.filteredCampaigns = this.campaigns.filter(c => {
            const nameMatch = this.filters.campaignName
              ? c.campaignName.toLowerCase().includes(this.filters.campaignName.toLowerCase())
              : true;

            const statusMatch = this.filters.status
              ? c.status.toLowerCase() === this.filters.status.toLowerCase()
              : true;

            const agencyMatch = this.filters.agency
              ? c.agency?.toLowerCase() === this.filters.agency.toLowerCase()
              : true;

            const buyerMatch = this.filters.buyer
              ? c.buyer?.toLowerCase() === this.filters.buyer.toLowerCase()
              : true;

            const brandMatch = this.filters.brand
              ? c.brand?.toLowerCase() === this.filters.brand.toLowerCase()
              : true;

            // Date Filters - check if the user selected data filters in the UI , if yes convert it to js object or else 0 
            const startDateFilter = this.filters.startDate ? new Date(this.filters.startDate) : null;
            const endDateFilter = this.filters.endDate ? new Date(this.filters.endDate) : null;
            const campaignStart = new Date(c.startDate);
            const campaignEnd = new Date(c.endDate);

            let dateMatch = true;

            if (startDateFilter && !endDateFilter) {
              dateMatch = campaignStart >= startDateFilter;
            } else if (!startDateFilter && endDateFilter) {
              dateMatch = campaignEnd <= endDateFilter;
            } else if (startDateFilter && endDateFilter) {
              dateMatch =
                campaignStart >= startDateFilter && campaignEnd <= endDateFilter;
            }

            return (
              nameMatch && statusMatch &&agencyMatch &&buyerMatch &&brandMatch &&dateMatch);
          });

          this.applySort();
          this.currentPage = 1;
          this.updatePagination();
        } else {
          this.campaigns = [];
          this.filteredCampaigns = [];
          this.updatePagination();
        }
      },
      error: (err) => console.error('Error fetching campaigns:', err)
    });
  }
 // help normalize the structure of the data from the backend to ensure smooth handling in frontend 
  private normalizeCampaign(c: any) {
    return {
      // if first value is null or undefined use the second value
      campaignId: c.campaignId ?? c.CampaignId,
      campaignName: c.campaignName ?? c.CampaignName,
      startDate: c.startDate ?? c.StartDate,
      endDate: c.endDate ?? c.EndDate,
      totalLeads: c.totalLeads ?? c.TotalLeads ?? 0,
      openRate: c.openRate ?? c.OpenRate ?? 0,
      conversionRate: c.conversionRate ?? c.ConversionRate ?? 0,
      clickThroughRate: c.clickThroughRate ?? c.ClickThroughRate ?? 0,
      status: c.status ?? c.Status ?? '',
      agency: c.agency ?? c.Agency ?? '',
      buyer: c.buyer ?? c.Buyer ?? '',
      brand: c.brand ?? c.Brand ?? ''
    };
  }

  applyFilters() {
    console.log(' Applying filters:', this.filters);
    this.loadCampaigns();
  }

  clearFilters() {
    this.filters = {
      campaignName: '',
      startDate: '',
      endDate: '',
      status: '',
      agency: '',
      buyer: '',
      brand: ''
    };
    this.loadCampaigns();
  }

  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySort();
    this.updatePagination();
  }

  applySort() {
    if (!this.sortColumn) return;
    //Sorts filteredCampaigns array based on selected column and data type
    const col = this.sortColumn;
    const dir = this.sortDirection === 'asc' ? 1 : -1;

    this.filteredCampaigns.sort((a: any, b: any) => {
      const va = a[col];
      const vb = b[col];

      if (col === 'startDate' || col === 'endDate') {
        const da = va ? new Date(va).getTime() : 0;
        const db = vb ? new Date(vb).getTime() : 0;
        return (da - db) * dir;
      }

      if (['totalLeads', 'openRate', 'conversionRate', 'clickThroughRate'].includes(col)) {
        const na = Number(va ?? 0);
        const nb = Number(vb ?? 0);
        return (na - nb) * dir;
      }

      const sa = (va ?? '').toString().toLowerCase();
      const sb = (vb ?? '').toString().toLowerCase();
      if (sa < sb) return -1 * dir;
      if (sa > sb) return 1 * dir;
      return 0;
    });
  }

  addCampaign() {
    if (!this.newCampaign.campaignName || !this.newCampaign.startDate || !this.newCampaign.endDate) {
      alert('⚠️ Please fill out all required fields.');
      return;
    }

    const payload = {
      campaignName: this.newCampaign.campaignName,
      startDate: this.newCampaign.startDate,
      endDate: this.newCampaign.endDate,
      status: this.newCampaign.status || 'Active',
      agency: this.newCampaign.agency || '',
      buyer: this.newCampaign.buyer || '',
      brand: this.newCampaign.brand || ''
    };

    this.http.post<any>(this.baseUrl, payload).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Campaign added successfully!');
          this.newCampaign = {
            campaignName: '',
            startDate: '',
            endDate: '',
            status: '',
            agency: '',
            buyer: '',
            brand: ''
          };
          this.loadCampaigns();
          this.loadFilters();
        }
      },
      error: (err) => console.error('Error adding campaign:', err)
    });
  }

  cancel() {
    this.loadCampaigns();
    alert('Returning to dashboard view');
  }
  //open modal and populate selected campaign data
  openUpdateModal(campaign: any) {
    this.selectedCampaign = campaign;
    this.updatedCampaign = { ...campaign };
    this.showModal = true;
  }

  saveUpdatedCampaign() {
    this.http.put(`${this.baseUrl}/${this.updatedCampaign.campaignId}`, this.updatedCampaign).subscribe({
      next: () => {
        alert('✏️ Campaign updated successfully!');
        this.showModal = false;
        this.loadCampaigns();
      },
      error: (err) => console.error('Error updating campaign:', err)
    });
  }

  closeModal() {
    this.showModal = false;
  }

  deleteCampaign(id: number) {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    this.http.delete(`${this.baseUrl}/${id}`).subscribe({
      next: () => {
        alert('🗑️ Campaign deleted successfully!');
        this.loadCampaigns();
      },
      error: (err) => console.error('Error deleting campaign:', err)
    });
  }

  updatePagination() {
    const start = (this.currentPage - 1) * this.itemsPerPage;// start = 1-1 * 5 =0-start from 0 index
    const end = start + this.itemsPerPage;// 0+5=5, end at 5
    this.paginatedCampaigns = this.filteredCampaigns.slice(start, end);//(0,5)
  }

  nextPage() {
    // 1 *5 <total length = current page = 1, again call above method 
    if (this.currentPage * this.itemsPerPage < this.filteredCampaigns.length) {
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

  exportCSV() {
    // if no input data
    if (!this.filteredCampaigns.length) {
      alert('No campaigns to export.');
      return;
    }
    //mapping each campaign object to a new object with specific keys for CSV
    const csvData = this.filteredCampaigns.map(c => ({
      CampaignName: c.campaignName,
      StartDate: c.startDate,
      EndDate: c.endDate,
      TotalLeads: c.totalLeads,
      OpenRate: c.openRate,
      ConversionRate: c.conversionRate,
      ClickThroughRate: c.clickThroughRate,
      Status: c.status
    }));
    //converting the array of objects to CSV string format
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(r =>
        Object.values(r)
          .map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`)
          .join(',')
      )
    ].join('\n');

    //creating a blob and triggering download
    const blob = new Blob([csv], { type: 'text/csv' });//blob - binary large object 
    const a = document.createElement('a');//anchor element to trigger download
    a.href = URL.createObjectURL(blob);//create url for blob
    a.download = 'CampaignAnalytics.csv';//download filename
    a.click();//trigger click to start download
  }
}
