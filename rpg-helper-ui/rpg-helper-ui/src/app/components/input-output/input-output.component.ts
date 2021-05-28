import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { CloneWorld, ImportWorld, LoadWorld, NewWorld, RenameWorld, SaveWorld } from '../../dal/store/npc-world.actions';
import { NpcWorldService } from '../../dal/db-service/npc-world.service';
import { NpcWorld } from '../../models/NpcWorld';

@Component({
  selector: 'app-input-output',
  templateUrl: './input-output.component.html',
  styleUrls: []
})
export class InputOutputComponent implements OnInit {

  public worldJson = '';
  public world: NpcWorld;

  public availableWorlds: string[];
  
  @ViewChild('jsonImportedText') jsonImportedText: any
  @ViewChild('selectLoadElement') selectLoadElement: any
  @ViewChild('newName') newName: any
  @ViewChild('rename') rename: any
  @ViewChild('cloneName') cloneName: any

  public worldObs: Observable<NpcWorld>;

  constructor(public store: Store,
    public npcWorldService: NpcWorldService) { 
    this.worldObs = this.store.select(state => {
      return state.world.world
    });
  }

  ngOnInit() {
    this.worldObs.subscribe(world => this.refreshData(world));
    this.refreshList();
  }

  public refreshData(world: NpcWorld) {
    this.world = world
    this.worldJson = this.npcWorldService.export(world, true)
  }

  public isNameOk(newName: string) {
    // check sur une regexp et sur la longueur
    let reg = new RegExp('[a-zA-Z][a-zA-Z0-9_]*')
    let result = reg.test(newName)
    if (result === false) {
      return "only numeric, alphanumeric and underscore characters are accepted"
    }

    // check sur une collision
    if (this.availableWorlds.find(x => x === newName) != null) {
      return "it's already in use"
    }
    return null;
  }
  
  public isNewHidden: boolean = true;
  public showHideNew() {
    this.isNewHidden = !this.isNewHidden 
  }
  public newWorld() {
    let name = this.newName.nativeElement.value
    let error = this.isNameOk(name);
    if (error != null) {
      alert("cannot use that name because: "+error);
    }
    this.store.dispatch(new NewWorld(name))
  }

  public isCloneHidden: boolean = true;
  public showHideClone() {
    this.isCloneHidden = !this.isCloneHidden 
  }
  public cloneWorld() {
    let name = this.cloneName.nativeElement.value
    let error = this.isNameOk(name);
    if (error != null) {
      alert("cannot use that name because: "+error);
    }
    this.store.dispatch(new CloneWorld(name))
  }

  public isRenameHidden: boolean = true;
  public showHideRename() {
    this.isRenameHidden = !this.isRenameHidden 
  }
  public changeName() {
    let name = this.rename.nativeElement.value
    let error = this.isNameOk(name);
    if (error != null) {
      alert("cannot use that name because: "+error);
    }
    this.store.dispatch(new RenameWorld(name))
  }

  public isImportFromStoreHidden: boolean = true;
  public showHideImportFromStore() {
    this.isImportFromStoreHidden = !this.isImportFromStoreHidden 
  }
  public loadWorldFromText() {
    this.store.dispatch(new ImportWorld(this.jsonImportedText.nativeElement.value))
  }

  public isImportFromTextHidden: boolean = true;
  public showHideImportFromText() {
    this.isImportFromTextHidden = !this.isImportFromTextHidden 
  }
  public refreshList() {
    this.npcWorldService.getWorldList().subscribe(x => this.availableWorlds = x);
  }
  public loadWorldFromStore() {
    if (this.selectLoadElement.value != null && this.selectLoadElement.value !== '') {
      this.store.dispatch(new LoadWorld(this.selectLoadElement.value))
    }
  }
}
