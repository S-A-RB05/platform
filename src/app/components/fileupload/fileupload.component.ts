import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Strategy } from 'src/app/models/Strategy';

@Component({
  selector: 'app-fileupload',
  templateUrl: './fileupload.component.html',
  styleUrls: ['./fileupload.component.css']
})
export class FileuploadComponent {
  
  fileName = '';

  constructor(private http: HttpClient) {}

  

  readonly headers = new HttpHeaders().set('Content-Type', 'application/json');

  onFileSelected(event) {

      const file:File = event.target.files[0];

      if (file) {

          this.fileName = file.name;

          var blob = "";
          const reader = new FileReader();

          reader.readAsDataURL(file);
          reader.onload = () => {
            console.log(reader.result);
          }

          const requestBody = JSON.stringify(new Strategy(file.name, "test script text blablablabla"))

          console.log(requestBody);

          const upload$ = this.http.post<Strategy>("http://localhost:10000/create", requestBody);

          upload$.subscribe();
      }
  }
}
