import { Injectable } from '@angular/core';
import { NpcModelSheet } from '../../models/NpcModelSheet';
import { NpcRealSheet, NpcRealField } from '../../models/NpcRealSheet';
import { NpcWorldState } from '../store/npc-world.state';
import { UtilsRef } from '../../utils/UtilsRef';
import { UpdateRealFieldValue, AddRealFieldValue, DeleteRealField, CreateCustomRealField, ChangeRealField } from '../store/npc-world.actions';
import { Store } from '@ngxs/store';

@Injectable({
  providedIn: 'root'
})
export class NpcRealSheetEditorService {

  constructor(private store: Store) {
  }

  public createNewNpc(npcModel: NpcModelSheet): NpcRealSheet {
    const npcRealSheet = new NpcRealSheet();
    // npcSheet.fieldGroups = this.generator.fieldGroups.map(fieldGroupGenerator =>
    //   this.generate(fieldGroupGenerator));
    return npcRealSheet;
  }

  // public addNpcField(npcRealSheet: NpcRealSheet, field: NpcModelField, newField: string, isChosen: boolean): NpcModelField {
  //   const fieldGroup = this.generator.fieldGroups[fieldGroupRealSheet.id];
  //   if (fieldGroup.fields.some(x => x.desc.toLowerCase() === newField.toLowerCase())) {
  //     return null;
  //   }
  //   const newId = fieldGroup.fields.length;
  //   fieldGroup.fields.push(new NpcFieldGenerator(newId, newField));
  //   fieldGroupRealSheet.fields.push(new NpcField(newId, fieldGroupRealSheet.id));

  //   if (isChosen && !fieldGroup.type.includes('number')
  //       && !fieldGroup.type.includes('single')) {
  //     fieldGroupRealSheet.chosenFieldIds.push(newId);
  //   }

  //   return fieldGroupRealSheet;
  // }


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
}


export class UpdatedRealFieldEffects {
  constructor(public addedRealFields : NpcRealField[] = [],
    public removedRealFields: string[] = []) {}
} 
