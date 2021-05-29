import { Injectable } from '@angular/core';
import { NpcRealSheet, NpcRealField } from '../../models/NpcRealSheet';
import { FieldType, NpcFieldValueModel, NpcModelField } from '../../models/NpcModelField';
import { NpcModelInstField, NpcModelSheet } from '../../models/NpcModelSheet';
import { NpcWorldResolverService } from './npc-world-resolver.service';
import { NpcModelEditorService } from './npc-model-editor.service';
import { NpcWorldState } from '../store/npc-world.state';
import { Store } from '@ngxs/store';
import { IStringDictionary } from '../../utils/UtilsDictionary';
import { UtilsLabelledItem } from '../../utils/UtilsLabelledItem';
import { NpcRealSheetEditorService } from './npc-real-sheet-editor.service';
import { UpdateRealFieldValue, ChangeRealField } from '../store/npc-world.actions';

@Injectable({
  providedIn: 'root'
})
export class NpcGeneratorService {

  constructor(private worldResolverService: NpcWorldResolverService,
    private modelEditorService: NpcModelEditorService,
    private realSheetEditor: NpcRealSheetEditorService,
    private store: Store) {
  }

  // on renvoie la liste des champs à ajouter/effacer et des modifications sur les champs
  public dispatchRerollSheet(realSheet: NpcRealSheet, realFields: NpcRealField[], isOverwriting: boolean) {
    let newFields = realFields;

    while (true) {
      let nextFields: NpcRealField[] = [];
      let removedFields = new Set();

      for (let realFieldKey in newFields) {
        const realField = newFields[realFieldKey];
        if (!removedFields.has(realField.id)
          && (isOverwriting || realField.selectedValues.length === 0)) {
          let values = this.rerollRealField(realField);


          let updatedFields = this.realSheetEditor.dispatchUpdateRealFieldValueAction(realSheet, realField, values);

          nextFields = nextFields.concat(updatedFields.addedRealFields);
          updatedFields.removedRealFields.forEach(field => removedFields.add(field));
        }
      }

      newFields = nextFields;
      if (newFields.length == 0) {
        break;
      }
    }
  }

  public rerollRealField(realField: NpcRealField, proposedValues: NpcFieldValueModel[] = undefined,
    modelInstField: NpcModelInstField = undefined, modelField: NpcModelField = undefined): string[] {

    if (modelInstField == null) {
      modelInstField = this.worldResolverService.getModelInstField(realField);
    }
    if (modelField == null) {
      modelField = this.worldResolverService.get<NpcModelField>(modelInstField.modelField);
    }
    if (proposedValues == null) {
      proposedValues = this.getProposedValues(modelField)
    }
      
    let values = [];
      
    let count = NpcGeneratorService.randn_bm(modelInstField.meanCount, (modelInstField.maxCount - modelInstField.meanCount) / 2);
    if (count <= 0) {
      count = 1;
    }

    let maxCount = modelInstField.maxCount;
    if (count > modelInstField.maxCount) {
      count = modelInstField.maxCount;
    }

    if (modelField.fieldType === FieldType.NumbersInRange) {
      // pour les NumbersInRange: on utilise la gaussienne
      for (let i = 0; i < count; ++i) {
        let randomVal = NpcGeneratorService.randn_bm(modelField.meanVal, modelField.stdVal);
        if (randomVal > modelField.maxVal) {
          randomVal = modelField.maxVal;
        }
        if (randomVal < modelField.minVal) {
          randomVal = modelField.minVal;
        }
        values.push(Math.floor(randomVal));
      }
    } else {
      let possibleValues = proposedValues;

      
    if (modelInstField.unicityInValues && count > possibleValues.length) {
      count = possibleValues.length
    }

      // pour les Labels: on rapporte sur 1000 "cases" les differents weight
      //                  puis on calcule les seuils, on tire un nbre en 0 et 1000 et cherche le bon seuil par dichotomie

      let totalCount = 0;
      possibleValues.forEach(x => totalCount += x.weight);

      if (totalCount === 0) {return;}
      const resolution = 1000;
      let factor = resolution / totalCount;

      let thresholdList = [];
      let lastThreshold = 0;
      possibleValues.forEach(x => {
        lastThreshold += x.weight * factor;
        thresholdList.push(lastThreshold);
      });

      for (let i = 0; i < count; ++i) {
        const randomValue = Math.floor(Math.random() * resolution);
        // optim: dichotomie
        let i = 0;
        for (let key in thresholdList) {
          if (randomValue <= thresholdList[key]) {
            break;
          }
          ++i;
        }
        if (i >= possibleValues.length) {
          i = possibleValues.length - 1;
        }
        if (modelInstField.unicityInValues && values.find(x => x === possibleValues[i].realValue) != null) {
          --i;
          continue;
        }
        values.push(possibleValues[i].realValue);
      }
    }

    return values;
  }

  public getProposedValues(modelField: NpcModelField): NpcFieldValueModel[] {
    let proposedValues = [];
    if (modelField.fieldType === FieldType.NumbersInRange) {
      return [];
    }
    if (modelField.modelSheet_Type != null) {
      let realSheets = Object.values(this.store.selectSnapshot(NpcWorldState.getWorld).realContainer.realSheetsById)
        .filter((realSheet: NpcRealSheet) => {
          if (modelField.modelSheet_Type.id === realSheet.modelSheet.id) {
            return true;
          }
          return this.modelEditorService.getparents(this.worldResolverService.get<NpcModelSheet>(realSheet.modelSheet)).find(x => modelField.modelSheet_Type.id === x.id) != null;
        });
      proposedValues = realSheets.map(x => NpcFieldValueModel.create(x.name, 1, x.id));
    } else {
      proposedValues = modelField.modelValues.map(x => x);
    }
    return proposedValues;
  }
  
  public static randn_bm(mean: number, std: number): number {
      var u = 0, v = 0;
      while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
      while(v === 0) v = Math.random();
      return mean + ((Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )) * std);
  }
}
