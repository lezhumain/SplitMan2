import { Component, OnInit } from '@angular/core';
import {NavigationEnd, NavigationStart, Router} from "@angular/router";
import {filter, first, map, takeWhile, tap} from "rxjs/operators";
import { Location } from '@angular/common';
import {NavBarService} from "../nav-bar.service";
import {Observable} from "rxjs";
import {UserModel} from "../models/user-model";
import {UserServiceService} from "../user-service.service";
import {main} from "@angular/compiler-cli/src/main";


@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  private alive = true;

  showLogo = false;
  // showLogo$: Observable<boolean> = new Observable<boolean>();
  headerValue$: Observable<string> | null = null;
  backUrl$: Observable<string> | null = null;

  connectedUser$: Observable<UserModel | null> | null = null;
  private connectedUserID: number | null = -1;

  constructor(private readonly router: Router,
              private _location: Location,
              private _navService: NavBarService,
              private readonly userServiceService: UserServiceService) { }

  ngOnInit(): void {
    console.log("ggggggggggggggggggg");
    this.router.events.pipe(
      filter((e): e is NavigationStart => {
        const ok: boolean = !!(e instanceof NavigationStart);
        return ok;
      }),
      takeWhile(() => this.alive)
    ).subscribe((value: NavigationStart) => {
      if(["register", "login", "travels"].some(v => value.url.endsWith(v))) {
        // logo angular
        this.showLogo = true;
      }
      else {
        // back icon
        this.showLogo = false;
      }
      console.log('current route: ', this.router.url.toString());
    });

    // this.showLogo$ = this.router.events.pipe(
    //   filter((e): e is NavigationStart => {
    //     const ok: boolean = !!(e instanceof NavigationStart);
    //     return ok;
    //   }),
    //   takeWhile(() => this.alive),
    //   map((value: NavigationStart) => {
    //     // if(["register", "login", "travels"].some(v => value.url.endsWith(v))) {
    //     //   // logo angular
    //     //   this.showLogo = true;
    //     // }
    //     // else {
    //     //   // back icon
    //     //   this.showLogo = false;
    //     // }
    //     console.log('current route: ', this.router.url.toString());
    //
    //     return ["register", "login", "travels"].some(v => value.url.endsWith(v));
    //   })
    // );

    this.headerValue$ = this._navService.getHeaderValue().pipe(
      takeWhile(() => this.alive)
    );

    this.backUrl$ = this._navService.getBackValue().pipe(
      takeWhile(() => this.alive)
    );

    this.connectedUser$ = this.userServiceService.getConnectedUser().pipe(
      takeWhile(() => this.alive),
      tap(u => {
        console.warn("NavBar user: %o", u);
        if(u) {
          this.connectedUserID = u.id;
        }
        else {
          this.connectedUserID = null;
        }
        console.log("Connected user changed: %o", u)
      })
    );
  }

  ngOnDestroy() {
    this.alive = false;
  }

  goBack() {
    // this._location.back();
    this.backUrl$?.pipe(
      first()
    ).subscribe((target: string) => {
      this.router.navigate([target])
    });
  }

  hasInvites(user: UserModel): boolean {
    return user.invites.some(i => !i.isAccepted);
  }

  openInvites() {
    if(this.connectedUserID === null) {
      return;
    }

    this.router.navigate(['users', this.connectedUserID, "invites"]);
  }

  openProfile() {
    this.router.navigate(['users', this.connectedUserID]);
  }

  logOut() {
    this.userServiceService.logOut().subscribe(() => {
      this.router.navigate(['login']);
    });
  }
}
