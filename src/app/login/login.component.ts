import {Component, OnInit} from '@angular/core';
import {UserServiceService} from "../user-service.service";
import {ActivatedRoute, Router} from "@angular/router";
import {take} from "rxjs/operators";
import {UserModel} from "../models/user-model";
import {ToastComponent} from "../toast/toast.component";
import {ToastMessage, ToastType} from "../toast/toast.shared";

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
    this.userServiceService.getUserByPass(this.username, this.password, true).subscribe((user: any) => {
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
    ToastComponent.toastdata$.next({type: ToastType.ERROR, message: "Login error."} as ToastMessage);
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

    // this.userServiceService.setConnectedUserByObj(user, true, true);
    this.router.navigate(['travels']);

    ToastComponent.toastdata$.next({type: ToastType.INFO, message: "Login success."} as ToastMessage);
  }

  goRegister() {
    this.router.navigate(['register']);
  }
}
