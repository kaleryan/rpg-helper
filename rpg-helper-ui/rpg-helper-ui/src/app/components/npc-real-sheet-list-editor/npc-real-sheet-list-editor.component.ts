import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { CreateRealSheet, DeleteRealSheet, RenameRealSheet } from '@app/dal/store/npc-world.actions';
import { NpcWorldState } from '@app/dal/store/npc-world.state';
import { NpcRealSheet } from '@app/models/NpcRealSheet';
import { NpcModelSheet } from '@app/models/NpcModelSheet';
import { NpcWorld } from '@app/models/NpcWorld';
import { DialogField, DialogFieldChoice, DialogFieldText, GenFormDialogComponent } from '@app/gen/widgets/gen-form-dialog/gen-form-dialog.component';
import { IStringDictionary } from '@app/utils/UtilsDictionary';
import { Route } from '@angular/compiler/src/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NpcModelEditorService } from '@app/dal/db-service/npc-model-editor.service';
import { NpcWorldResolverService } from '@app/dal/db-service/npc-world-resolver.service';

@Component({
  selector: 'app-npc-real-sheet-list-editor',
  templateUrl: './npc-real-sheet-list-editor.component.html',
  styleUrls: []
})
export class NpcRealSheetListEditorComponent implements OnInit {

  public name = 'Real Sheets';
  public unfilteredRealSheets: NpcRealSheet[];
  public filteredRealSheets: NpcRealSheet[];
  public selectedRealSheet: NpcRealSheet;
  public selectedRealSheetId: string;
  public isPreview: boolean;
  public availableModelSheets: NpcModelSheet[];

  public filter = '';
  public filterModel: NpcModelSheet;

  public worldObs: Observable<NpcWorld>;

  constructor(public store: Store,
      private dialog: MatDialog,
      private activatedRoute: ActivatedRoute,
      private modelEditorService: NpcModelEditorService,
      private worldResolverService: NpcWorldResolverService,
      private router: Router) {
    activatedRoute.queryParamMap.subscribe(queryParam => {
      this.selectedRealSheetId = decodeURI(queryParam.get('selectedRealSheetId'));
      this.isPreview = decodeURI(queryParam.get('isPreview')) === "true";
      this.refreshDisplay();
    });
    this.worldObs = this.store.select(state => {
      return state.world.world
    });
  }

  ngOnInit() {
    this.worldObs.subscribe(world => this.refreshData(world));
  }

  public refreshData(world: NpcWorld) {
    this.unfilteredRealSheets = Object.values(world.realContainer.realSheetsById);
    this.availableModelSheets = Object.values(this.store.selectSnapshot(NpcWorldState.getWorld).modelContainer.modelSheets);

    this.refreshDisplay();
  }

  public refreshDisplay() {
    if (this.unfilteredRealSheets == null) {
      return;
    }
    this.filteredRealSheets = this.unfilteredRealSheets;
    if (this.filter !== '') {
      this.filteredRealSheets = this.filteredRealSheets.filter(x => x.name.includes(this.filter))
    }
    if (this.filterModel != null) {
      this.filteredRealSheets = this.filteredRealSheets.filter(x => {
        let modelSheet = this.worldResolverService.get<NpcModelSheet>(x.modelSheet);
        if (modelSheet === this.filterModel) {
          return true;
        }
        return (this.modelEditorService.getparents(modelSheet).includes(this.filterModel));
      });
    }
    if (this.selectedRealSheetId != null)
    {
      this.selectRealSheet(this.filteredRealSheets.find(x => x.id === this.selectedRealSheetId), this.isPreview);
    }
  }

  public setFilter($event) {
    this.filter = $event.srcElement.value;
    this.refreshDisplay();
  }
  
  public setModelFilter($event) {
    this.filterModel = $event.value;
    this.refreshDisplay();
  }

  public getfilterModelId() {
    if (this.filterModel == null) {
      return '';
    }
    return this.filterModel.name;
  }

  public getModelsForFilter(): NpcModelSheet[] {
    return Object.values(this.store.selectSnapshot(NpcWorldState.getWorld).modelContainer.modelSheets);
  }

  public selectRealSheet(npcRealSheet: NpcRealSheet, isPreview: boolean) {
    this.selectedRealSheet = npcRealSheet;
    this.isPreview = isPreview;
    if (npcRealSheet != null) {

// finir migration vers les

      this.router.navigate(['npc-real-sheet-list-editor'], {queryParams: {selectedRealSheetId: encodeURI(this.selectedRealSheet.id), isPreview: this.isPreview ? 'true' : 'false'}});
    } else {
      this.router.navigate(['npc-real-sheet-list-editor']);
    }
  }

  public addRealSheet() {
    if (this.availableModelSheets.length === 0) {
      alert("create a model first");
      return;
    }
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      dialogFields: [
        new DialogFieldChoice("model", this.availableModelSheets.map(x => x.name), this.availableModelSheets[0].name),
        new DialogFieldText("label")
      ],
      dialogLabel: "add new Npc"
    };

    const dialogRef = this.dialog.open(GenFormDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: IStringDictionary<DialogField>) => {
      if (result == null) {
        return;
      }
      let model = this.availableModelSheets.find(x => x.name === DialogFieldChoice.getValue(result["model"]));
      let label = DialogFieldText.getValue(result["label"]);
      if (label === '')
      {
        label = model.id
      }
      if (this.unfilteredRealSheets.find(x => x.id === label) != null) {
        alert("a real sheet with that name already exists");
        return;
      }
      this.store.dispatch(new CreateRealSheet({label: label, model: model.id}));
    });
  }

  public changeId(npcRealSheet: NpcRealSheet, $event) {
    const label = $event.srcElement.value;
    if (this.unfilteredRealSheets.find(x => x.id === label) != null) {
      alert("a real sheet with that name already exists");
      return;
    }
    let newRealSheet = new NpcRealSheet();
    newRealSheet.id = npcRealSheet.id;
    newRealSheet.name = label;
    this.store.dispatch(new RenameRealSheet({oldName: npcRealSheet.name, realSheet: newRealSheet}));
  }

  public deleteRealSheet(npcRealSheet: NpcRealSheet) {
    if (npcRealSheet === this.selectedRealSheet) {
      this.selectedRealSheet = undefined;
    }
    this.store.dispatch(new DeleteRealSheet(npcRealSheet));
  }

  public isListVisible = true;
  public switchListVisibility() {
    this.isListVisible = !this.isListVisible;
  }

  public getModelSheet(realSheet: NpcRealSheet) {
    return this.worldResolverService.get<NpcModelSheet>(realSheet.modelSheet);
  }
}