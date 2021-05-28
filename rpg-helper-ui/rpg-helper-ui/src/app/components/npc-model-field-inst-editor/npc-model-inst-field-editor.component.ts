import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ChangeModelInstField } from '@app/dal/store/npc-world.actions';
import { NpcModelInstField, NpcModelContainer } from '@app/models/NpcModelSheet';
import { NpcWorldResolverService } from '@app/dal/db-service/npc-world-resolver.service';

@Component({
  selector: 'app-npc-model-inst-field-editor',
  templateUrl: './npc-model-inst-field-editor.component.html',
  styleUrls: []
})
export class NpcModelInstFieldEditorComponent implements OnInit {

  @Input('modelInstField')
  set refreshOnModelInstFieldId(modelInstField : NpcModelInstField) {
    this.modelInstField = modelInstField;
    this.refreshData(this.modelContainer);
  }

  @Input() realSheet = undefined;
  @Input() realFieldId = undefined;

  public modelContainer: NpcModelContainer;
  public modelInstField: NpcModelInstField;

  public modelContainerObs: Observable<NpcModelContainer>;

  constructor(public store: Store,
    public wr: NpcWorldResolverService) {
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
    this.refreshDisplay();
  }

  public refreshDisplay() {
  }
  
  public changeMaxCount($event) {
    let modelInstField = new NpcModelInstField()
    modelInstField.maxCount = parseInt($event);
    this.store.dispatch(new ChangeModelInstField({id: this.modelInstField.id, modelInstField: modelInstField, realSheet: this.realSheet, realFieldId: this.realFieldId}));
  }
  
  public changeMeanCount($event) {
    let modelInstField = new NpcModelInstField()
    modelInstField.meanCount = parseInt($event);
    this.store.dispatch(new ChangeModelInstField({id: this.modelInstField.id, modelInstField: modelInstField, realSheet: this.realSheet, realFieldId: this.realFieldId}));
  }
  
  public changeUnicity($event) {
    let modelInstField = new NpcModelInstField()
    modelInstField.unicityInValues = $event;
    this.store.dispatch(new ChangeModelInstField({id: this.modelInstField.id, modelInstField: modelInstField, realSheet: this.realSheet, realFieldId: this.realFieldId}));
  }
}
