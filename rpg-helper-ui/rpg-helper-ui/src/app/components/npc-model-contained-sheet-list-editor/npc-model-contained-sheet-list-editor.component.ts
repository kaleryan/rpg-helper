import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { NpcWorldResolverService } from '@app/dal/db-service/npc-world-resolver.service';
import { ChangeModel } from '@app/dal/store/npc-world.actions';
import { NpcModelSheet, NpcModelContainer } from '@app/models/NpcModelSheet';
import { DialogField, DialogFieldChoice, GenFormDialogComponent } from '@app/gen/widgets/gen-form-dialog/gen-form-dialog.component';
import { IStringDictionary } from '@app/utils/UtilsDictionary';
import { UtilsRef } from '@app/utils/UtilsRef';

@Component({
  selector: 'app-npc-model-contained-sheet-list-editor',
  templateUrl: './npc-model-contained-sheet-list-editor.component.html',
  styleUrls: []
})
export class NpcModelContainedSheetListEditorComponent implements OnInit {

  @Input('modelSheetId')
  set refreshOnModelId(modelSheetId : string) {
    this.modelSheetId = modelSheetId;
    this.refreshData(this.modelContainer);
  }
  public modelSheetId: string;
  public modelContainer: NpcModelContainer;
  public modelSheet: NpcModelSheet;
  public availableModelSheets: NpcModelSheet[];
  public containedSheets: NpcModelSheet[];

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
    this.modelSheet = modelContainer.modelSheets[this.modelSheetId]
    if (this.modelSheet.modelSheet_containedSheets == null) {
      this.containedSheets = []
      this.availableModelSheets = Object.values(modelContainer.modelSheets)
        .filter(x => x.id !== this.modelSheetId) // TODO en verifiant l'inclusion recursivement?
    } else {
      this.containedSheets = this.modelSheet.modelSheet_containedSheets
        .map((id: UtilsRef) => this.worldResolverService.get<NpcModelSheet>(id));
      this.availableModelSheets = Object.values(modelContainer.modelSheets)
        .filter(x => x.id !== this.modelSheetId && this.modelSheet.modelSheet_containedSheets.find(y => y.id === x.id) == null) // TODO en verifiant l'inclusion recursivement?
    }
    this.refreshDisplay();
  }

  public refreshDisplay() {
  }

  public addModelSheet() {
    if (this.availableModelSheets.length === 0) {
      alert("no modelsheet available");
      return;
    }
    if (this.modelSheet == null) {
      return;
    }
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      dialogFields: [
        new DialogFieldChoice("modelSheet", this.availableModelSheets.map(x => x.name), this.availableModelSheets[0].name)
      ],
      dialogLabel: "add contained modelSheet"
    };

    const dialogRef = this.dialog.open(GenFormDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: IStringDictionary<DialogField>) => {
      if (result == null) {
        return;
      }
      let addedModelSheet = this.availableModelSheets.find(x => x.name === DialogFieldChoice.getValue(result["modelSheet"]));

      let updatedModelSheet = NpcModelSheet.createPatch(this.modelSheet);
      updatedModelSheet.modelSheet_containedSheets = []
      if (this.modelSheet.modelSheet_containedSheets != null) {
        updatedModelSheet.modelSheet_containedSheets = this.modelSheet.modelSheet_containedSheets.map(x => x)
      }

      updatedModelSheet.modelSheet_containedSheets.push(new UtilsRef(addedModelSheet.id, NpcModelSheet.TYPE))

      this.store.dispatch(new ChangeModel({model: updatedModelSheet}));
    });
  }
  
  public removeModelSheet(modelSheet: NpcModelSheet) {
    let updatedModelSheet = NpcModelSheet.createPatch(this.modelSheet);
      updatedModelSheet.modelSheet_containedSheets = this.modelSheet.modelSheet_containedSheets.filter(x => x.id !== modelSheet.id)

    this.store.dispatch(new ChangeModel({model: updatedModelSheet}));
  }

  public goToModelSheet(modelSheetId: string) {
    let updatedModelSheet = NpcModelSheet.createPatch(this.modelSheet);
      updatedModelSheet.modelSheet_containedSheets = this.modelSheet.modelSheet_containedSheets.filter(x => x.id !== modelSheetId)

    this.store.dispatch(new ChangeModel({model: updatedModelSheet}));
  }
}
