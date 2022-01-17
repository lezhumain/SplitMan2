import { Component, OnInit } from '@angular/core';
import {TestEndpointService} from "../test-endpoint.service";
import {ExpenseModel} from "../models/expense-model";

class TestObj {
  name = "";
  surname = "";
  birth = "";
  date = "";
  constructor() {
    this.date = new Date().toISOString().replace(/\.\d{3}Z$/, "+02:00");
  }
}

@Component({
  selector: 'app-test-endpoint',
  templateUrl: './test-endpoint.component.html',
  styleUrls: ['./test-endpoint.component.css']
})
export class TestEndpointComponent implements OnInit {
  payload: TestObj = new TestObj();
  private _file?: File;

  constructor(private readonly _service: TestEndpointService) { }

  ngOnInit(): void {
  }

  doTest() {

    if(!this._file) {
      return;
    }

    const fileName = this._file.name;
    const formData = new FormData();
    formData.append("document", this._file);
    formData.append("fileName", fileName);
    formData.append("payload", JSON.stringify(this.payload));


    // const upload$ = this.http.post("/api/thumbnail-upload", formData);
    // upload$.subscribe();

    this._service.go(formData).subscribe((da: any) => {
      // TODO check for failure
      console.log(da);
      this.downloadImg(da);

      this._file = undefined;
    });
  }

  downloadImg(bytes: any) {
    var blob = new Blob([bytes], {
      type: "image/png"
    });

    const hiddenElement = document.createElement('a');
    // hiddenElement.href = 'data:image/png,' + encodeURI(textToSave);
    hiddenElement.href = window.URL.createObjectURL(blob);
    hiddenElement.target = '_blank';
    hiddenElement.download = `the_imgage.png`;
    hiddenElement.click();
  }


  fileChanged(target: EventTarget | null) {
    const files = (<HTMLInputElement>target)?.files;
    this._file = files ? files[0] : undefined;
  }
}
