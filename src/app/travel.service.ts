import { Injectable } from '@angular/core';
import {Observable, of} from "rxjs";
import {Travel} from "./models/travel";
import {BaseService} from "./base-service.service";
import {TravelModel} from "./models/travel-model";
import {User} from "./models/user";
import {mergeMap} from "rxjs";
import {map} from "rxjs/operators";

import {Participant, ParticipantModel} from "./models/participants";
import {UserServiceService} from "./user-service.service";
import {HttpClient} from "@angular/common/http";
import {UserModel} from "./models/user-model";
import {ApiService} from "./api.service";

@Injectable({
  providedIn: 'root'
})
export class TravelService extends BaseService{
  private readonly storeKey = "travel";

  constructor(http: HttpClient, private readonly _apiService: ApiService) {
    super(http);
  }

  getTravels(force = false): Observable<Travel[]> {
    // debugger;
    return this._apiService.getAllByType<Travel>(this.storeKey, force).pipe(
      map((o: Travel[]) => {
        return o.map((oo: Travel) => Travel.fromJson(oo));
      })
    );
  }

  saveTravel(travel: TravelModel, userService?: UserServiceService): Observable<TravelModel> {
    const data = Travel.from(travel);

    let obs = this._apiService.updateItem(data);

    if(data.id === -1) {
      obs = this.getNewId().pipe(
        mergeMap((newId: number) => {
          data.id = newId;
          travel.id = data.id;
          return this._apiService.saveInDb(data);
        })
      );
    }

    if(userService) {
      obs = obs.pipe(
        mergeMap(() => {
          return userService.addTravelToConnectedUser(data);
        })
      );
    }

    return obs.pipe(
      map(() => {
        return travel;
      })
    );
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

  saveParticipant(participantModel: ParticipantModel, travelID: number, originalTravelName?: string | null): Observable<null> {
    return this.getTravelByID(travelID).pipe(
      mergeMap((travl: Travel | null ) => {
        if(travl == null) {
          return of(null);
        }

        const p: Participant = Participant.from(participantModel);

        if(!travl.participants) {
          travl.participants = [];
        }

        const partIndex = travl.participants.findIndex(t => t.name === (originalTravelName || p.name));
        if (partIndex === -1) {
          travl.participants.push(p);
        }
        else {
          travl.participants.splice(partIndex, 1, p);
        }

        const totalDays = travl.participants.reduce((res: number, item: Participant) => {
          res += item.dayCount;
          return res;
        }, 0);

        travl.participants.forEach((pa: Participant) => {
          pa.ratio = pa.dayCount / totalDays;
        });

        return this.saveTravel(travl).pipe(map(e => null));
      })
    );
  }

  getTravelsByIDs(allIds: number[]): Observable<Travel[]> {
    return this.getTravels().pipe(
      map(e => e.filter(r => allIds.includes(r.id)))
    );
  }

  deleteParticipant(name: string, travelID: number): Observable<null> {
    return this.getTravelByID(travelID).pipe(
      mergeMap((p: Travel | null) => {
        if(!p) {
          return of(null);
        }
        if(p && p.participants !== undefined) {
          p.participants = p.participants.filter((pp: Participant) => pp.name !== name) || [];
        }
        return this.saveTravel(p);
      }),
      map(() => null)
    );
  }
}
