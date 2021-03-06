import { Component, OnInit } from '@angular/core';
import {Travel} from "../models/travel";
import {TravelModel} from "../models/travel-model";
import {TravelService} from "../travel.service";
import {ActivatedRoute, Router} from "@angular/router";
import {UserServiceService} from "../user-service.service";
import {NavBarService} from "../nav-bar.service";

// enum EditMode {
//   Edit,
//   Create
// }

@Component({
  selector: 'app-travel-edit',
  templateUrl: './travel-edit.component.html',
  styleUrls: ['./travel-edit.component.css']
})
export class TravelEditComponent implements OnInit {
  travel: TravelModel = new TravelModel();

  // private mode: EditMode = EditMode.Create;
  savingTravel = false;

  constructor(private readonly travelService: TravelService,
              private readonly userServiceService: UserServiceService,
              private readonly router: Router,
              private readonly route: ActivatedRoute,
              private readonly _navService: NavBarService) { }

  ngOnInit(): void {
    // this.mode = window.location.href.includes("/new") ? EditMode.Create : EditMode.Edit;

    const routeParams = this.route.snapshot.paramMap;
    const paramID: string | null = routeParams.get('travelID');
    const travelID: number | null = paramID === null ? null : Number(paramID);

    // this.mode = travelID === null ? EditMode.Edit : EditMode.Create;

    let backTarget = "/travels";
    if(travelID !== null) {
      this.travelService.getTravelByID(travelID).subscribe((t: Travel | null) => {
        if (t) {
          this.travel = t;
        }
      });

      backTarget += "/" + travelID;
    }

    console.log("travelID: " + travelID);

    this._navService.setBackValue(backTarget);
  }

  saveTravel() {
    this.savingTravel = true;
    this.travelService.saveTravel(this.travel, this.userServiceService).subscribe((updated: TravelModel) => {
      // TODO check for failure
      this.savingTravel = false;
      this.router.navigate(['travels/' + updated.id]);
    });
  }
}
