import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {UserServiceService} from "../user-service.service";
import {UserModel} from "../models/user-model";
import {Observable} from "rxjs";
import {debounceTime, distinctUntilChanged, filter, first, map, tap} from "rxjs/operators";
import {User} from "../models/user";

@Injectable()
export class AuthGuard implements CanActivate {
  private authorizedTravelIDs$: Observable<number[] | null>;
  // private isConnected$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private isConnected$: Observable<boolean>;

  // private authorizedTravelIDs: number[] = [];
  // private isConnected = false;

  private userID: number | undefined;

  constructor(private router: Router,
              private readonly userServiceService: UserServiceService) {
    // const sessionData = userServiceService.getSessionData();

    // const user$ = this.userServiceService.getConnectedUser(Number(sessionData));
    console.log("[AuthGuard] constructor");


    // const user$: Observable<UserModel | null> = this.userServiceService.getConnectedUser(Number(sessionData)).pipe(
    //   debounceTime(200),
    //   distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
    //   mergeMap((cUser: UserModel | null) => {
    //     return cUser
    //       ? of(cUser)
    //       : this.userServiceService.getUserByPass("", "");
    //   }),
    //   distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
    //   tap((r) => console.log("[AuthGuard] getConnectedUser: %o", r))
    // );

    // const user$: Observable<UserModel | null> = this.getConnectedUser(Number(sessionData)).pipe(
    // const user$: Observable<UserModel | null> = this.userServiceService.getConnectedUser().pipe(

    // const user$: Observable<UserModel | null> = this.userServiceService.getConnectedUser().pipe(
    //   mergeMap((us: UserModel | null) => {
    //     // return this.userServiceService.getConnectedUser(us ? undefined : Number(sessionData))
    //     return us ? of(us) : this.userServiceService.getConnectedUser(Number(sessionData))
    //   }),
    //   debounceTime(200),
    //   distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
    //   // mergeMap((cUser: UserModel | null) => {
    //   //   return cUser
    //   //     ? of(cUser)
    //   //     : this.userServiceService.getUserByPass("", "");
    //   // }),
    //   // distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
    //   tap((r) => console.log("[AuthGuard] getConnectedUser: %o", r))
    // );
    const user$: Observable<UserModel | null> = this.userServiceService._connectedUser.pipe(
      debounceTime(200),
      distinctUntilChanged((prev, curr) => prev?._rev === curr?._rev),
      map((user: User | null) => {
        return (user !== null ? user.toModel() : null) as UserModel;
      }),
      tap((r) => console.log("[AuthGuard] getConnectedUser: %o", r))
    );

    // const setAllObs = () => {
      this.authorizedTravelIDs$ = user$.pipe(
        map((um: UserModel | null) => {
          // this.isConnected = !!um;
          // this.isConnected = !!um || !!sessionData || sessionData == "0";
          return um ? um.invites.map(i => i.tripID).filter(t => t !== null) : null;
        })
      );

      this.isConnected$ = user$.pipe(
        map((um: UserModel | null) => {
          return !!um;
        })
      );
    // };



    // this.userServiceService.getConnectedUser(Number(sessionData)).pipe(
    //   debounceTime(200),
    //   distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
    //   // mergeMap((cUser: UserModel | null) => {
    //   //   return cUser
    //   //     ? of(cUser)
    //   //     : this.userServiceService.getUserByPass("", "");
    //   // }),
    //   // distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
    //   tap((r) => console.log("[AuthGuard] getConnectedUser: %o", r))
    // ).subscribe((um: UserModel | null) => {
    //   this.authorizedTravelIDs = um ? um.invites.map(i => i.tripID).filter(t => t !== null) : [];
    //   this.isConnected = !!um;
    // });



    // user$.subscribe((um: UserModel | null) => {
    //   const current = this.isConnected$.getValue();
    //   const res = !!um;
    //   if (current !== res) {
    //     this.isConnected$.next(res);
    //   }
    // });

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log("[AuthGuard] canActivate");

    // return this.isConnected$.pipe(
    // return this.isConnected$.pipe(
    //   first(),
    //   mergeMap((isConnected: boolean) => {
    //     if (isConnected) {
    //       const routeParams = route.paramMap;
    //       const paramID: string | null = routeParams.get('travelID');
    //       const travelID: number | null = paramID === null ? null : Number(paramID);
    //
    //       return this.authorizedTravelIDs$.pipe(
    //         first(),
    //         map((auth: number[]) => {
    //           return travelID === null || auth.includes(travelID);
    //         })
    //       );
    //     }
    //
    //     // not logged in so redirect to login page with the return url
    //     // this.router.navigate(['login'], { queryParams: { returnUrl: state.url }});
    //     return of(false);
    //   })
    // );


    // const authURLs = ["/travels"];
    // if(authURLs.some(a => state.url.includes(a))) {
    //   return this.isConnected$.pipe(first());
    // }



    // if(this.userServiceService.connectedUserID === -1) {
    //   // this._connectedUser.next(null);
    //   this._updateConnectedUser(null);
    // }

    return this.authorizedTravelIDs$.pipe(
      filter(l => this.userServiceService.connectedUserID === -1 || l !== null),
      first(),
      map((auth: number[] | null) => {
        if(auth === null) {
          return false;
        }
        else {
          const routeParams = route.paramMap;
          const paramID: string | null = routeParams.get('travelID');
          const travelID: number | null = paramID === null ? null : Number(paramID);

          return travelID === null || auth.includes(travelID);
        }
      })
    );


    // if (this.isConnected) {
    //   const routeParams = route.paramMap;
    //   const paramID: string | null = routeParams.get('travelID');
    //   const travelID: number | null = paramID === null ? null : Number(paramID);
    //
    //   return travelID === null || this.authorizedTravelIDs.includes(travelID);
    // }
    //
    // // not logged in so redirect to login page with the return url
    // // this.router.navigate(['login'], { queryParams: { returnUrl: state.url }});
    // return of(false);
  }

  private getConnectedUser(number: number) {
    let targetNumb: number | undefined = undefined;
    if(!this.userID) {
      this.userID = number;
      targetNumb = number
    }
    return this.userServiceService.getConnectedUser(targetNumb);
  }
}
