import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, NgModule } from '@angular/core';
import { InputVariable } from 'src/app/models/InputVariable';
import { Strategy } from 'src/app/models/Strategy';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TestData } from 'src/app/models/TestData';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-fileupload',
  templateUrl: './fileupload.component.html',
  styleUrls: ['./fileupload.component.css'],
})
export class FileuploadComponent {
  mqFileName = '';
  exFileName = '';
  FileID = '';
  variables: InputVariable[] = [];
  userStrats: Strategy[] = this.getUserStrats(this.authService.userData.uid);

  constructor(private http: HttpClient, public authService: AuthService) {}

  readonly headers = new HttpHeaders().set('Content-Type', 'application/json');

  private mqFile: File;
  private exFile: File;
  selectedStrat: Strategy = new Strategy('test', 'test', 'test');

  onSelectStrategy(strat: Strategy) {
    this.selectedStrat = strat;
    console.log(
      'the selected strategy is now: ' +
        this.selectedStrat.name +
        ' with id: ' +
        this.selectedStrat.id
    );

    var stringScript = this.DecodeBase64(this.selectedStrat.mq);
    this.variables = this.ParseScriptForInputVariables(stringScript);
    this.FileID = strat.id;
  }

  onMQFileSelected(event) {
    const file: File = event.target.files[0];

    if (file) {
      this.mqFile = file;
      this.mqFileName = this.mqFile.name;

      const reader = new FileReader();

      reader.readAsDataURL(this.mqFile);
      reader.onload = () => {
        var base64Script = this.ReaderToContentBase64(reader);
        var stringScript = this.DecodeBase64(base64Script);
        this.variables = this.ParseScriptForInputVariables(stringScript);

        this.selectedStrat.name = this.removeExtension(this.mqFile.name);
        this.selectedStrat.mq = base64Script;

        this.selectedStrat.userId;
        if (this.mqFile != undefined && this.exFile != undefined) {
          this.InitateUpload(this.selectedStrat);
        } else {
          console.log('not both files have a value yet');
        }
      };
    }
  }

  onEXFileSelected(event) {
    const file: File = event.target.files[0];

    if (file) {
      this.exFile = file;
      this.exFileName = this.exFile.name;

      const reader = new FileReader();

      reader.readAsDataURL(this.exFile);
      reader.onload = () => {
        var base64Script = this.ReaderToContentBase64(reader);
        var stringScript = this.DecodeBase64(base64Script);

        this.selectedStrat.ex = base64Script;
        this.selectedStrat.userId = this.authService.userData.uid;
        if (this.mqFile != undefined && this.exFile != undefined) {
          this.InitateUpload(this.selectedStrat);
        } else {
          console.log('not both files have a value yet');
        }
      };
    }
  }

  getUserStrats(uid: string) {
    var strats: Strategy[] = [];

    const upload$ = this.http.get('http://localhost:10000/getall/' + uid);

    upload$.subscribe(
      (response) => {
        // Convert the response to an array of strategy objects
        Object.values(response).map((item: any) => {
          // Assuming Strategy is the interface or class representing a strategy object
          const strategy: Strategy = {
            id: item._id,
            userId: item.userid,
            name: item.name,
            mq: item.mq,
            ex: item.ex,
          };
          strats.push(strategy);
        });
      },
      (error) => {
        console.error(error);
        // handle the error here
      }
    );

    console.log(strats);

    return strats;
  }

  InitateUpload(strat: Strategy) {
    console.log('initiated upload!');
    console.log(this.mqFile);
    console.log(this.exFile);
    const requestBody = JSON.stringify(strat);

    const upload$ = this.http.post(
      'http://localhost:10000/create',
      requestBody,
      { responseType: 'text' }
    );

    upload$.subscribe(
      (response) => {
        const newStrategyId = response; // store the response in a variable
        this.FileID = response;
        console.log('New strategy ID:', newStrategyId);
        // do something with the newStrategyId here, such as updating your UI
      },
      (error) => {
        console.error(error);
        // handle the error here
      }
    );
  }

  StartTest(data: TestData) {
    if (data.id == '') {
      console.log(
        'No test data available, did you upload your mq file and pressed save yet?'
      );
    }

    const requestBody = JSON.stringify(data);

    const upload$ = this.http.post(
      'http://localhost:8081/updateconfig',
      requestBody,
      { responseType: 'text' }
    );

    upload$.subscribe(
      (response) => {
        // do something with reponse
      },
      (error) => {
        console.error(error);
        // handle the error here
      }
    );
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
        if (
          variable.type === 'int' ||
          variable.type === 'double' || //only add to variables array if the type is int, double or bool. these are the only types you want to be able to change in the frontend.
          variable.type === 'bool'
        ) {
          variables.push(variable);
        }
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

  removeExtension(fileName: string): string {
    const mqExtension = '.mq5';
    const exExtension = '.ex5';
    if (fileName.endsWith(mqExtension)) {
      return fileName.slice(0, -mqExtension.length);
    } else if (fileName.endsWith(exExtension)) {
      return fileName.slice(0, -exExtension.length);
    }
    return fileName;
  }

  onSave() {
    var data = new TestData(this.FileID);
    this.variables.forEach((element) => {
      if (element.type === 'bool' && element.boolValue === undefined) {
        element.boolValue = element.defaultValue.toLowerCase() === 'true';
      } else if (element.type !== 'bool') {
        if (element.start === undefined) {
          element.start = Number(element.defaultValue);
        }

        if (element.end === undefined) {
          element.end = Number(element.defaultValue);
        }

        if (element.step === undefined) {
          element.step = Number(element.defaultValue);
        }
      }
    });
    data.variables = this.variables;
    console.log(data);
    this.StartTest(data);
  }
}
