import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private cookieService: CookieService, private router: Router) { }

  isLoggedIn() {
    if (this.cookieService.get("cookie-isa")) {
      if (this.isExpire()) {
        this.userLogout();
        return false;
      }
      return true;
    }
  }

  isExpire() {
    if (new Date(this.cookieService.get("exp")) < new Date()) {
      this.cookieService.deleteAll();
      return true;
    }
    return false;
  }

  isAdmin() {
    if (atob(this.cookieService.get("cookie-isa")) === "admin") {
      return true;
    }
    return false;
  }

  login(param): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(param.username + ":" + param.password)
      })
    };
    // console.log(httpOptions);
    return this.http.post("/api/users/login", null, httpOptions);
  }

  register(param): Observable<any> {
    return this.http.post("/api/users/register", param);
  }

  logout(): Observable<any> {
    return this.http.post("/api/users/logout", null)
  }

  userLogout() {
    this.logout().subscribe(res => {
      this.cookieService.deleteAll();
      this.router.navigate(['/login']);
    });
  }
}
