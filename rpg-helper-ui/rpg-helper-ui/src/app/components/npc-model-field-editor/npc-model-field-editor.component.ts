import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ChangeModelField, RenameModelField } from '@app/dal/store/npc-world.actions';
import { NpcWorldState } from '@app/dal/store/npc-world.state';
import { NpcModelField, NpcFieldValueModel, FieldType } from '@app/models/NpcModelField';
import { NpcModelSheet } from '@app/models/NpcModelSheet';
import { DialogField, DialogFieldChoice, DialogFieldNumber, DialogFieldText, GenFormDialogComponent } from '@app/gen/widgets/gen-form-dialog/gen-form-dialog.component';
import { IStringDictionary } from '@app/utils/UtilsDictionary';
import { UtilsRef } from '@app/utils/UtilsRef';

@Component({
  selector: 'app-npc-model-field-editor',
  templateUrl: './npc-model-field-editor.component.html',
  styleUrls: []
})
export class NpcModelFieldEditorComponent implements OnInit {

  public name = 'Field Model editor:';

  @Input('modelFieldId')
  set refreshOnModelFieldId(modelFieldId : string) {
    this.modelFieldId = modelFieldId;
    this.refreshData(this.modelFields);
  }

  public modelFields: IStringDictionary<NpcModelField>;
  public modelFieldId: string;
  public modelField: NpcModelField;
  public modelFieldObs: Observable<IStringDictionary<NpcModelField>>;
  public availableModelSheets: NpcModelSheet[];

  public fieldTypeEnum = FieldType;
  public availableFieldTypes = Object.keys(this.fieldTypeEnum).filter(x => isNaN(Number(x)))
    .map(x => x.toString());

  constructor(public store: Store,
    private dialog: MatDialog) { 
    this.modelFieldObs = this.store.select(state => {
      return state.world.world.modelContainer.modelFields
    });
  }

  ngOnInit() {
    this.modelFieldObs.subscribe(world => this.refreshData(world));
  }

  public refreshData(modelFields: IStringDictionary<NpcModelField>) {
    if (modelFields == null) {
      return;
    }
    this.modelFields = modelFields;
    this.modelField = modelFields[this.modelFieldId];
    
    this.availableModelSheets = Object.values(this.store.selectSnapshot(NpcWorldState.getWorld).modelContainer.modelSheets);
    this.refreshDisplay();
  }

  public refreshDisplay() {
  }

  public getModelInit(modelField: NpcModelField) {
    if (this.modelField.modelSheet_Type != null) {
      return modelField.modelSheet_Type.id
    }
    return undefined;
  }

  public getFieldTypeString() {
    return this.availableFieldTypes[this.modelField.fieldType];
  }

  public changeFieldType($event) {
    let modelField = new NpcModelField();
    modelField.id = this.modelField.id;
    if ($event.value === undefined) {
      modelField.fieldType = null;
    }
    else {
      modelField.fieldType = this.availableFieldTypes.findIndex(x => x === $event.value);
    }
    this.store.dispatch(new ChangeModelField({modelField: modelField}));
  }

  public changeModelType($event) {
    let modelField = new NpcModelField();
    modelField.id = this.modelField.id;
    if ($event.value === undefined) {
      modelField.modelSheet_Type = null;
    }
    else {
      modelField.modelSheet_Type = new UtilsRef($event.value, NpcModelSheet.TYPE);
    }
    this.store.dispatch(new ChangeModelField({modelField: modelField}));
  }

  public addValue() {
    
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      dialogFields: [],
      dialogLabel: "add modelField"
    };
    dialogConfig.data.dialogFields.push(new DialogFieldText("newValue", ""));
    dialogConfig.data.dialogFields.push(new DialogFieldNumber("weight", 1, 1, 30));
    
    const dialogRef = this.dialog.open(GenFormDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: IStringDictionary<DialogField>) => {
      if (result == null) {
        return;
      }
      this.addValueInternal(DialogFieldText.getValue(result["newValue"]),
        DialogFieldNumber.getValue(result["weight"]));
    });
  }

  private addValueInternal(newValue: string, weight: number) {
    let modelField = NpcModelField.createPatch(this.modelField);
    modelField.modelValues = this.modelField.modelValues.map(x => x);
    let fieldValue = new NpcFieldValueModel();
    fieldValue.weight = weight;
    fieldValue.label = newValue;
    fieldValue.realValue = newValue;
    modelField.modelValues.push(fieldValue);

// si cest un decorator, ajouter les champs du decorator

    this.store.dispatch(new ChangeModelField({modelField: modelField}));
    
    this.store.dispatch(new ChangeModelField({modelField: modelField}));
  }
  
  public removeValue(value: NpcFieldValueModel) {
    let modelField = NpcModelField.createPatch(this.modelField);
    modelField.modelValues = this.modelField.modelValues.filter(x => x !== value);
    this.store.dispatch(new ChangeModelField({modelField: modelField}));
    
// si cest un decorator, enlever les champs du decorator
  }

  public changeName($event) {
    let modelField = NpcModelField.createPatch(this.modelField);
    modelField.name = $event.srcElement.value;
    this.store.dispatch(new ChangeModelField({modelField: modelField}));
  }
  
  public changeDesc($event) {
    let modelField = NpcModelField.createPatch(this.modelField);
    modelField.desc = $event.srcElement.value;
    this.store.dispatch(new ChangeModelField({modelField: modelField}));
  }
  
  public changeTag($event) {
    let modelField = NpcModelField.createPatch(this.modelField);
    modelField.tag = $event.srcElement.value;
    this.store.dispatch(new ChangeModelField({modelField: modelField}));
  }
  
  public changeMinVal($event) {
    let modelField = NpcModelField.createPatch(this.modelField);
    modelField.minVal = parseInt($event.srcElement.value);
    this.store.dispatch(new ChangeModelField({modelField: modelField}));
  }

  public changeMaxVal($event) {
    let modelField = NpcModelField.createPatch(this.modelField);
    modelField.maxVal = parseInt($event.srcElement.value);
    this.store.dispatch(new ChangeModelField({modelField: modelField}));
  }

  public changeMeanVal($event) {
    let modelField = NpcModelField.createPatch(this.modelField);
    modelField.meanVal = parseInt($event.srcElement.value);
    this.store.dispatch(new ChangeModelField({modelField: modelField}));
  }

  public changeStdVal($event) {
    let modelField = NpcModelField.createPatch(this.modelField);
    modelField.stdVal = parseInt($event.srcElement.value);
    this.store.dispatch(new ChangeModelField({modelField: modelField}));
  }

  public openModelSheet() {
    var url = window.location.href;    
    var urlmain = url.substring(0, url.lastIndexOf('/'));
    url = urlmain + '/npc-model-sheet-list-editor?selectedModelId=' + encodeURI(this.modelField.modelSheet_Type.id);
    window.location.href = url;
  }
}

