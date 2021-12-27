import { Component, OnInit } from '@angular/core';
import {UserServiceService} from "../user-service.service";
import {ActivatedRoute, Router} from "@angular/router";
import {filter, first, take} from "rxjs/operators";
import {UserModel} from "../models/user-model";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  password: string = "";
  username: string = "";

  constructor(private readonly userServiceService: UserServiceService,
              private readonly router: Router,
              private readonly route: ActivatedRoute) { }

  ngOnInit(): void {
    this.userServiceService.getConnectedUser().pipe(
      take(2) // taking 2 as the 1st will always be null
    ).subscribe((u: UserModel | null) => {
      if(u !== null) {
        const target = this.route.snapshot.queryParams.hasOwnProperty("returnUrl")
          ? this.route.snapshot.queryParams.returnUrl
          : null;

        const targetUrl = target
          ? target.split("/").filter((part: string) => !!part)
          : ['travels'];

        this.router.navigate(targetUrl);
      }
    });
  }

  doLogin() {
    this.userServiceService.getUserByPass(this.username, this.password).subscribe((user: any) => {
      if(user) {
        this.loginOK(user);
      }
      else {
        this.loginNOK();
      }
    })
  }

  private loginNOK() {
    // TODO display error message
    return;
  }

  private loginOK(user: any) {
    // TODO redirect to list
    // this.userServiceService.getConnectedUser().pipe(
    //   filter(e => !!e),
    //   first()
    // ).subscribe(() => {
    //   this.router.navigate(['travels']);
    // });

    this.userServiceService.setConnectedUserByObj(user, true);
    this.router.navigate(['travels']);
  }

  goRegister() {
    this.router.navigate(['register']);
  }
}