import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
//chart.js - it is used to make htm based charts

Chart.register(...registerables);//load all type default chart type ,scales

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.css']
})
export class AnalyticsComponent implements OnInit {
  private baseUrl = 'https://localhost:7288/api/Campaign';
  private chart: any;

  avgMetrics = {//object to hold average metrics
    avgOpenRate: 0,
    avgConversionRate: 0,
    avgClickThroughRate: 0
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadData();//load data when component initializes
  }

  loadData() {
    this.http.get<any>(`${this.baseUrl}/averages`).subscribe({//fetch the data from the backend 
    // and then store it in average mertrics and then render the chart to show the data
      next: (res) => {
        if (res.success && res.data) {
          this.avgMetrics = res.data;
          this.renderChart();
        }
      },
      error: (err) => console.error(err)
    });
  }

  renderChart() {
    const canvas = document.getElementById('metricsChart') as HTMLCanvasElement;
    //Looks for the <canvas id="metricsChart"> element in your HTML.
    if (!canvas) return;

    if (this.chart) {
      //updating the chart after new input 
      this.chart.data.datasets[0].data = [
        this.avgMetrics.avgOpenRate,
        this.avgMetrics.avgConversionRate,
        this.avgMetrics.avgClickThroughRate
      ];
      this.chart.update();
      return;
    }

    this.chart = new Chart(canvas, {
      type: 'bar',//will create a bar chart
      data: {
        labels: ['Open Rate', 'Conversion Rate', 'Click Through Rate'],//names shows on axis
        datasets: [
          {
            label: 'Average (%)',
            data: [
              this.avgMetrics.avgOpenRate,
              this.avgMetrics.avgConversionRate,
              this.avgMetrics.avgClickThroughRate
            ],
            backgroundColor: [
              'rgba(139, 69, 19, 0.9)',
              'rgba(160, 82, 45, 0.9)',
              'rgba(101, 67, 33, 0.9)'
            ]
          }
        ]
      },
      options: {
        responsive: true,//riseze automatically
        maintainAspectRatio: false,//maintain flexibility
        scales: {
          y: {
            beginAtZero: true,//start from zero
            max: 100,//can go upto 100%
            ticks: {
              callback: (value) => value + '%'
            }
          }
        },
        plugins: {//add the title of the chart
          title: {
            display: true,
            text: '📊 Overall Campaign Averages'
          },
          legend: {
            display: false
          }
        }
      }
    });
  }

  refreshData() {//destroy the existing chart and reload the data from the backend
  if (this.chart) {
    this.chart.destroy();
    this.chart = null;
  }
  this.loadData();
}

}
