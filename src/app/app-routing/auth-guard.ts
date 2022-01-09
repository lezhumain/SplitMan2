import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {UserServiceService} from "../user-service.service";
import {UserModel} from "../models/user-model";
import {Observable, of} from "rxjs";
import {first, map} from "rxjs/operators";
import {flatMap} from "rxjs/internal/operators";

@Injectable()
export class AuthGuard implements CanActivate {
  private authorizedTravelIDs: Observable<number[]>;
  private isConnected: Observable<boolean>;

  constructor(private router: Router,
              private readonly userServiceService: UserServiceService) {
    const sessionData = userServiceService.getSessionData();

    const user$ = this.userServiceService.getConnectedUser(Number(sessionData));

    this.authorizedTravelIDs = user$.pipe(
      map((um: UserModel | null) => {
        // this.isConnected = !!um;
        // this.isConnected = !!um || !!sessionData || sessionData == "0";
        return um ? um.invites.map(i => i.tripID).filter(t => t !== null) : [];
      })
    );

    this.isConnected = user$.pipe(
      map((um: UserModel | null) => {
        return !!um;
      })
    );

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.isConnected.pipe(
      flatMap((isConnected: boolean) => {
        if (isConnected) {
          const routeParams = route.paramMap;
          const paramID: string | null = routeParams.get('travelID');
          const travelID: number | null = paramID === null ? null : Number(paramID);

          return this.authorizedTravelIDs.pipe(
            first(),
            map((auth: number[]) => {
              return travelID === null || auth.includes(travelID);
            })
          );
        }

        // not logged in so redirect to login page with the return url
        // this.router.navigate(['login'], { queryParams: { returnUrl: state.url }});
        return of(false);
      })
    );
  }
}
