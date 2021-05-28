import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { NpcModelEditorService } from '@app/dal/db-service/npc-model-editor.service';
import { ChangeModel } from '@app/dal/store/npc-world.actions';
import { NpcModelSheet } from '@app/models/NpcModelSheet';
import { IStringDictionary } from '@app/utils/UtilsDictionary';
import { UtilsRef } from '@app/utils/UtilsRef';
import { UtilsLabelledItem } from '@app/utils/UtilsLabelledItem';
import { NpcWorldResolverService } from '@app/dal/db-service/npc-world-resolver.service';

@Component({
  selector: 'app-npc-model-sheet-editor',
  templateUrl: './npc-model-sheet-editor.component.html',
  styleUrls: []
})
export class NpcModelSheetEditorComponent implements OnInit {

  public name = 'Model editor:';

  @Input('modelId')
  set refreshOnModelId(modelId : string) {
    this.modelId = modelId;
    this.refreshData(this.modelSheets);
  }

  public modelSheets: IStringDictionary<NpcModelSheet>;
  public modelId: string;
  public model: NpcModelSheet;
  public modelObs: Observable<IStringDictionary<NpcModelSheet>>;
  public availableModelParents: NpcModelSheet[];

  constructor(public store: Store,
    private modelEditorService: NpcModelEditorService,
    private worldResolverService: NpcWorldResolverService) { 
    this.modelObs = this.store.select(state => {
      return state.world.world.modelContainer.modelSheets
    });
  }

  ngOnInit() {
    this.modelObs.subscribe(world => this.refreshData(world));
  }

  public refreshData(modelSheets: IStringDictionary<NpcModelSheet>) {
    if (modelSheets == null) {
      return;
    }
    this.modelSheets = modelSheets;
    this.model = modelSheets[this.modelId];
    let that = this;
    this.availableModelParents = Object.values(modelSheets)
      .filter((currentModel: NpcModelSheet) => {
        if (currentModel === that.model) {
          return false;
        }
        let parents = that.modelEditorService.getparents(currentModel);
        return parents.find(x => x === that.model) == null;
      });

    this.refreshDisplay();
  }

  public refreshDisplay() {
  }

  public getModelParentInit() {
    if (this.model.modelSheet_Parent != null) {
      return this.model.modelSheet_Parent.id
    }
    return undefined;
  }

  public changeId($event) {
    let model = NpcModelSheet.createPatch(this.model);
    model.name = $event.srcElement.value;
    this.store.dispatch(new ChangeModel({model: model}));
  }
  
  public changeDesc($event) {
    let model = NpcModelSheet.createPatch(this.model);
    model.desc = $event.srcElement.value;
    this.store.dispatch(new ChangeModel({model: model}));
  }
  
  public changeModelParent($event) {
    let model = NpcModelSheet.createPatch(this.model);
    model.modelSheet_Parent = new UtilsRef($event.value, NpcModelSheet.TYPE);
    this.store.dispatch(new ChangeModel({model: model}));
  }
}

