import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-fileupload',
  templateUrl: './fileupload.component.html',
  styleUrls: ['./fileupload.component.css']
})
export class FileuploadComponent {
  
  fileName = '';

  constructor(private http: HttpClient) {}

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

          const upload$ = this.http.post("http://localhost:10000/create", reader.result);

          upload$.subscribe();
      }
  }
}
