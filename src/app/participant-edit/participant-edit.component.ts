import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ExpenseModel} from "../models/expense-model";
import {TravelService} from "../travel.service";
import {ParticipantModel} from "../models/participants";
import {TravelModel} from "../models/travel-model";
import {Travel} from "../models/travel";
import {needsLinking} from "@angular/compiler-cli/linker";
import {catchError} from "rxjs/operators";
import {ToastComponent} from "../toast/toast.component";
import {ToastType} from "../toast/toast.shared";

@Component({
  selector: 'app-participant-edit',
  templateUrl: './participant-edit.component.html',
  styleUrls: ['./participant-edit.component.css']
})
export class ParticipantEditComponent implements OnInit {
  participantModel: ParticipantModel | null = null;
  private _travelID: number = -1;

  partOriginalName: string | null = null;
  savingParticipant = false;

  constructor(private readonly route: ActivatedRoute,
              private readonly router: Router,
              private readonly travelService: TravelService) { }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    const paramID: string | null = routeParams.get('travelID');
    const travelID: number | null = paramID === null ? null : Number(paramID);
    const paramIDex: string | null = routeParams.get('participantID');

    if(travelID === null) {
      alert("No travel id specified");
      return;
    }

    this._travelID = travelID;

    if(!paramIDex) {
      console.log("new part");
      this.participantModel = new ParticipantModel()
    }
    else {
      this.travelService.getTravelByID(travelID).subscribe((trvel: Travel | null) => {
        const model = trvel ? TravelModel.fromTravel(trvel) : null;
        const participantModel = model?.participants
          ? model.participants.find(p => encodeURI(p.name) === paramIDex)
          : null;

        this.participantModel = participantModel ? participantModel : new ParticipantModel();
        this.partOriginalName = participantModel?.name || null;
      });
    }
  }

  saveParticipant() {
    if(!this.participantModel) {
      return;
    }

    const travelID = this._travelID;
    this.savingParticipant = true;
    this.travelService.saveParticipant(this.participantModel, travelID, this.partOriginalName).subscribe(() => {
      // TODO check for failure
      this.savingParticipant = false;
      this.router.navigate(['travels', travelID]);
    },(err) => {
      this.savingParticipant = false;
      console.warn("Save part error:");
      console.warn(err);
      ToastComponent.toastdata$.next({type: ToastType.ERROR, message: "Couldn't add participant."});
    });
  }
}
