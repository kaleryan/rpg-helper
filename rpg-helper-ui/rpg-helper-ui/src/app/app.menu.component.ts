import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { LoadWorldFromLocalStorage, SaveWorld } from './dal/store/npc-world.actions';
import { NpcWorldService } from './dal/db-service/npc-world.service';
import { NpcWorld } from './models/NpcWorld';


@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html',
  styleUrls: ['./app.menu.component.css'],
})
export class AppMenuComponent implements OnInit {
  title = 'rpg-helper';

  public worldName: string = "RpgHelper";
  
  public worldObs: Observable<NpcWorld>;
  public isAutoSave = true;

  constructor(public store: Store,
    public worldService: NpcWorldService) {
    this.worldObs = this.store.select(state => {
      return state.world.world
    });
   }

  ngOnInit() {
    this.store.dispatch(new LoadWorldFromLocalStorage("dummy"));

    this.worldObs.subscribe(world => this.refreshData(world));
    // if (this.npcWorldService.world) {
    //   this.worldName = this.npcWorldService.world.name;
    // }
    // this.npcWorldService.onChangeGenerate().subscribe(world => {
    //   this.worldName = world.name;
    // });
  }

  
  public refreshData(world: NpcWorld) {
    this.worldName = world.name
  }
  
  public saveWorld() {
    this.store.dispatch(new SaveWorld("dummy"))
  }

  public onSwitchAutoSave() {
    this.isAutoSave = !this.isAutoSave;
    this.worldService.switchAutoSave();
  }
}
