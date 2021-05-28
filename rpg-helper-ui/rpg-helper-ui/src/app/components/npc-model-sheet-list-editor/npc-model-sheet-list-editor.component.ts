import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ChangeModel, CreateModel, DeleteModel } from '@app/dal/store/npc-world.actions';
import { NpcModelContainer, NpcModelSheet } from '@app/models/NpcModelSheet';
import { DialogField, DialogFieldText, GenFormDialogComponent } from '@app/gen/widgets/gen-form-dialog/gen-form-dialog.component';
import { IStringDictionary } from '@app/utils/UtilsDictionary';

@Component({
  selector: 'app-npc-model-sheet-list-editor',
  templateUrl: './npc-model-sheet-list-editor.component.html',
  styleUrls: []
})
export class NpcModelSheetListEditorComponent implements OnInit {

  public name = 'Model list editor:';
  public unfilteredModels: NpcModelSheet[];
  public filteredModels: NpcModelSheet[];
  public selectedModel: NpcModelSheet;
  public selectedModelId: string;

  public filter = '';

  public worldObs: Observable<NpcModelContainer>;

  constructor(public store: Store,
      private activatedRoute: ActivatedRoute,
      private router: Router,
      private dialog: MatDialog) { 
    activatedRoute.queryParamMap.subscribe(queryParam => {
      this.selectedModelId = decodeURI(queryParam.get('selectedModelId'));
      this.refreshDisplay();
    });
    this.worldObs = this.store.select(state => {
      return state.world.world.modelContainer
    });
  }

  ngOnInit() {
    this.worldObs.subscribe(modelContainer => this.refreshData(modelContainer));
  }

  public refreshData(modelContainer: NpcModelContainer) {
    this.unfilteredModels = Object.values(modelContainer.modelSheets);
    this.refreshDisplay();
  }

  public refreshDisplay() {
    if (this.unfilteredModels == null) {
      return;
    }
    this.filteredModels = this.unfilteredModels;
    if (this.filter !== '') {
      this.filteredModels = this.filteredModels.filter(x => x.id.includes(this.filter))
    }
    if (this.selectedModelId != null)
    {
      this.selectModel(this.filteredModels.find(x => x.id === this.selectedModelId));
    }
  }

  public setFilter($event) {
    this.filter = $event.srcElement.value;
    this.refreshDisplay();
  }

  public selectModel(npcModel: NpcModelSheet) {
    this.selectedModel = npcModel;
    if (npcModel != null) {
      this.router.navigate(['npc-model-sheet-list-editor'], {queryParams: {selectedModelId: encodeURI(this.selectedModel.id)}});
    } else {
      this.router.navigate(['npc-model-sheet-list-editor']);
    }
  }

  
  public addModel() {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      dialogFields: [
        new DialogFieldText("label")
      ],
      dialogLabel: "create model field"
    };

    const dialogRef = this.dialog.open(GenFormDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: IStringDictionary<DialogField>) => {
      if (result == null) {
        return;
      }
      let label = DialogFieldText.getValue(result["label"]);
      // check on validity and unicity !

      if (this.unfilteredModels.find(x => x.id === label) != null) {
        alert("a model sheet with that name already exists");
        return;
      }
      
      this.store.dispatch(new CreateModel(label));
    });
  }
  
  public changeId(npcModel: NpcModelSheet, $event) {
    const label = $event.srcElement.value;
    if (this.unfilteredModels.find(x => x.id === label) != null) {
      alert("a model sheet with that name already exists");
      return;
    }
    let model = NpcModelSheet.createPatch(npcModel);
    model.name = label;
    this.store.dispatch(new ChangeModel({model: model}));
  }

  public deleteModel(npcModel: NpcModelSheet) {
    if (npcModel === this.selectedModel) {
      this.selectedModel = undefined;
    }
    this.store.dispatch(new DeleteModel(npcModel));
  }
}