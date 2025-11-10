# Marketing Campaign Planner

## Overview
The **Marketing Campaign Planner** is a full-stack web application designed for managing marketing campaigns, tracking leads, and monitoring performance analytics in real-time. It allows marketing teams to create, update, and analyze campaigns with dynamic dashboards and secure authentication.

This project was developed as part of the **BIPROS Developer Intern Test** to demonstrate enterprise-level software development practices.

---

## Tech Stack
| Layer | Technology |
|--------|-------------|
| Frontend | Angular 20 |
| Backend | ASP.NET Core Web API |
| Database | SQL Server / MySQL |
| ORM | Entity Framework Core |
| Authentication | JWT (JSON Web Token) |
| Languages | TypeScript, C#, SQL |
| Libraries | Chart.js, PapaParse |

---

## Features
### Authentication
- Secure login using **JWT-based authentication**
- Session management and auto logout

### Campaign Management
- Create, edit, delete, and view campaigns
- Apply filters by name, date, agency, buyer, and brand
- Real-time metrics: **Open Rate, Conversion Rate, CTR**

### Lead Management
- Add single or bulk leads through CSV upload
- Automatic **Lead-to-Segment Mapping** based on:
  - Campaign Name
  - Email Domain
  - Phone Prefix
- Detect and reject duplicates during upload

### Multi-Lead Search
- Search multiple leads via email or ID
- Displays found/missing leads with campaign details
- Export search results to CSV

### Analytics & Reporting
- Visualize campaign performance using **Chart.js**
- Export campaign analytics and lead data to CSV

---

## Project Structure

### Frontend (Angular)
```
/marketing-campaign-client
│
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   ├── models/
│   │   ├── pages/
│   │   └── app.module.ts
│   ├── assets/
│   ├── environments/
│   └── main.ts
```

### Backend (ASP.NET Core)
```
/MarketCampaignProject
│
├── Controllers/
│   ├── AuthController.cs
│   ├── CampaignController.cs
│   ├── LeadsController.cs
│
├── Models/
│   ├── Campaign.cs
│   ├── Lead.cs
│   ├── User.cs
│
├── DTOs/
│   ├── RegisterDto.cs
│   ├── LoginDto.cs
│   ├── ResponseDto.cs
│
├── Services/
│   ├── AuthService.cs
│   ├── JwtTokenService.cs
│   ├── CampaignService.cs
│   ├── LeadService.cs
│
├── Data/
│   └── ApplicationDbContext.cs
│
└── appsettings.json
```

---

## Lead-to-Segment Mapping Rules
| Condition | Segment |
|------------|----------|
| Campaign Name contains “Summer Sale” | Seasonal |
| Campaign Name contains “Corporate” | Corporate |
| Campaign Name contains “New Product Launch” | Early Adopters |
| Email ends with “@company.com” | Corporate Leads |
| Email ends with “@edu.org” | Academic |
| Email ends with “@gmail.com” or “@yahoo.com” | General Public |
| Phone starts with +1 | US Leads |
| Phone starts with +91 | India Leads |
| Default | General |

---

## Setup Instructions

### Backend Setup
1. Clone the repository
2. Open the backend project in Visual Studio or VS Code
3. Update the database connection string in `appsettings.json`
4. Run migrations:
   ```bash
   dotnet ef database update
   ```
5. Start the backend:
   ```bash
   dotnet run
   ```
6. The API will run on:
   ```
   https://localhost:7039
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd marketing-campaign-client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the project:
   ```bash
   ng serve
   ```
4. Open in browser:
   ```
   http://localhost:4200
   ```

---

## API Endpoints Summary
| Module | Endpoint | Method | Description |
|--------|-----------|--------|-------------|
| Auth | `/api/Auth/register` | POST | Register a new user |
| Auth | `/api/Auth/login` | POST | User login |
| Campaign | `/api/Campaign` | GET | Fetch all campaigns |
| Campaign | `/api/Campaign/{id}` | GET | Get campaign by ID |
| Campaign | `/api/Campaign` | POST | Add new campaign |
| Campaign | `/api/Campaign/{id}` | PUT | Update campaign |
| Campaign | `/api/Campaign/{id}` | DELETE | Delete campaign |
| Leads | `/api/Leads` | GET | Fetch all leads |
| Leads | `/api/Leads/{id}` | GET | Fetch lead by ID |
| Leads | `/api/Leads` | POST | Add new lead |
| Leads | `/api/Leads/bulk` | POST | Bulk upload leads |
| Leads | `/api/Leads/search` | POST | Multi-lead search |
| Analytics | `/api/Campaign/averages` | GET | Fetch average metrics |

---

## Deployment
- **Backend** can be hosted on Azure App Service or IIS
- **Frontend** can be deployed using Netlify, Vercel, or Azure Static Web Apps
- **Database** can be hosted on Azure SQL, MySQL, or AWS RDS

---

## Future Enhancements
- Role-based access control (Admin/Manager)
- Integration with email campaign APIs
- Advanced analytics dashboards
- Notification system for updates

---

## Developer Information
**Name:** Kanak Sharma  
**Role:** Developer Intern  
**Organization:** BIPROS Pvt. Ltd.  
**Submission Date:** 10 November 2025  
