import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withHashLocation, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { APP_ROUTES } from './app/app.routes';
import { environment } from './environments/environment';
import { enableProdMode } from '@angular/core';

import { authInterceptor } from './app/core/auth/auth.interceptor';
import { RouteReuseStrategy } from '@angular/router';
import { AppRouteReuseStrategy } from './app/core/services/route-reuse.strategy';

import { importProvidersFrom } from '@angular/core';
import { 
  LucideAngularModule, 
  LayoutDashboard, Users, Award, Gift, Search, Settings, 
  ChevronLeft, ChevronRight, Briefcase, Building2, Clock, 
  CalendarDays, DollarSign, Rocket, Plus, CheckCircle, 
  LayoutList, MapPin, ArrowRight, ArrowLeft, UploadCloud, FileText,
  Mail, Lock, Eye, MoreVertical, UserCheck, CalendarClock,
  TrendingDown, Star, AlertCircle, BarChart3, TrendingUp, Bell, Cake, User, Zap, Loader2,
  FileCheck, Upload, Save, Image, X, Phone, ChevronDown
} from 'lucide-angular';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(APP_ROUTES, withHashLocation()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    { provide: RouteReuseStrategy, useClass: AppRouteReuseStrategy },
    importProvidersFrom(
      LucideAngularModule.pick({
        LayoutDashboard, Users, Award, Gift, Search, Settings, 
        ChevronLeft, ChevronRight, Briefcase, Building2, Clock, 
        CalendarDays, DollarSign, Rocket, Plus, CheckCircle, 
        LayoutList, MapPin, ArrowRight, ArrowLeft, UploadCloud, FileText,
        Mail, Lock, Eye, MoreVertical, UserCheck, CalendarClock,
        TrendingDown, Star, AlertCircle, BarChart3, TrendingUp, Bell, Cake, User, Zap, Loader2,
        FileCheck, Upload, Save, Image, X, Phone, ChevronDown
      })
    )
  ]
}).catch(err => console.error(err));
