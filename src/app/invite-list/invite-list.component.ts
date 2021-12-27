import { Component, OnInit } from '@angular/core';
import {Observable, of} from "rxjs";
import {InviteDate, UserModel} from "../models/user-model";
import {combineLatest, first, map, takeWhile, tap} from "rxjs/operators";
import {UserServiceService} from "../user-service.service";
import {ActivatedRoute, Router} from "@angular/router";
import {flatMap} from "rxjs/internal/operators";
import {TravelService} from "../travel.service";
import {Travel} from "../models/travel";
import {NavBarService} from "../nav-bar.service";

@Component({
  selector: 'app-invite-list',
  templateUrl: './invite-list.component.html',
  styleUrls: ['./invite-list.component.css']
})
export class InviteListComponent implements OnInit {
  connectedUser$: Observable<UserModel | null> | null = null;
  private alive = true;

  private userlID: number | null = null;

  invites$: Observable<InviteDate[]> | null = null;

  constructor(private readonly userServiceService: UserServiceService,
              private readonly travelService: TravelService,
              private readonly route: ActivatedRoute,
              private readonly _navService: NavBarService,
              private readonly router: Router) { }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    const paramID: string | null = routeParams.get('userlID');
    this.userlID = paramID === null ? null : Number(paramID);

    // this.connectedUser$ = this.userServiceService.getConnectedUser().pipe(
    //   takeWhile(() => this.alive),
    //   // tap((u: UserModel | null) => {
    //   //   if(u && u.id !== userlID) {
    //   //     this.router.navigate(['travels']);
    //   //   }
    //   // }),
    //   flatMap((u: UserModel | null): Observable<[UserModel | null, Travel[]]> => {
    //     const allIds = u && u.invites ? u.invites.map(i => i.tripID) : [];
    //     // return combineLatest(of(u), this.travelService.getTravelsByIDs(allIds)) as Observable<[UserModel | null, Travel[]]>
    //     return <any>combineLatest([
    //       of(u),
    //       this.travelService.getTravelsByIDs(allIds)
    //     ]) as Observable<[UserModel | null, Travel[]]>;
    //   }),
    //   map(([u, travels]: [UserModel | null, Travel[]]) => {
    //     if(u && u.invites) {
    //       u.invites.forEach((inv: InviteDate) => {
    //         const travel = travels.find(t => t.id === inv.tripID);
    //         if(travel) {
    //           inv.tripName = travel.name;
    //         }
    //       });
    //     }
    //
    //     return u;
    //   })
    // );

    this.connectedUser$ = this.userServiceService.getConnectedUser().pipe(
      takeWhile(() => this.alive),
      // tap((u: UserModel | null) => {
      //   if(u && u.id !== userlID) {
      //     this.router.navigate(['travels']);
      //   }
      // }),
      flatMap((u: UserModel | null): Observable<UserModel | null> => {
        const allIds = u && u.invites ? u.invites.map(i => i.tripID) : [];
        // return combineLatest(of(u), this.travelService.getTravelsByIDs(allIds)) as Observable<[UserModel | null, Travel[]]>
        return this.travelService.getTravelsByIDs(allIds).pipe(
          map((travels: Travel[]) => {
            if(u && u.invites) {
              u.invites.forEach((inv: InviteDate) => {
                const travel = travels.find(t => t.id === inv.tripID);
                if(travel) {
                  inv.tripName = travel.name;
                }
              });
            }
            return u;
          })
        );
      })
      // ,
      // map(([u, travels]: [UserModel | null, Travel[]]) => {
      //   if(u && u.invites) {
      //     u.invites.forEach((inv: InviteDate) => {
      //       const travel = travels.find(t => t.id === inv.tripID);
      //       if(travel) {
      //         inv.tripName = travel.name;
      //       }
      //     });
      //   }
      //
      //   return u;
      // })
    );

    this.invites$ = this.connectedUser$.pipe(
      map((u: UserModel | null) => {
        const res = u && u.invites ? u.invites : [];
        return res.filter(r => !r.isAccepted);
      })
    );

    this._navService.setBackValue("/travels");
  }

  ngOnDestroy() {
    this.alive = false;
  }

  acceptInvite(invite: InviteDate) {
    if(this.userlID === null) {
      return;
    }

    invite.isAccepted = true;
    this.userServiceService.updateUserInvite(invite, this.userlID).subscribe(() => {
      console.log("accepted");
    });
  }

  discardInvite(invite: InviteDate) {
    if(this.userlID === null) {
      return;
    }

    this.userServiceService.updateUserInvite(invite, this.userlID, true).subscribe(() => {
      console.log("accepted");
    });
  }
}
