import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'gen-input-number',
  templateUrl: './gen-input-number.component.html'
})
export class GenInputNumberComponent implements OnInit {

  @Input() label: string;
  @Input() value: number;
  @Input() min: number;
  @Input() max: number;

  @Output() change: EventEmitter<number> = new EventEmitter<number>();
  
  constructor() { }

  ngOnInit() {
  }

  public onChange($event) {
    let newNumber = parseInt($event.srcElement.value);
    if (newNumber > this.max) {
      $event.srcElement.value = this.max.toString();
    } else if (newNumber < this.min) {
      $event.srcElement.value = this.min.toString();
    }
    this.change.emit($event.srcElement.value);
  }
}
