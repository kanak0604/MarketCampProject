import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AddLeadComponent } from './pages/addlead/addlead';
import { BulkUploadComponent } from './pages/bulkupload/bulkupload';
import { MultiLeadSearchComponent } from './pages/multileadsearch/multileadsearch';
import { AnalyticsComponent } from './pages/analytics/analytics';

export const routes: Routes = [
    {path: '', redirectTo: 'register' ,pathMatch : 'full'},
    {path:'register',component:Register},
    {path:'login',component:Login},
    {path:'dashboard',component:DashboardComponent},
    {path:'addlead',component:AddLeadComponent},
    {path:'bulkupload',component:BulkUploadComponent},
    {path:'multileadsearch',component:MultiLeadSearchComponent},
    {path:'analytics',component:AnalyticsComponent},
];
