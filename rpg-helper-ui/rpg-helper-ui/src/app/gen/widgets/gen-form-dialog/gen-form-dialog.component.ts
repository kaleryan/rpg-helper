import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { IStringDictionary } from '../../../utils/UtilsDictionary';

export enum DialogFieldType {
  Number,
  Text,
  Choice,
  FreeChoice,
  MultiChoice,
  MultiChoiceOrText,
  Boolean
}

export abstract class DialogField {
  
  public availableValues: string[];
  public min: number;
  public max: number;

  public initialValues: string[];
  public finalValues: string[];
  
  public constructor(public label: string, public type: DialogFieldType) {}
}

export class DialogFieldNumber extends DialogField {
  public constructor(label: string, initialValue: number = 0, min: number = 0, max: number = 100) {
    super(label, DialogFieldType.Number);
    this.min = min;
    this.max = max;
    this.initialValues = [initialValue.toString()];
    this.finalValues = [initialValue.toString()];
    return this;
  }

  public static getValue(field: DialogField): number {
    return parseInt(field.finalValues[0])
  }
}

export class DialogFieldText extends DialogField {
  public constructor(label: string, initialValue: string = '', length: number = 100) {
    super(label, DialogFieldType.Text);
    this.max = length;
    this.initialValues = [initialValue];
    this.finalValues = [initialValue];
    return this;
  }

  public static getValue(field: DialogField): string {
    return field.finalValues[0];
  }
}

export class DialogFieldChoice extends DialogField {
  public constructor(label: string, values: string[], initialValue: string = '') {
    super(label, DialogFieldType.Choice);
    this.availableValues = values;
    this.initialValues = [initialValue];
    this.finalValues = [initialValue];
    return this;
  }

  public static getValue(field: DialogField): string {
    return field.finalValues[0];
  }
}

export class DialogFieldFreeChoice extends DialogField {
  public constructor(label: string, values: string[], initialValue: string = '') {
    super(label, DialogFieldType.FreeChoice);
    this.availableValues = values;
    this.initialValues = [initialValue];
    this.finalValues = [initialValue];
    return this;
  }

  public static getValue(field: DialogField): string {
    return field.finalValues[0];
  }
}

export class DialogFieldBoolean extends DialogField {
  public constructor(label: string, initialValue: boolean) {
    super(label, DialogFieldType.Boolean);
    this.initialValues = [initialValue ? "true": "false"];
    this.finalValues = [initialValue ? "true": "false"];
    return this;
  }

  public static getValue(field: DialogField): boolean {
    return field.finalValues[0] === "true";
  }
}

export interface DialogRealSheet {
  dialogLabel: string;
  dialogFields: DialogField[];
}

@Component({
  selector: 'gen-form-dialog',
  templateUrl: './gen-form-dialog.component.html',
  styleUrls: []
})
export class GenFormDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<GenFormDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public realSheet: DialogRealSheet) {
  }

public dialogFieldType = DialogFieldType;

  ngOnInit() {
  }

  onOk(): void {
    const result = {};
    this.realSheet.dialogFields.forEach(field => result[field.label] = field);
    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  public onChangeText(field: DialogField, $event) {
    if (field.type === DialogFieldType.Number) {
      let newNumber = parseInt($event.srcElement.value);
      if (newNumber > field.max) {
        $event.srcElement.value = field.max.toString();
      } else if (newNumber < field.min) {
        $event.srcElement.value = field.min.toString();
      }
    }
    field.finalValues = [$event.srcElement.value]
  }

  public validateValue(field: DialogField, event: number) {
    if (event > field.max) {
      field.initialValues[0] = field.max.toString();
    } else if (event < field.min) {
      field.initialValues[0] = field.min.toString();
    } else {
      field.initialValues[0] = event.toString();
    }
  }
  
  public onChangeChoice(field: DialogField, $event) {
    field.finalValues = [$event.value]
  }

  public onSelectAutoComplete(field, $event) {
    field.finalValues = [$event.option.value];
  }

  public onChangeChecked(field: DialogField, $event) {
    field.finalValues = [$event ? "true": "false"]
  }
}
