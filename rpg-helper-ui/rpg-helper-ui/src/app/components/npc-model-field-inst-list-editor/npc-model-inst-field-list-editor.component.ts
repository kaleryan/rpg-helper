import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { NpcWorldResolverService } from '@app/dal/db-service/npc-world-resolver.service';
import { AddModelFieldToModel, ChangeModelFieldLabel, ChangeModelInstField, RemoveModelField } from '@app/dal/store/npc-world.actions';
import { NpcModelField } from '@app/models/NpcModelField';
import { NpcModelInstField, NpcModelSheet, NpcModelContainer } from '@app/models/NpcModelSheet';
import { DialogField, DialogFieldBoolean, DialogFieldChoice, DialogFieldNumber, DialogFieldText, GenFormDialogComponent } from '@app/gen/widgets/gen-form-dialog/gen-form-dialog.component';
import { IStringDictionary } from '@app/utils/UtilsDictionary';
import { UtilsLabelledItem } from '@app/utils/UtilsLabelledItem';
import { UtilsRef } from '@app/utils/UtilsRef';

@Component({
  selector: 'app-npc-model-inst-field-list-editor',
  templateUrl: './npc-model-inst-field-list-editor.component.html',
  styleUrls: []
})
export class NpcModelInstFieldListEditorComponent implements OnInit {

  @Input('modelId')
  set refreshOnModelId(modelId : string) {
    this.modelId = modelId;
    this.refreshData(this.modelContainer);
  }
  public modelId: string;
  public modelContainer: NpcModelContainer;
  public name = 'Instantiated field model list editor:';
  public model: NpcModelSheet;
  public unfilteredModelFields: UtilsLabelledItem<NpcModelInstField>[];
  public filteredModelFields: UtilsLabelledItem<NpcModelInstField>[];
  public availableFields: NpcModelField[];

  public filter = '';

  public modelContainerObs: Observable<NpcModelContainer>;

  constructor(public store: Store,
    private dialog: MatDialog,
    private worldResolverService: NpcWorldResolverService) {
    this.modelContainerObs = this.store.select(state => {
      return state.world.world.modelContainer
    });
  }

  ngOnInit() {
    this.modelContainerObs.subscribe(modelContainer => this.refreshData(modelContainer));
  }

  public refreshData(modelContainer: NpcModelContainer) {
    if (modelContainer == null) {
      return;
    }
    this.modelContainer = modelContainer;
    this.availableFields = Object.values(modelContainer.modelFields);
    let npcModel = modelContainer.modelSheets[this.modelId]
    if (npcModel == null) {
      this.unfilteredModelFields = []
    }
    else
    {
      this.unfilteredModelFields = Object.entries(npcModel.modelInstFields)
        .map(([key, value]) => {
          let instField = this.worldResolverService.get<NpcModelInstField>(value);
          return new UtilsLabelledItem<NpcModelInstField>(key, instField)
        });
    }
    this.model = npcModel;
    this.refreshDisplay();
  }

  public refreshDisplay() {
    this.filteredModelFields = this.unfilteredModelFields;
    if (this.filter !== '') {
      this.filteredModelFields = this.filteredModelFields.filter(x => x.label.includes(this.filter) || x.item.modelField.id.includes(this.filter))
    }
  }

  public setFilter($event) {
    this.filter = $event.srcElement.value;
    this.refreshDisplay();
  }

  public addModelField() {
    if (this.availableFields.length === 0) {
      alert("Create a ModelField first by using the ModelFields tab");
      return;
    }
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      dialogFields: [
        new DialogFieldChoice("modelField", this.availableFields.map(x => x.name), this.availableFields[0].name),
        new DialogFieldNumber("maxCount", 1, 1, 20),
        new DialogFieldNumber("meanCount", 1, 1, 20),
        new DialogFieldBoolean("unicity of values", false),
        new DialogFieldText("label")
      ],
      dialogLabel: "add modelField"
    };

    const dialogRef = this.dialog.open(GenFormDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: IStringDictionary<DialogField>) => {
      if (result == null) {
        return;
      }
      let modelField = this.availableFields.find(x => x.name === DialogFieldChoice.getValue(result["modelField"]));
      let maxCount = DialogFieldNumber.getValue(result["maxCount"]);
      let meanCount = DialogFieldNumber.getValue(result["meanCount"]);
      let unicity = DialogFieldBoolean.getValue(result["unicity of values"]);
      let label = DialogFieldText.getValue(result["label"]);
      if (label === '')
      {
        label = modelField.name
      }

      let newModelInstField = new NpcModelInstField();
      newModelInstField.modelField = new UtilsRef(modelField.id, NpcModelField.TYPE)
      newModelInstField.maxCount = maxCount;
      newModelInstField.meanCount = meanCount;
      newModelInstField.unicityInValues = unicity;

      this.store.dispatch(new AddModelFieldToModel({modelSheet: this.model, modelField: modelField, label: label, newModelInstField: newModelInstField}));
    });
  }
  
  public changeLabel(labelledModelField: UtilsLabelledItem<NpcModelInstField>, $event) {
    this.store.dispatch(new ChangeModelFieldLabel({model: this.model, oldLabel: labelledModelField.label, newLabel: $event.srcElement.value}));
  }
  
  public changeMaxCount(labelledModelField: UtilsLabelledItem<NpcModelInstField>, $event) {
    // defaut d'actualisation: il faut ecouter plus d'event!!!
    let modelInstField = new NpcModelInstField()
    modelInstField.maxCount = parseInt($event.srcElement.value);
    this.store.dispatch(new ChangeModelInstField({id: labelledModelField.item.id, modelInstField: modelInstField, realSheet: undefined, realFieldId: undefined}));
  }
  
  public changeMeanCount(labelledModelField: UtilsLabelledItem<NpcModelInstField>, $event) {
    let modelInstField = new NpcModelInstField()
    modelInstField.meanCount = parseInt($event.srcElement.value);
    this.store.dispatch(new ChangeModelInstField({id: labelledModelField.item.id, modelInstField: modelInstField, realSheet: undefined, realFieldId: undefined}));
  }
  
  public removeModelField(labelledModelField: UtilsLabelledItem<NpcModelInstField>) {
    this.store.dispatch(new RemoveModelField({modelSheet: this.model, label: labelledModelField.label}));
  }
}
