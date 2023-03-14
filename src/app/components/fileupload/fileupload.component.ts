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
            var decode = reader.result as string
            var array = decode.split(',')
            var script = array[1];
            var strat = new Strategy(file.name, script)
            const requestBody = JSON.stringify(strat)

            console.log(atob(script));

            const upload$ = this.http.post("http://localhost:10000/create", requestBody, {responseType: 'text'}); 
            upload$.subscribe();
          }

          
      }
  }
}
