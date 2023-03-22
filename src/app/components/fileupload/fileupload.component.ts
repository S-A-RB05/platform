import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { InputVariable } from 'src/app/models/InputVariable';
import { Strategy } from 'src/app/models/Strategy';

@Component({
  selector: 'app-fileupload',
  templateUrl: './fileupload.component.html',
  styleUrls: ['./fileupload.component.css'],
})
export class FileuploadComponent {
  fileName = '';
  variables: InputVariable[] = [];

  constructor(private http: HttpClient) {}

  readonly headers = new HttpHeaders().set('Content-Type', 'application/json');

  onFileSelected(event) {
    const file: File = event.target.files[0];

    if (file) {
      this.fileName = file.name;

      var blob = '';
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = () => {
        var base64Script = this.ReaderToContentBase64(reader);
        var stringScript = this.DecodeBase64(base64Script);
        this.variables = this.ParseScriptForInputVariables(stringScript);

        var strat = new Strategy(file.name, base64Script);
        const requestBody = JSON.stringify(strat);

        const upload$ = this.http.post(
          'http://localhost:10000/create',
          requestBody,
          { responseType: 'text' }
        );
        upload$.subscribe();
      };
    }
  }

  ReaderToContentString(reader: FileReader): string {
    var decode = reader.result as string;
    //encoded files always start with some information on how it was encoded, following by a ",".
    var array = decode.split(',');
    return atob(array[1]);
  }

  ReaderToContentBase64(reader: FileReader): string {
    var decode = reader.result as string;
    //encoded files always start with some information on how it was encoded, following by a ",".
    var array = decode.split(',');
    return array[1];
  }

  //assumes every input variable is places at the beginning of a line inside of the EA script
  ParseScriptForInputVariables(script: string): InputVariable[] {
    const variables = [];
    var splittedArray = script.split(/\r?\n/);
    console.log('INPUT LINES:');
    const inputPattern = /^input/i; // regex pattern to match strings starting with "input"
    splittedArray.forEach((str: string) => {
      if (inputPattern.test(str)) {
        // Do something with the string
        const splittedLine = str.split(/(?:=| )+/);
        if (splittedLine[1] == 'group') return;
        var variable = new InputVariable(
          splittedLine[2],
          splittedLine[1],
          splittedLine[3].replace(';', '')
        );
        console.log(variable);
        variables.push(variable);
      }
    });
    return variables;
  }

  DecodeBase64(baseString): string {
    const bytes = Uint8Array.from(window.atob(baseString), (c) =>
      c.charCodeAt(0)
    );
    return new TextDecoder().decode(bytes);
  }

  isHighlightable(type: string): boolean {
    return type === 'bool' || type === 'int' || type === 'double';
  }
}