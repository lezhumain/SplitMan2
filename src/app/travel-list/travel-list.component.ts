import { Component, OnInit } from '@angular/core';
import {Travel} from "../models/travel";
import {TravelService} from "../travel.service";
import {TravelModel} from "../models/travel-model";
import {Router} from "@angular/router";
import {NavBarService} from "../nav-bar.service";
import {combineLatest, of} from "rxjs";
import {UserServiceService} from "../user-service.service";
import {UserModel} from "../models/user-model";
import {first, flatMap} from "rxjs/operators";

@Component({
  selector: 'app-travel-list',
  templateUrl: './travel-list.component.html',
  styleUrls: ['./travel-list.component.css']
})
export class TravelListComponent implements OnInit {

  allTravels: TravelModel[] = [];
  updating = false;

  constructor(private readonly traverlService: TravelService,
              private readonly userServiceService: UserServiceService,
              private readonly router: Router,
              private readonly _navService: NavBarService) { }

  ngOnInit(): void {
    // this._navService.setHeaderValue("Welcome");

    this.update();
  }

  /**
   * Add travel
   */
  newTravel() {
    this.router.navigate(['travels/new']);
  }

  refresh() {
    this.update();
  }

  private update() {
    this.updating = true;
    combineLatest([
      this.userServiceService.getConnectedUser(),
      // this.traverlService.getTravels(true)
      this.traverlService.getTravels(true)
    ]).pipe(
      first()
    ).subscribe(([user, travels]: [UserModel | null, Travel[]]) => {
        const tm = TravelModel;
        const allTravels = user
          ? travels.filter(t => user.invites.some(i => i.isAccepted && i.tripID === t.id)).map(t => TravelModel.fromTravel(t))
          : [];

        // debugger;
        this.allTravels = allTravels.reverse();
        this.updating = false;
    });
  }
}
