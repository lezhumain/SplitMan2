import { Injectable } from '@angular/core';
import {Observable, of} from "rxjs";
import {Travel} from "./models/travel";
import {BaseService} from "./base-service.service";
import {TravelModel} from "./models/travel-model";
import {User} from "./models/user";
import {flatMap} from "rxjs/internal/operators";
import {map} from "rxjs/operators";

import {Participant, ParticipantModel} from "./models/participants";
import {UserServiceService} from "./user-service.service";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class TravelService extends BaseService{
  private readonly storeKey = "travel";

  constructor(http: HttpClient) {
    super(http);
  }

  getTravels(force = false): Observable<Travel[]> {
    // debugger;
    return this.getAllByType<Travel>(this.storeKey, force).pipe(
      map((o: Travel[]) => {
        return o.map((oo: Travel) => Travel.fromJson(oo));
      })
    );
  }

  saveTravel(travel: TravelModel, userService?: UserServiceService): Observable<null> {
    const data = Travel.from(travel);

    let obs = this.updateItem(data);

    if(data.id === -1) {
      obs = this.getNewId().pipe(
        flatMap((newId: number) => {
          data.id = newId;
          return this.addOrUpdateItem(data, true);
        })
      );
    }

    if(userService) {
      obs = obs.pipe(
        flatMap(() => {
          return userService.addTravelToConnectedUser(data);
        })
      );
    }

    return obs;
  }

  private getNewId(): Observable<number> {
    return this.getTravels().pipe(
      map((travels: Travel[]) => {
        const lastID = Math.max(...travels.map(t => t.id));
        return isFinite(lastID) ? lastID + 1 : 0;
      })
    );
  }

  getTravelByID(travelID: number): Observable<Travel | null> {
    return this.getTravels().pipe(
      map((all: Travel[]) => {
        return all.find(t => t.id === travelID) || null;
      })
    );
  }

  saveParticipant(participantModel: ParticipantModel, travelID: number): Observable<null> {
    return this.getTravelByID(travelID).pipe(
      flatMap((travl: Travel | null ) => {
        if(travl == null) {
          return of(null);
        }

        const p: Participant = Participant.from(participantModel);

        if(!travl.participants) {
          travl.participants = [];
        }

        if (!travl.participants.some(t => t.name === participantModel.name)) {
          travl.participants.push(p);
        }

        const totalDays = travl.participants.reduce((res: number, item: Participant) => {
          res += item.dayCount;
          return res;
        }, 0);

        travl.participants.forEach((pa: Participant) => {
          pa.ratio = pa.dayCount / totalDays;
        });

        return this.saveTravel(travl);
      })
    );
  }

  getTravelsByIDs(allIds: number[]): Observable<Travel[]> {
    return this.getTravels().pipe(
      map(e => e.filter(r => allIds.includes(r.id)))
    );
  }
}