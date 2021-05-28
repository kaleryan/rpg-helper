import { Injectable } from '@angular/core';
import { NpcModelInstField, NpcModelSheet } from '../../models/NpcModelSheet';
import { IStringDictionary } from '../../utils/UtilsDictionary';
import { NpcWorldResolverService } from './npc-world-resolver.service';
import { UtilsLabelledItem } from '../../utils/UtilsLabelledItem';

@Injectable({
  providedIn: 'root'
})
export class NpcModelEditorService {

  private parentsPerModel: IStringDictionary<NpcModelSheet[]>

  constructor(private worldResolverService: NpcWorldResolverService) {
    this.parentsPerModel = {};
  }

  public refreshCache() {
    this.parentsPerModel = {};
  }

  public getparents(model: NpcModelSheet, includingThis: boolean = false) {
    if (this.parentsPerModel[model.id] == null) {
      this.parentsPerModel[model.id] = [];
      for (let parent = model.modelSheet_Parent != null ? this.worldResolverService.get<NpcModelSheet>(model.modelSheet_Parent) : null;
          parent != null;
          parent = parent.modelSheet_Parent != null ? this.worldResolverService.get<NpcModelSheet>(parent.modelSheet_Parent) : null) {
        this.parentsPerModel[model.id].unshift(parent)
        // on peut optimiser avec une methode recursive
      }
    }
    if (includingThis) {
      return this.parentsPerModel[model.id].concat([model]);
    }
    return this.parentsPerModel[model.id];
  }

  public getContainedSheets(model: NpcModelSheet) {
    let result = []
    let newSheets = [model];

    while (newSheets != null) {
      let nextNewSheets = null;

      newSheets.forEach(x => {
        let containedSheets = x.modelSheet_containedSheets;
        if (containedSheets != null && containedSheets.length !== 0) {
          if (nextNewSheets == null) {
            nextNewSheets = []
          }
          containedSheets.forEach(y => {
            if (result.find(z => z.id == y.id) == null) {
              let sheet = this.worldResolverService.get<NpcModelSheet>(y);
              nextNewSheets.push(sheet)
              result.push(sheet)
            }
          })
        }
      })

      newSheets = nextNewSheets;
    }
    return result;
  }

  public getAllLabelledModelInstFields(model: NpcModelSheet): UtilsLabelledItem<any>[] {
    const parents = this.getparents(model, true);
    const result = [];
    parents.forEach((model: NpcModelSheet) => {
      for (let modelFieldKey in model.modelInstFields) {
        result.push(new UtilsLabelledItem<any>(modelFieldKey,
          {modelInstField: this.worldResolverService.get<NpcModelInstField>(model.modelInstFields[modelFieldKey]), modelSheet: model}));
      }
    })

    const containedSheets = this.getContainedSheets(model);
    containedSheets.forEach((model: NpcModelSheet) => {
      for (let modelFieldKey in model.modelInstFields) {
        result.push(new UtilsLabelledItem<any>(modelFieldKey,
          {modelInstField: this.worldResolverService.get<NpcModelInstField>(model.modelInstFields[modelFieldKey]), modelSheet: model}));
      }
    })
    return result;
  }
}
