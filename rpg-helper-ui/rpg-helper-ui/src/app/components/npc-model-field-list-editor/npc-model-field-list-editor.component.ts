import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { CreateModelField, DeleteModelField, RemoveModelField, RenameModelField, ChangeModelField } from '@app/dal/store/npc-world.actions';
import { FieldType, NpcModelField } from '@app/models/NpcModelField';
import { NpcModelSheet } from '@app/models/NpcModelSheet';
import { DialogField, DialogFieldChoice, DialogFieldText, GenFormDialogComponent } from '@app/gen/widgets/gen-form-dialog/gen-form-dialog.component';
import { IStringDictionary } from '@app/utils/UtilsDictionary';

@Component({
  selector: 'app-npc-model-field-list-editor',
  templateUrl: './npc-model-field-list-editor.component.html',
  styleUrls: []
})
export class NpcModelFieldListEditorComponent implements OnInit {
  
  public name = 'Field model list editor for a model:';
  public model: NpcModelSheet;
  public unfilteredModelFields: NpcModelField[];
  public filteredModelFields: NpcModelField[];
  public selectedModelField: NpcModelField;
  public selectedModelFieldId: string;

  public filter = '';

  public modelFieldsObs: Observable<IStringDictionary<NpcModelField>>;

  constructor(public store: Store,
      public activatedRoute: ActivatedRoute,
      private router: Router,
      private dialog: MatDialog) {
    activatedRoute.queryParamMap.subscribe(queryParam => {
      this.selectedModelFieldId = decodeURI(queryParam.get('selectedModelFieldId'));
      this.refreshDisplay();
    });
    this.modelFieldsObs = this.store.select(state => {
      return state.world.world.modelContainer.modelFields
    });
  }

  ngOnInit() {
    this.modelFieldsObs.subscribe(modelFields => this.refreshData(modelFields));
  }

  public refreshData(modelFields: IStringDictionary<NpcModelField>) {
    this.unfilteredModelFields = Object.values(modelFields);
    this.refreshDisplay();
  }

  public refreshDisplay() {
    if (this.unfilteredModelFields == null) {
      return;
    }
    this.filteredModelFields = this.unfilteredModelFields;
    if (this.filter !== '') {
      this.filteredModelFields = this.filteredModelFields.filter(x => x.name.includes(this.filter))
    }
    if (this.selectedModelFieldId != null)
    {
      this.selectModelField(this.filteredModelFields.find(x => x.id === this.selectedModelFieldId));
    }
  }

  public setFilter($event) {
    this.filter = $event.srcElement.value;
    this.refreshDisplay();
  }

  public selectModelField(npcModelField: NpcModelField) {
    this.selectedModelField = npcModelField;
    if (npcModelField != null) {
      this.router.navigate(['npc-model-field-list-editor'], {queryParams: {selectedModelFieldId: encodeURI(this.selectedModelField.id)}});
    } else {
      this.router.navigate(['npc-model-field-list-editor']);
    }
  }

  public createModelField() {

    const availableFieldTypeStrings = ["NumbersInRange", "ModelSheets", "Labels"]; 
    const availableFieldTypes = [ FieldType.NumbersInRange, FieldType.ModelSheets, FieldType.Labels]; 

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      dialogFields: [
        new DialogFieldChoice("fieldType", availableFieldTypeStrings, availableFieldTypeStrings[0]),
        new DialogFieldText("label")
      ],
      dialogLabel: "create model field"
    };

    const dialogRef = this.dialog.open(GenFormDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: IStringDictionary<DialogField>) => {
      if (result == null) {
        return;
      }
      let fieldType = availableFieldTypes[availableFieldTypeStrings.findIndex(x => x === DialogFieldChoice.getValue(result["fieldType"]))];
      let label = DialogFieldText.getValue(result["label"]);
      // check on validity and unicity !

      let newModelField = new NpcModelField();
      newModelField.id = label;
      newModelField.fieldType= fieldType;
      
      if (this.unfilteredModelFields.find(x => x.id === label) != null) {
        alert("a model field with that name already exists");
        return;
      }

      this.store.dispatch(new CreateModelField({modelFieldContent: newModelField, id: label}));
    });
  }
  
  public changeName(modelField: NpcModelField, $event) {
    const label = $event.srcElement.value;
    if (this.unfilteredModelFields.find(x => x.id === label) != null) {
      alert("a model field with that name already exists");
      return;
    }
    let newModelField = new NpcModelField();
    newModelField.id = modelField.id;
    newModelField.name = label;
    this.store.dispatch(new ChangeModelField({modelField: newModelField}));
  }

  public deleteModelField(npcModelField: NpcModelField) {
    if (npcModelField === this.selectedModelField) {
      this.selectedModelField = undefined;
    }
    this.store.dispatch(new DeleteModelField(npcModelField));
  }
}
