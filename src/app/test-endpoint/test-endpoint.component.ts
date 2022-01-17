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

  constructor(private readonly _service: TestEndpointService) { }

  ngOnInit(): void {
  }

  doTest() {
    this._service.go(JSON.stringify(this.payload)).subscribe((da: any) => {
      // TODO check for failure
      console.log(da);
      this.downloadImg(da);
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


}
