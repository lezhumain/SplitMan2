import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {UserServiceService} from "../user-service.service";
import {combineLatest, of} from "rxjs";
import {first} from "rxjs/operators";
import {User} from "../models/user";
import {UserModel} from "../models/user-model";

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: UserModel | null = null;
  isUs = false;
  isEditing = false;

  constructor(private readonly route: ActivatedRoute,
              private readonly userServiceService: UserServiceService,
              private readonly router: Router) { }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    const paramID: string | null = routeParams.get('userlID');
    const userlID: number | null = paramID === null ? null : Number(paramID);

    if(userlID === null) {
      return;
    }

    combineLatest([
      this.userServiceService.getUserByID(userlID),
      this.userServiceService.getConnectedUser()
    ]).pipe(
      first()
    ).subscribe(([u, conn]: [UserModel | null, UserModel | null]) => {
      this.user = u;
      this.isUs = !!conn && conn.id === u?.id
    });
  }

  edit() {
    if(!this.isUs || this.user?.id === undefined || this.user?.id === null) {
      return;
    }
    // this.router.navigate(['users', this.user?.id, "edit"]);
    this.isEditing = true;
  }

  save() {
    if(!this.user) {
      return;
    }

    this.userServiceService.addOrUpdateUser(this.user).subscribe(() => this.isEditing = false);
  }
}
