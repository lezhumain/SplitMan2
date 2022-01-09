import {Component, OnInit} from '@angular/core';
import {UserServiceService} from "../user-service.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastComponent} from "../toast/toast.component";
import {ToastType} from "../toast/toast.shared";

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.css']
})
export class InviteComponent implements OnInit {
  email: string = "";
  private _travelID: number | null = null;

  constructor(private readonly userServiceService: UserServiceService,
              private readonly router: Router,
              private readonly route: ActivatedRoute) { }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    const paramID: string | null = routeParams.get('travelID');
    const travelID: number | null = paramID === null ? null : Number(paramID);

    this._travelID = travelID;
  }

  sendInvite() {
    this.userServiceService.sendInvite(this._travelID, this.email).subscribe((res: boolean) => {
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
