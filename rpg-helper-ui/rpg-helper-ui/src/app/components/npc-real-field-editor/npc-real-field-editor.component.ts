import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { ChangeRealField, DeleteRealField, UpdateRealFieldValue } from '@app/dal/store/npc-world.actions';
import { NpcRealSheet, NpcRealField } from '@app/models/NpcRealSheet';
import { FieldType, NpcModelField } from '@app/models/NpcModelField';
import { NpcModelInstField } from '@app/models/NpcModelSheet';
import { DialogField, DialogFieldFreeChoice, DialogFieldNumber, GenFormDialogComponent } from '@app/gen/widgets/gen-form-dialog/gen-form-dialog.component';
import { IStringDictionary } from '@app/utils/UtilsDictionary';
import { NpcWorldResolverService } from '@app/dal/db-service/npc-world-resolver.service';
import { NpcGeneratorService } from '@app/dal/db-service/npc-generator.service';
import { UtilsLabelledItem } from '@app/utils/UtilsLabelledItem';
import { NpcWorldState } from '@app/dal/store/npc-world.state';
import { NpcRealSheetEditorService } from '@app/dal/db-service/npc-real-sheet-editor.service';

@Component({
  selector: 'app-npc-real-field-editor',
  templateUrl: './npc-real-field-editor.component.html',
  styleUrls: []
})
export class NpcRealFieldEditorComponent implements OnInit {

  @Input('realField') set
  refreshDataId(realField: NpcRealField) {
    this.realField = realField;
    this.refreshData();
  }

  @Input() realSheet: NpcRealSheet;
  
  public realField: NpcRealField;
  public modelInstField: NpcModelInstField;
  public modelField: NpcModelField;
  public instParamShown: boolean = false;

  constructor(public store: Store,
    private dialog: MatDialog,
    private realSheetEditor: NpcRealSheetEditorService,
    private wr: NpcWorldResolverService,
    private npcGeneratorService: NpcGeneratorService) {
  }

  ngOnInit() {
    this.refreshData();
  }

  public refreshData() {
    this.modelInstField = this.wr.getModelInstField(this.realField);
    this.modelField = this.wr.get<NpcModelField>(this.modelInstField.modelField);
    this.refreshDisplay();
  }

  public refreshDisplay() {
  }

  public changeLabel($event) {
    let realField = new NpcRealField();
    realField.id = this.realField.id;
    realField.name = $event.srcElement.value;
    this.store.dispatch(new ChangeRealField({realSheetId: this.realSheet.id, realField: realField}));
  }
  
  public removeRealField() {
    this.store.dispatch(new DeleteRealField({realSheet: this.realSheet, id: this.realField.id}));
  }

  public addRealFieldValue() {
    const modelField = this.wr.get<NpcModelField>(this.modelInstField.modelField);
    if (modelField.fieldType == FieldType.NumbersInRange) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        dialogFields: [
          new DialogFieldNumber("value", modelField.meanVal, modelField.minVal, modelField.maxVal)
        ],
        dialogLabel: "add value"
      };
  
      const dialogRef = this.dialog.open(GenFormDialogComponent, dialogConfig);
  
      dialogRef.afterClosed().subscribe((result: IStringDictionary<DialogField>) => {
        if (result == null) {
          return;
        }
        let values = this.realField.selectedValues.map(x =>x);
        if (values.length >= this.modelInstField.maxCount) {
          values = values.slice(1 + values.length - this.modelInstField.maxCount);
        }
        values.push(DialogFieldNumber.getValue(result["value"]).toString());
        
        this.realSheetEditor.dispatchUpdateRealFieldValueAction(this.realSheet, this.realField, values);
      });
      return;
    }

    let proposedValues = this.npcGeneratorService.getProposedValues(modelField).filter(x => !this.realField.selectedValues.includes(x.label));

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      dialogFields: [
        new DialogFieldFreeChoice("value", proposedValues.map(x => x.label), "")
      ],
      dialogLabel: "add value"
    };

    const dialogRef = this.dialog.open(GenFormDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: IStringDictionary<DialogField>) => {
      if (result == null) {
        return;
      }
      let values = this.realField.selectedValues.map(x =>x);
      if (values.length >= this.modelInstField.maxCount) {
        values = values.slice(1 + values.length - this.modelInstField.maxCount);
      }
      values.push(proposedValues.find(x => x.label === DialogFieldFreeChoice.getValue(result["value"])).realValue);

      this.realSheetEditor.dispatchUpdateRealFieldValueAction(this.realSheet, this.realField, values);
    });
  }

  public removeRealFieldValue(value: string) {
    let values = this.realField.selectedValues.filter(x => x !== value);
    this.realSheetEditor.dispatchUpdateRealFieldValueAction(this.realSheet, this.realField, values);
  }

  public hasRealSheetValue() {
    return this.modelField.modelSheet_Type != null;
  } 

  public goToRealFieldValue(value: string) {
    if (!this.hasRealSheetValue()) {
      return;
    }
    var url = window.location.href;    
    var urlmain = url.substring(0, url.lastIndexOf('/'));
    url = urlmain + '/npc-real-sheet-list-editor?selectedRealSheetId=' + encodeURI(value);
    window.location.href = url;
  }

  public rerollRealField() {
    let values = this.npcGeneratorService.rerollRealField(this.realField, undefined, this.modelInstField, this.modelField);
    this.realSheetEditor.dispatchUpdateRealFieldValueAction(this.realSheet, this.realField, values);
  }

  public switchInstParamsVisibility() {
    this.instParamShown = !this.instParamShown;
  }

  public onChangeDecorator($event) {
    let realField = new NpcRealField();
    realField.id = this.realField.id;
    realField.isDecorator = $event;
    this.store.dispatch(new ChangeRealField({realSheetId: this.realSheet.id, realField: realField}));
  }

  public getSelectedValues(): UtilsLabelledItem<string>[] {
    return this.wr.getSelectedValues(this.realField, this.store.selectSnapshot(NpcWorldState.getWorld).realContainer);
  }
}
