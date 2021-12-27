import {Component, Input, OnInit} from '@angular/core';
import {UserModel} from "../models/user-model";
import {TravelModel} from "../models/travel-model";
import {Router} from "@angular/router";

@Component({
  selector: 'app-travel-card',
  templateUrl: './travel-card.component.html',
  styleUrls: ['./travel-card.component.css']
})
export class TravelCardComponent implements OnInit {
  @Input() travel: TravelModel | null = null;

  constructor(private readonly router: Router) { }

  ngOnInit(): void {
  }

  openTravelEdit() {
    if(!this.travel) {
      return;
    }
    this.router.navigate(['travels/', this.travel?.id, "edit"]);
  }

  openTravel() {
    if(!this.travel) {
      return;
    }
    this.router.navigate(['travels/', this.travel?.id]);
  }

  getParticipantList(): string {
    return this.travel?.participants?.slice(0, 3)?.map(p => p.name).join(", ") || "";
  }
}
