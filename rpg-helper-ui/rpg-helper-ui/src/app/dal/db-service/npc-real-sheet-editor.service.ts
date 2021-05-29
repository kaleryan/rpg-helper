import { Injectable } from '@angular/core';
import { NpcModelInstField, NpcModelSheet } from '../../models/NpcModelSheet';
import { NpcRealSheet, NpcRealField } from '../../models/NpcRealSheet';
import { NpcWorldState } from '../store/npc-world.state';
import { UtilsRef } from '../../utils/UtilsRef';
import { UpdateRealFieldValue, AddRealFieldValue, DeleteRealField, CreateCustomRealField, ChangeRealField } from '../store/npc-world.actions';
import { Store } from '@ngxs/store';
import { NpcWorldResolverService } from './npc-world-resolver.service';
import { NpcModelEditorService } from './npc-model-editor.service';
import { IStringDictionary } from '@app/utils/UtilsDictionary';
import { UtilsLabelledItem } from '@app/utils/UtilsLabelledItem';

@Injectable({
  providedIn: 'root'
})
export class NpcRealSheetEditorService {

  constructor(private store: Store, private worldResolverService: NpcWorldResolverService,
    private modelEditorService: NpcModelEditorService) {
  }

  public createNewNpc(npcModel: NpcModelSheet): NpcRealSheet {
    const npcRealSheet = new NpcRealSheet();
    // npcSheet.fieldGroups = this.generator.fieldGroups.map(fieldGroupGenerator =>
    //   this.generate(fieldGroupGenerator));
    return npcRealSheet;
  }
  public computeSelectedValuesChanges(realSheet: NpcRealSheet, realField: NpcRealField, selectedValues: string[]): UpdatedRealFieldEffects {

      let realContainer = this.store.selectSnapshot(NpcWorldState.getWorld).realContainer;
      let existingValues = realField.selectedValues;
      let addedRealFields : NpcRealField[] = [];
      let removedRealFields: string[] = [];

      if ((realField.isDecorator == null && realField.isDecorator) || realField.isDecorator)
      {
          let addedValues = selectedValues.filter(x => !existingValues.includes(x));
          let removedValues = existingValues.filter(x => !selectedValues.includes(x));

          addedValues.forEach((value: string) => {
              let refRealSheet = realContainer.realSheetsById[value];
              if (refRealSheet != null) {
                  Object.values(refRealSheet.realFields).forEach((refRealField: NpcRealField) => {
                      let newRealField: NpcRealField;
                      if (refRealField.customModel != null) {
                          newRealField = NpcRealField.createCustom(refRealField.name, Object.assign({}, refRealField.customModel),
                              new UtilsRef(refRealSheet.id, NpcRealSheet.TYPE), false /* isDecorator*/);
                      } else {
                          newRealField = NpcRealField.createRefInst(refRealField.name, refRealField.modelInstField,
                              new UtilsRef(refRealSheet.id, NpcRealSheet.TYPE), false /* isDecorator*/);
                      }
                      addedRealFields.push(newRealField);
                  });
              }
          })

          removedValues.forEach(value => {
              let refRealSheet = realContainer.realSheetsById[value];
              if (refRealSheet != null) {
                  Object.values(refRealSheet.realFields).forEach((refRealField: NpcRealField) => {
                      for (let realFieldId in realSheet.realFields) {
                          let fieldToRemove = realSheet.realFields[realFieldId];
                          if (fieldToRemove.name === refRealField.name
                              && fieldToRemove.sourceRef != null
                              && fieldToRemove.sourceRef.refType === NpcRealSheet.TYPE
                              && fieldToRemove.sourceRef.id === refRealSheet.id) {
                                  removedRealFields.push(realFieldId);
                                  break;
                          }
                      }
                  });
              }
          })
      }

      return new UpdatedRealFieldEffects(addedRealFields, removedRealFields);
    }

    public dispatchUpdateRealFieldValueAction(realSheet: NpcRealSheet, realField: NpcRealField, selectedValues: string[]): UpdatedRealFieldEffects {
      let updatedFields = this.computeSelectedValuesChanges(realSheet, realField, selectedValues);

      let updatedRealField = new NpcRealField;
      updatedRealField.id = realField.id;
      updatedRealField.selectedValues = selectedValues;
      this.store.dispatch(new ChangeRealField({realSheetId: realSheet.id, realField: updatedRealField}));
      updatedFields.addedRealFields.forEach(realField => this.store.dispatch(new CreateCustomRealField({realSheet: realSheet, realField: realField})));
      updatedFields.removedRealFields.forEach(realFieldId => this.store.dispatch(new DeleteRealField({realSheet: realSheet, id: realFieldId})));
      return updatedFields;
    }

    

  public computeDependentFieldsToAdd(realSheet: NpcRealSheet): NpcRealField[] {
    // on itere sur les dependances
    // pour chacune, on ajoute dans un dico les champs trouves
    // a la fin, s'il en manque

    var fieldsToAdd: NpcRealField[] = [];

    var modelSheetRefs = new Set();
    var realSheetRefs = new Set();
    var existingFields = new Set();

    Object.values(realSheet.realFields).forEach((realField: NpcRealField) => {
        let fieldOwner = realField.sourceRef;
        existingFields.add(realField.modelInstField.id);
        if (fieldOwner.refType == NpcModelSheet.TYPE) {
            modelSheetRefs.add(fieldOwner.id);
        } else if (fieldOwner.refType == NpcRealSheet.TYPE) {
            realSheetRefs.add(fieldOwner.id);
        }
    });

    modelSheetRefs.forEach((modelSheetRefId: string) => {
        let modelSheetRef = this.worldResolverService.get<NpcModelSheet>(new UtilsRef(modelSheetRefId, NpcModelSheet.TYPE));
        
        // on liste tous les champs possibles
        fieldsToAdd = fieldsToAdd.concat(this.modelEditorService.getAllLabelledModelInstFields(modelSheetRef)
            .filter(x => !existingFields.has(x.item.modelInstField.id)) // puis on enleve les champs présents
            .map(x => {
                existingFields.add(x.item.modelInstField.id)
                return NpcRealField.createRefInst(x.label,
                    new UtilsRef(x.item.modelInstField.id, NpcModelInstField.TYPE),
                    new UtilsRef(modelSheetRefId, NpcModelSheet.TYPE), false)
            }));   // et on rajoute les champs non-présents
    })

    realSheetRefs.forEach((realSheetRefId: string) => {
        let realSheetRef = this.worldResolverService.get<NpcRealSheet>(new UtilsRef(realSheetRefId, NpcRealSheet.TYPE));
        
        fieldsToAdd = fieldsToAdd.concat(Object.entries(realSheetRef.realFields)
            .filter(x => !existingFields.has(x[1].modelInstField.id)) // puis on enleve les champs présents
            .map(x => {
                existingFields.add(x[1].modelInstField.id)
                return NpcRealField.createRefInst(x[0], new UtilsRef(x[1].modelInstField.id, NpcModelInstField.TYPE),
                new UtilsRef(realSheetRefId, NpcRealSheet.TYPE), false)
            }));   // et on rajoute les champs non-présents
    })
    return fieldsToAdd;
 }
}


export class UpdatedRealFieldEffects {
  constructor(public addedRealFields : NpcRealField[] = [],
    public removedRealFields: string[] = []) {}
} 
