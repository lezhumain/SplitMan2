import {Component, OnInit} from '@angular/core';
import {UserServiceService} from "../user-service.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastComponent} from "../toast/toast.component";
import {ToastType} from "../toast/toast.shared";
import {combineLatest, Observable} from "rxjs";
import {User} from "../models/user";
import {map} from "rxjs/operators";
import {UserModel} from "../models/user-model";

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.css']
})
export class InviteComponent implements OnInit {
  email: string = "";
  private _travelID: number | null = null;
  users: {username: string, email: string}[] = [];

  constructor(private readonly userServiceService: UserServiceService,
              private readonly router: Router,
              private readonly route: ActivatedRoute) { }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    const paramID: string | null = routeParams.get('travelID');
    const travelID: number | null = paramID === null ? null : Number(paramID);

    this._travelID = travelID;

    combineLatest([
      this.userServiceService.getConnectedUser(),
      this.userServiceService.getUsers()
    ]).pipe(
      map(([connectedU, u]: [UserModel | null, User[]]) => {
        return u.filter(theu => !theu.invites.some(ui => ui.tripID === this._travelID))
          .map(uu => {
            return {
              username: uu.username,
              email: uu.email
            };
          })//.filter(uuu => uuu.username === connectedU?.username && uuu.email === connectedU?.email)
          ;
      })
    ).subscribe(all => this.users = all);
  }

  sendInvite() {
    const target = this.users.find(u => u.username === this.email);
    if(!target) {
      return;
    }

    const email: string = target.email;

    this.userServiceService.sendInvite(this._travelID, email).subscribe((res: boolean) => {
      if(!res) {
        this.onInviteError();
        return;
      }

      this.router.navigate(['travels', this._travelID]).then(() => {
        // alert("Invited " + this.email + " successfully.");
        ToastComponent.toastdata$.next({type: ToastType.SUCCESS, message: "Invited " + this.email + " successfully."});
      });
    }, () => {
      this.onInviteError();
    })
  }

  private onInviteError() {
    // alert("Couldn't invite " + this.email + ".");
    ToastComponent.toastdata$.next({type: ToastType.ERROR, message: "Couldn't invite " + this.email + "."});
  }
}
