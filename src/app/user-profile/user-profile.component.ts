import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {UserServiceService} from "../user-service.service";
import {combineLatest, of} from "rxjs";
import {first} from "rxjs/operators";
import {User} from "../models/user";
import {UserModel} from "../models/user-model";

class IBANValidator {
  /*
   * Returns 1 if the IBAN is valid
   * Returns -1 if the IBAN's length is not as should be (for CY the IBAN Should be 28 chars long starting with CY )
   * Returns any other number (checksum) when the IBAN is invalid (check digits do not match)
   * https://stackoverflow.com/a/35599724/3482730
   */
  static isValidIBANNumber(input: string): number {
    input = input.replace(/\s+/g, "");
    console.log("IBAN validate: " + input);
    const CODE_LENGTHS: any = {
      AD: 24, AE: 23, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
      CH: 21, CR: 21, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, ES: 24,
      FI: 18, FO: 18, FR: 27, GB: 22, GI: 23, GL: 18, GR: 27, GT: 28, HR: 21,
      HU: 28, IE: 22, IL: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28,
      LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27,
      MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29,
      RO: 24, RS: 22, SA: 24, SE: 24, SI: 19, SK: 24, SM: 27, TN: 24, TR: 26,
      AL: 28, BY: 28, /*CR: 22, */EG: 29, GE: 22, IQ: 23, LC: 32, SC: 31, ST: 25,
      SV: 28, TL: 23, UA: 29, VA: 22, VG: 24, XK: 20
    };
    const iban = String(input).toUpperCase().replace(/[^A-Z0-9]/g, ''), // keep only alphanumeric characters
      code = iban.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/);
    let // match and capture (1) the country code, (2) the check digits, and (3) the rest
      digits;
    // check syntax and length
    if (!code || iban.length !== CODE_LENGTHS[code[1]]) {
      return -1;
    }
    // rearrange country code and check digits, and convert chars to ints
    // @ts-ignore
    digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, (letter: string) => {
      return letter.charCodeAt(0) - 55;
    });
    // final check
    return IBANValidator.mod97(digits);
  }

  private static mod97(val: string): number {
    let checksum = val.slice(0, 2), fragment;
    for (let offset = 2; offset < val.length; offset += 7) {
      fragment = String(checksum) + val.substring(offset, offset + 7);
      checksum = (parseInt(fragment, 10) % 97).toString();
    }
    return Number(checksum);
  }
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: UserModel | null = null;
  isUs = false;
  isEditing = false;
  ibanValid = false;

  constructor(private readonly route: ActivatedRoute,
              private readonly userServiceService: UserServiceService,
              private readonly router: Router) { }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    const paramID: string | null = routeParams.get('userlID');
    const userlID: number | null = paramID === null ? null : Number(paramID);

    if(userlID === null) {
      return;
    }

    combineLatest([
      this.userServiceService.getUserByID(userlID),
      this.userServiceService.getConnectedUser()
    ]).pipe(
      first()
    ).subscribe(([u, conn]: [UserModel | null, UserModel | null]) => {
      this.user = u;
      this.isUs = !!conn && conn.id === u?.id
    });
  }

  edit() {
    if(!this.isUs || this.user?.id === undefined || this.user?.id === null) {
      return;
    }
    // this.router.navigate(['users', this.user?.id, "edit"]);
    this.isEditing = true;
  }

  save() {
    if(!this.user) {
      return;
    }

    this.userServiceService.addOrUpdateUser(this.user).subscribe(() => this.isEditing = false);
  }

  checkIBAN() {
    console.log("Checking IBAN: " + this.user?.iban);
    const res: number = !!this.user?.iban
      ? IBANValidator.isValidIBANNumber(this.user?.iban)
      : 1;
    this.ibanValid = res === 1;
    console.log(res);
  }
}
