import {Component, Input} from '@angular/core';
import {IBalanceItem} from "../utilities/splitwiseHelper";

@Component({
  selector: 'app-balance-item',
  templateUrl: './balance-item.component.html',
  styleUrls: ['./balance-item.component.css']
})
export class BalanceItemComponent {
  @Input() item: IBalanceItem | null = null;
  @Input() max: number = 0;

  getPerc(): number {
    return this.max > 0 ? Math.abs(this.item?.amount || 0) * 100 / this.max : 0;
  }
}
