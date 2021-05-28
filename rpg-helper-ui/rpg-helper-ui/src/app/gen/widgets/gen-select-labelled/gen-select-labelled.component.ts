import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UtilsLabelledItem } from '@app/utils/UtilsLabelledItem';

@Component({
  selector: 'gen-select-labelled',
  templateUrl: './gen-select-labelled.component.html',
  styleUrls: []
})
export class GenSelectLabelledComponent implements OnInit {

  @Input() label: string;
  @Input() currentLabelledItemLabel: string;
  @Input() availableLabelledItems: UtilsLabelledItem<any>[];

  @Output() change: EventEmitter<any> = new EventEmitter<any>();
  
  constructor() {
  }

  ngOnInit() {
  }

  public onChangeChoice($event) {
    this.change.emit(this.availableLabelledItems.find(x => $event.value === x.label));
  }
}
