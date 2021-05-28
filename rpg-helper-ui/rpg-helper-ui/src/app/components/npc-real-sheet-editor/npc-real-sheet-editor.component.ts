import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ChangeRealSheet, RenameRealSheet } from '@app/dal/store/npc-world.actions';
import { NpcWorldState } from '@app/dal/store/npc-world.state';
import { NpcRealSheet } from '@app/models/NpcRealSheet';
import { NpcModelField } from '@app/models/NpcModelField';
import { IStringDictionary } from '@app/utils/UtilsDictionary';
import { NpcModelSheet } from '@app/models/NpcModelSheet';
import { NpcWorldResolverService } from '@app/dal/db-service/npc-world-resolver.service';

@Component({
  selector: 'app-npc-real-sheet-editor',
  templateUrl: './npc-real-sheet-editor.component.html',
  styleUrls: []
})
export class NpcRealSheetEditorComponent implements OnInit {

  public name = 'RealSheet editor:';

  @Input('realSheetId')
  set refreshOnRealSheetId(realSheetId : string) {
    this.realSheetId = realSheetId;
    this.refreshData(this.realSheets);
  }

  public realSheets: IStringDictionary<NpcRealSheet>;
  public realSheetId: string;
  public realSheet: NpcRealSheet;
  public modelSheet: NpcModelSheet;
  public realSheetObs: Observable<IStringDictionary<NpcRealSheet>>;
  public availableModelFields: NpcModelField[];

  constructor(public store: Store,
    private worldResolverService: NpcWorldResolverService) { 
    this.realSheetObs = this.store.select(state => {
      return state.world.world.realContainer.realSheetsById
    });
  }

  ngOnInit() {
    this.realSheetObs.subscribe(world => this.refreshData(world));
  }

  public refreshData(realSheets: IStringDictionary<NpcRealSheet>) {
    if (realSheets == null) {
      return;
    }
    this.realSheets = realSheets;
    this.realSheet = realSheets[this.realSheetId];
    this.modelSheet = this.worldResolverService.get<NpcModelSheet>(this.realSheet.modelSheet);
  
    this.availableModelFields = Object.values(this.store.selectSnapshot(NpcWorldState.getWorld).modelContainer.modelFields);

    this.refreshDisplay();
  }

  public refreshDisplay() {
  }

  public changeId($event) {
    let newRealSheet = new NpcRealSheet();
    newRealSheet.id = this.realSheet.id;
    newRealSheet.name = $event.srcElement.value;
    this.store.dispatch(new RenameRealSheet({oldName: this.realSheet.name, realSheet: newRealSheet}));
  }
  
  public changeDesc($event) {
    let realSheet = new NpcRealSheet();
    realSheet.id = this.realSheet.id;
    realSheet.desc = $event.srcElement.value;
    this.store.dispatch(new ChangeRealSheet({realSheet: realSheet}));
  }
}

