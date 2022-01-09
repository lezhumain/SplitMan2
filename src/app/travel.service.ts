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
import {UserModel} from "./models/user-model";

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

  saveTravel(travel: TravelModel, userService?: UserServiceService): Observable<TravelModel> {
    const data = Travel.from(travel);

    let obs = this.updateItem(data);

    if(data.id === -1) {
      obs = this.getNewId().pipe(
        flatMap((newId: number) => {
          data.id = newId;
          travel.id = data.id;
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

    return obs.pipe(
      map(() => travel)
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
      flatMap((travl: Travel | null ) => {
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
      flatMap((p) => {
        if(!p) {
          return of(null);
        }
        p.participants = p?.participants?.filter(p => p.name !== name) || [];
        return this.saveTravel(p);
      }),
      map(() => null)
    );
  }
}
