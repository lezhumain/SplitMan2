import { Component, OnInit } from '@angular/core';
import {UserModel} from "../models/user-model";
import {UserServiceService} from "../user-service.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  get email(): string {
    return this._email;
  }

  set email(value: string) {
    this._email = value;
  }
  private _email: string = "";

  user: UserModel = new UserModel();


  constructor(private readonly userServiceService: UserServiceService,
              private readonly router: Router) {
    // const  nowDate = new Date();
    // this.user.email = `g${nowDate.getTime()}@g.com`;
    // this.user.username = "Dju" + (nowDate.toISOString());
    // this.user.password = "dju";
    // this.user.password1 = "dju";
  }

  ngOnInit(): void {
  }

  doRegister() {
    this.userServiceService.addOrUpdateUser(this.user, false, true).subscribe(() => {
      console.log("User saved");
      // debugger;
      this.router.navigate(['login']);
    }, (err: Error) => {
      alert(err.message);
    });
  }

  checkLocalStorage() {
    return !!localStorage;
  }

  goLogin() {
    this.router.navigate(['login']);
  }
}
