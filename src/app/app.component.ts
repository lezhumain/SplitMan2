import {Component, OnInit} from '@angular/core';
import "bootstrap";
import {environment} from "../environments/environment";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "font-awesome/css/font-awesome.min.css";

// import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
// import "../../node_modules/font-awesome/css/font-awesome.min.css";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.css'
  ]
})
export class AppComponent implements OnInit {
  title = 'SplitMan21';

  ngOnInit(): void {
    if(environment.addCookie) {
      environment.addCookie();
    }
  }
}
