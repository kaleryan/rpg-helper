import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { CreateCustomRealField, SyncRealSheetDependencies, UpdateRealFieldValue } from '@app/dal/store/npc-world.actions';
import { NpcWorldState } from '@app/dal/store/npc-world.state';
import { NpcRealSheet, NpcRealContainer, NpcRealField } from '@app/models/NpcRealSheet';
import { NpcModelField } from '@app/models/NpcModelField';
import { NpcModelInstField, NpcModelSheet } from '@app/models/NpcModelSheet';
import { DialogField, DialogFieldBoolean, DialogFieldChoice, DialogFieldNumber, DialogFieldText, GenFormDialogComponent } from '@app/gen/widgets/gen-form-dialog/gen-form-dialog.component';
import { IStringDictionary } from '@app/utils/UtilsDictionary';
import { UtilsRef } from '@app/utils/UtilsRef';
import { NpcGeneratorService } from '@app/dal/db-service/npc-generator.service';
import { NpcRealSheetEditorService } from '@app/dal/db-service/npc-real-sheet-editor.service';

@Component({
  selector: 'app-npc-real-field-embeddedlist-editor',
  templateUrl: './npc-real-field-embeddedlist-editor.component.html',
  styleUrls: []
})
export class NpcRealFieldEmbeddedListEditorComponent implements OnInit {

  @Input('realSheetId') set
  refreshDataId(realSheetId: string) {
    this.realSheetId = realSheetId;
    this.refreshData(this.store.selectSnapshot(NpcWorldState.getWorld).realContainer);
  }
  
  public realSheetId: string;
  public name = 'Real fields';
  public realSheet: NpcRealSheet;
  public unfilteredRealFields: NpcRealField[];
  public availableModelFields: NpcModelField[];

  public filteredInheritedRealFields: NpcRealField[];
  public filteredCustomRealFields: NpcRealField[];
  public filteredDecoratingRealFields: NpcRealField[];

  public filter = '';

  public realContainerObs: Observable<NpcRealContainer>;

  constructor(public store: Store,
    private dialog: MatDialog,
    private npcGeneratorService: NpcGeneratorService,
    private realSheetEditor: NpcRealSheetEditorService) {
    this.realContainerObs = this.store.select(state => {
      return state.world.world.realContainer
    });
  }

  ngOnInit() {
    this.realContainerObs.subscribe(realContainer => this.refreshData(realContainer));
  }

  public refreshData(realContainer: NpcRealContainer) {
    this.availableModelFields = Object.values(this.store.selectSnapshot(NpcWorldState.getWorld).modelContainer.modelFields);

    let npcRealSheet = realContainer.realSheetsById[this.realSheetId]
    this.unfilteredRealFields = Object.values(npcRealSheet.realFields);
    this.realSheet = npcRealSheet;
    this.refreshDisplay();
  }

  public refreshDisplay() {
    let filteredRealFields = this.unfilteredRealFields;
    if (this.filter !== '') {
      filteredRealFields = filteredRealFields.filter(x => x.name.includes(this.filter) || x.modelInstField.id.includes(this.filter))
    }
    this.filteredInheritedRealFields = filteredRealFields.filter(x => x.sourceRef != null && x.sourceRef.refType == NpcModelSheet.TYPE);
    this.filteredCustomRealFields = filteredRealFields.filter(x => x.sourceRef == null);
    this.filteredDecoratingRealFields = filteredRealFields.filter(x => x.sourceRef != null && x.sourceRef.refType == NpcRealSheet.TYPE);
  }

  public setFilter($event) {
    this.filter = $event.srcElement.value;
    this.refreshDisplay();
  }

  public addRealField() {
    if (this.availableModelFields.length === 0) {
      alert("Create a RealField first by using the ModelField tab");
      return;
    }
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      dialogFields: [
        new DialogFieldChoice("realField", this.availableModelFields.map(x => x.name), this.availableModelFields[0].name),
        new DialogFieldNumber("maxCount", 1, 1, 20),
        new DialogFieldNumber("meanCount", 1, 1, 20),
        new DialogFieldBoolean("unicity of values", false),
        new DialogFieldBoolean("sheet decorator", false),
        new DialogFieldText("label")
      ],
      dialogLabel: "add realField"
    };

    const dialogRef = this.dialog.open(GenFormDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: IStringDictionary<DialogField>) => {
      if (result == null) {
        return;
      }
      let modelField = this.availableModelFields.find(x => x.name === DialogFieldChoice.getValue(result["realField"]));
      let maxCount = DialogFieldNumber.getValue(result["maxCount"]);
      let meanCount = DialogFieldNumber.getValue(result["meanCount"]);
      let unicity = DialogFieldBoolean.getValue(result["unicity of values"]);
      let decorator = DialogFieldBoolean.getValue(result["sheet decorator"]);
      let label = DialogFieldText.getValue(result["label"]);
      if (label === '')
      {
        label = modelField.name
      }
      let modelInstField = new NpcModelInstField();
      modelInstField.maxCount = maxCount;
      modelInstField.meanCount = meanCount;
      modelInstField.unicityInValues = unicity;
      modelInstField.modelField = new UtilsRef(modelField.id, NpcModelField.TYPE);

      let realField = NpcRealField.createCustom(label, modelInstField, undefined, decorator);
      this.store.dispatch(new CreateCustomRealField({realSheet: this.realSheet, realField: realField}));
    });
  }

  public reroll(isOverwriting: boolean) {
    this.npcGeneratorService.dispatchRerollSheet(this.realSheet, this.unfilteredRealFields, isOverwriting);
  }

  public syncRealSheetDependencies() {
    this.store.dispatch(new SyncRealSheetDependencies({realSheet: this.realSheet}));
  }
}
