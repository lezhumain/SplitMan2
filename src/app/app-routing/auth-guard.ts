import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {UserServiceService} from "../user-service.service";
import {UserModel} from "../models/user-model";

@Injectable()
export class AuthGuard implements CanActivate {
  private isConnected = false;
  private authorizedTravelIDs: number[] = [];

  constructor(private router: Router,
              private readonly userServiceService: UserServiceService) {
    this.userServiceService.getConnectedUser().subscribe((um: UserModel | null) => {
      this.isConnected = !!um;
      this.authorizedTravelIDs = um ? um.invites.map(i => i.tripID).filter(t => t !== null) : [];
    });
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.isConnected) {
      const routeParams = route.paramMap;
      const paramID: string | null = routeParams.get('travelID');
      const travelID: number | null = paramID === null ? null : Number(paramID);
      const isMyTrip: boolean = travelID === null || this.authorizedTravelIDs.includes(travelID);

      // logged in so return true
      if (isMyTrip) {
        return true;
      }
      else {
        this.router.navigate(['travels']);
        return false;
      }
    }

    // not logged in so redirect to login page with the return url
    this.router.navigate(['login'], { queryParams: { returnUrl: state.url }});
    return false;
  }
}
