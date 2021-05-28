import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AddExternalWorld, ChangeModel, CreateModel, DeleteModel, RemoveExternalWorld } from '@app/dal/store/npc-world.actions';
import { NpcModelContainer, NpcModelSheet } from '@app/models/NpcModelSheet';
import { DialogField, DialogFieldText, GenFormDialogComponent } from '@app/gen/widgets/gen-form-dialog/gen-form-dialog.component';
import { IStringDictionary } from '@app/utils/UtilsDictionary';
import { NpcWorld } from '@app/models/NpcWorld';
import { NpcWorldService } from '@app/dal/db-service/npc-world.service';

@Component({
  selector: 'app-npc-world-editor',
  templateUrl: './npc-world-editor.component.html',
  styleUrls: []
})
export class NpcWorldEditorComponent implements OnInit {

  public filter = '';

  public world: NpcWorld;
  public worldObs: Observable<NpcWorld>;
  public availableWorlds: string[];

  @ViewChild('selectAddedExternalWorld') selectAddedExternalWorld: any

  constructor(public store: Store,
      public npcWorldService: NpcWorldService,
      private router: Router,
      private dialog: MatDialog) {
    this.worldObs = this.store.select(state => {
      return state.world.world
    });
  }

  ngOnInit() {
    this.worldObs.subscribe(world => this.refreshData(world));
  }

  public refreshData(world: NpcWorld) {
    this.world = world;
    this.refreshDisplay();
  }

  public refreshDisplay() {
    this.refreshAvailableExternalWorlds();
  }

  public refreshAvailableExternalWorlds() {
    this.npcWorldService.getWorldList().subscribe(x => this.availableWorlds = x
      .filter(worldName => worldName !== this.world.name
        && (this.world.externalWorlds == null || this.world.externalWorlds.find(y => y === worldName) == null)));
  }

  public addExternalWorld() {
    if (this.selectAddedExternalWorld.value != null && this.selectAddedExternalWorld.value !== '') {
      this.store.dispatch(new AddExternalWorld(this.selectAddedExternalWorld.value));
    }
  }

  public removeExternalWorld(removedExternalWorld: string) {
    this.store.dispatch(new RemoveExternalWorld(removedExternalWorld));
  }
}