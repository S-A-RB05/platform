import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  tests: any;

  constructor(public authService: AuthService, private http: HttpClient) {}
  
  test(): void{
    this.tests = this.http.get("http://localhost:8081/start");
  }

  ngOnInit(): void {}
}
