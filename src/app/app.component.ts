import { Component } from '@angular/core';
import { environment } from '../enviroments/enviroment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor() {
    console.log(environment.production); // Logs false for development environment
  }

  title = 'app works!';
}
