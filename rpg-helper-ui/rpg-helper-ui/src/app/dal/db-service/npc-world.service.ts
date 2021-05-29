import { HttpClient } from '@angular/common/http';
import { Observable, from, of, forkJoin } from 'rxjs';
import { map, switchMap, mergeMap } from 'rxjs/operators';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, StorageService } from 'ngx-webstorage-service';
import { NpcWorld } from '../../models/NpcWorld';

const STORAGE_KEY = 'rpg-helper';



class WorldAndExternal {
    public constructor(public topWorld: NpcWorld,
      public externalWorld: NpcWorld) {}
}


@Injectable({
  providedIn: 'root'
})
export class NpcWorldService {

  public isAutoSave = true;
  constructor(private http: HttpClient,
              @Inject(SESSION_STORAGE) private storage: StorageService) {
  }

  private getUrl(worldName: string) {
    return "api/worlds/"+worldName;
  }

  // https://blog.danieleghidoli.it/2016/10/22/http-rxjs-observables-angular/

  public importFromUrl_sav(worldName: string, isChildren: boolean = false): Observable<NpcWorld> {
    // on fait un premier appel
    console.log("loading...")
    return this.http.get<NpcWorld>(this.getUrl(worldName))
      .pipe(
        map(world => {
          this.init(world);
          return world;
        }),
        switchMap((world: NpcWorld) => {
          if (world.externalWorlds != null && world.externalWorlds.length > 0) {
            return forkJoin(
              world.externalWorlds.map((externalWorldName: any) => {
                return this.importExternalWorld(world, externalWorldName)
              })
            );
          } else {
            let result = new Array();
            result.push(world)
            return of(result)
          }
        }),
        map((worlds: NpcWorld[]) => 
        worlds[0])
      )
    }
  
  private importExternalWorld(topWorld: NpcWorld, externalWorldName: string) {
    return this.http.get<NpcWorld>(this.getUrl(externalWorldName)).pipe(
      map((externalWorld: NpcWorld) => {
        if (topWorld.nosave_loadedExternalWorldNames.find(x => x === externalWorldName) == null) {
          Object.values(externalWorld.modelContainer.modelSheets).forEach(modelSheet => {
            modelSheet.isExternal = true
            modelSheet.name = externalWorld.name + "." + modelSheet.name
            topWorld.modelContainer.modelSheets[modelSheet.id] = modelSheet
          });
          Object.values(externalWorld.modelContainer.modelFields).forEach(modelField => {
            modelField.isExternal = true
            modelField.name = externalWorld.name + "." + modelField.name
            topWorld.modelContainer.modelFields[modelField.id] = modelField
          });
          
          Object.values(externalWorld.modelContainer.modelInstFields).forEach(modelInstField => {
            modelInstField.isExternal = true
            topWorld.modelContainer.modelInstFields[modelInstField.id] = modelInstField
          });
        }
        return new WorldAndExternal(topWorld, externalWorld);
      }),
      switchMap((worldAndExternal: WorldAndExternal) => {
        if (topWorld.nosave_loadedExternalWorldNames.find(x => x === externalWorldName) == null) {
          topWorld.nosave_loadedExternalWorldNames.push(externalWorldName)
          if (worldAndExternal.externalWorld.externalWorlds != null && worldAndExternal.externalWorld.externalWorlds.length > 0) {
            return forkJoin(
              worldAndExternal.externalWorld.externalWorlds.map((externalWorldName: any) => {
                return this.importExternalWorld(worldAndExternal.topWorld, externalWorldName)
              })
            );
          }
        }
        let result = new Array();
        result.push(worldAndExternal.topWorld)
        return of(result)
      }),
      map((worlds: NpcWorld[]) =>
       worlds[0])
    )
  }
  
  public importFromUrl(worldName: string): Observable<NpcWorld> {
    console.log("loading...")
    return this.loadingDependencies(() => this.http.get<NpcWorld>(this.getUrl(worldName)))
  }

  public reloadingDependencies(world: NpcWorld): Observable<NpcWorld> {
    console.log("reloading dependencies...")

    return this.importFromJson(this.export(world, true))
  }

  public importFromJson(json: string): Observable<NpcWorld> {
    console.log("load from json...")
    if (json == null) {
      return undefined;
    }
    let world = JSON.parse(json) as NpcWorld
    this.init(world);


    return this.loadingDependencies(() => of(world))
  }

  public loadingDependencies(fetchWorld: () => Observable<NpcWorld>): Observable<NpcWorld> {
    // on fait un premier appel
    return fetchWorld()
      .pipe(
        map(world => {
          this.init(world);
          return world;
        }),
        switchMap((world: NpcWorld) => {
          if (world.externalWorlds != null && world.externalWorlds.length > 0) {
            return forkJoin(
              world.externalWorlds.map((externalWorldName: any) => {
                return this.importExternalWorld(world, externalWorldName)
              })
            );
          } else {
            let result = new Array();
            result.push(world)
            return of(result)
          }
        }),
        map((worlds: NpcWorld[]) => 
        worlds[0])
      )
    }

  public storeInUrl(world: NpcWorld): Observable<NpcWorld> {
    return this.http.post<NpcWorld>(this.getUrl(world.name), world);
  }

  public getWorldList(): Observable<string[]> {
    return this.http.get<string[]>("api/worlds");
  }

  public importFromLocalStorage(worldName: string = null): Observable<NpcWorld> {
    if (worldName == null) {
      worldName = this.storage.get(this.getStorageKeyForDefaultWorld())
    }
    return this.importFromJson(this.storage.get(this.getStorageKey(worldName)));
  }
  
  private removeExternal(key: string, value) {
    // Filtering out properties
    if ((value != null && value['isExternal'] === true)
        || key.startsWith("nosave_") === true) {
      return undefined;
    }
    return value;
  }
  
  public export(world: NpcWorld, areExternalRemoved: boolean): string {
    // on extrait les modelXXX des mondes associes
    if (areExternalRemoved)
      return JSON.stringify(world, this.removeExternal)
    else 
      return JSON.stringify(world)
  }

  public storeInLocalStorage(world: NpcWorld) {
    let json = this.export(world, false);
    this.storage.set(this.getStorageKey(world.name), json);
    this.storage.set(this.getStorageKeyForDefaultWorld(), world.name);

    if (this.isAutoSave) {
      json = this.export(world, true);
      this.storeInUrl(world).subscribe(x => console.log("save occurred"),
      x => alert("error when saving"));
    }
  }

  private getStorageKey(worldName: string) {
    return STORAGE_KEY + '__' + worldName;
  }
  private getStorageKeyForDefaultWorld() {
    return STORAGE_KEY + '_Default';
  }

  private init(world: NpcWorld) {
    this.storeInLocalStorage(world);
    world.nosave_loadedExternalWorldNames = [world.name]
  }

  public switchAutoSave() {
    this.isAutoSave = !this.isAutoSave;
  }
}
