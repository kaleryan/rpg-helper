import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { NpcWorld } from '../../models/NpcWorld';
import { Store } from '@ngxs/store';
import { UtilsRef } from '../../utils/UtilsRef';
import { NpcModelInstField, NpcModelSheet } from '../../models/NpcModelSheet';
import { NpcModelField, FieldType } from '../../models/NpcModelField';
import { NpcWorldState } from '../store/npc-world.state';
import { NpcRealField, NpcRealSheet, NpcRealContainer } from '../../models/NpcRealSheet';
import { UtilsLabelledItem } from '../../utils/UtilsLabelledItem';

@Injectable({
  providedIn: 'root'
})
export class NpcWorldResolverService {


  constructor(private store: Store) {
  }

// attention, circular dependency: pas de conséquence visible
// si on fait avec le setWorld, celui intervient après l'update du world, et les premiers appels aux resolvers sur les nouveaux objets échouent...

  // public world: NpcWorld;
  // public setWorld(world: NpcWorld) {
  //   this.world = world;
  // }

  public get<TType>(ref: UtilsRef): TType {
    return this.getUi(ref) as TType;
  }
  
  public getUi(ref: any): any {
    let world = this.store.selectSnapshot(NpcWorldState.getWorld)
      if (ref.refType === NpcModelInstField.TYPE) {
        return world.modelContainer.modelInstFields[ref.id];
      } else if (ref.refType === NpcModelField.TYPE) {
        return world.modelContainer.modelFields[ref.id];
      } else if (ref.refType === NpcModelSheet.TYPE) {
        return world.modelContainer.modelSheets[ref.id];
      } else if (ref.refType === NpcRealSheet.TYPE) {
        return world.realContainer.realSheetsById[ref.id];
      }
      return undefined;
  }

  public getModelInstField(realField: NpcRealField) {
    if (realField.customModel != null) {
      return realField.customModel;
    } else {
      return this.get<NpcModelInstField>(realField.modelInstField);
    }
  }

  
  public getSelectedValues(realField: NpcRealField, realContainer: NpcRealContainer): UtilsLabelledItem<string>[] {
    const modelInstField = this.getModelInstField(realField);
    const modelField = this.get<NpcModelField>(modelInstField.modelField);

    if (modelField.fieldType !== FieldType.ModelSheets) {
      return realField.selectedValues.map(value => new UtilsLabelledItem<string>(value, value));
    }
    
    return realField.selectedValues.map(value => {
      const realSheet = realContainer.realSheetsById[value];
      return new UtilsLabelledItem<string>(realSheet.name, value)
    });
  }
}
