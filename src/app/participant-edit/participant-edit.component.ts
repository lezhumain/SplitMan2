import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ExpenseModel} from "../models/expense-model";
import {TravelService} from "../travel.service";
import {ParticipantModel} from "../models/participants";

@Component({
  selector: 'app-participant-edit',
  templateUrl: './participant-edit.component.html',
  styleUrls: ['./participant-edit.component.css']
})
export class ParticipantEditComponent implements OnInit {
  participantModel: ParticipantModel = new ParticipantModel();
  private _travelID: number = -1;

  constructor(private readonly route: ActivatedRoute,
              private readonly router: Router,
              private readonly travelService: TravelService) { }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    const paramID: string | null = routeParams.get('travelID');
    const travelID: number | null = paramID === null ? null : Number(paramID);
    const paramIDex: string | null = routeParams.get('participantID');
    const participantID: number | null = paramID === null ? null : Number(paramIDex);

    if(travelID === null) {
      alert("No travel id specified");
      return;
    }

    this._travelID = travelID;

    if(!participantID) {
      console.log("new part");
    }
  }

  saveParticipant() {
    const travelID = this._travelID;
    this.travelService.saveParticipant(this.participantModel, travelID).subscribe(() => {
      // TODO check for failure
      this.router.navigate(['travels', travelID]);
    });
  }
}
