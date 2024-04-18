import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {LinkService} from "../link.service";

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})
export class JoinComponent implements OnInit {
  constructor(private readonly router: Router,
              private readonly route: ActivatedRoute,
              private readonly _linkService: LinkService) {
  }

  ngOnInit(): void {
    debugger;
    const params: Params = this.route.snapshot.paramMap;
    const link: string | null = params.get('travelID');

    if(link !== null) {
      this._linkService.inviteFromLink(link).subscribe(() => {
        this.router.navigate(['travels']);
      });
    }
  }
}
