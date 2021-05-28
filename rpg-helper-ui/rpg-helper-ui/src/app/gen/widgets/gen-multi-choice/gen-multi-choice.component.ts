import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';

import { MatMenuTrigger } from '@angular/material/menu';

export class GenMultiChoiceContent {
  public constructor(public selected: string[],
    public unselected: string[]) {}
} 

@Component({
  selector: 'gen-multi-choice',
  templateUrl: './gen-multi-choice.component.html'
})
export class GenMultiChoiceComponent implements OnInit {

  @Input() choices: GenMultiChoiceContent;
  
  @ViewChild('inputText') inputText: any

  private initialChoices: string[];
  public isHidden: boolean = true;

  @Output() choicesChanged: EventEmitter<GenMultiChoiceContent> = new EventEmitter<GenMultiChoiceContent>();
  
  constructor() { }

  ngOnInit() {
    this.initialChoices = this.choices.selected.map(x => x)
    this.initialChoices.push(...this.choices.unselected.map(x => x))
  }

  public add(choice: string) {
    this.choices.selected.push(choice);
    this.choices.unselected = this.choices.unselected.filter(x => x !== choice)

    this.choicesChanged.emit(this.choices)
  }

  public addNew() {
    this.add(this.inputText.nativeElement.value)
    this.inputText.nativeElement.value = ""
  }

  public remove(choice: string) {
    this.choices.selected = this.choices.selected.filter(x => x !== choice)
    this.choices.unselected.push(choice)

    this.choicesChanged.emit(this.choices)
  }

  public switchVisibility() {
    this.isHidden = ! this.isHidden
  } 
}
