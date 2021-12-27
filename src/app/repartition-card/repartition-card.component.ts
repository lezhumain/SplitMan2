import {Component, Input, OnInit} from '@angular/core';
import {IRepartitionItem} from "../repartition/repartition.component";
import {UserModel} from "../models/user-model";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-repartition-card',
  templateUrl: './repartition-card.component.html',
  styleUrls: ['./repartition-card.component.css']
})
export class RepartitionCardComponent implements OnInit {
  private _expense: IRepartitionItem = {} as IRepartitionItem;
  @Input()
  set expense(val: IRepartitionItem) {
    this._expense = val;
  }
  get expense(): IRepartitionItem {
    return this._expense;
  }

  travelID: number | null = null;

  private _connectedUser: UserModel | null = null;
  @Input()
  set connectedUser(u: UserModel | null) {
    this._connectedUser = u;
    if(u) {
      this.init();
    }
  }
  get connectedUser(): UserModel | null {
    return this._connectedUser;
  }

  ourNameInTrip = "";

  constructor(private readonly route: ActivatedRoute) { }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    const paramID: string | null = routeParams.get('travelID');
    this.travelID = paramID === null ? null : Number(paramID);

    this.init();
  }

  // getNameForTrip(): string {
  //   const target = this.connectedUser && this.connectedUser.invites
  //     ? this.connectedUser.invites.find(i => i.tripID === this.travelID)
  //     : null;
  //
  //   return target?.tripName || "";
  // }
  private init() {
    if(this.travelID === null || !this._connectedUser) {
      return;
    }

    this.ourNameInTrip = this._connectedUser.invites.find(i => i.tripID === this.travelID)?.nameInTrip || "";
  }
}
