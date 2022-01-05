import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
// import * as $ from "jquery";
import {animate, style, transition, trigger} from "@angular/animations";
import {BehaviorSubject, Observable, of, Subject} from "rxjs";
import {debounceTime, delay, first, map, tap} from "rxjs/operators";
import {ToastMessage} from "./toast.shared";

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateY(-100%)'}),
        animate('200ms ease-in', style({transform: 'translateY(0%)'}))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({transform: 'translateY(-100%)'}))
      ])
    ])
  ]
})
export class ToastComponent implements OnInit {
  // data$: Subject<ToastMessage | null> = new Subject<ToastMessage | null>();
  static toastdata$: BehaviorSubject<ToastMessage | null> = new BehaviorSubject<ToastMessage | null>(null);
  data$: Observable<ToastMessage | null>;

  @ViewChild('toastElem') toastElem!: ElementRef<HTMLDivElement>;

  constructor() {
    // const data: ToastMessage = new ToastMessage();
    // data.type = ToastType.INFO;
    // data.message = "TEST";
    //
    // this.data$.next(data);

    this.data$ = ToastComponent.toastdata$.pipe(
      tap((d) => {
        this.hideToastAfter();
      })
    );
  }

  ngOnInit(): void {

  }

  hideToastAfter(): void {
    of(null).pipe(
      delay(4000),
      first()
    ).subscribe(() => {
      // this.data = null;
      ToastComponent.toastdata$.next(null);
    });
  }
}
