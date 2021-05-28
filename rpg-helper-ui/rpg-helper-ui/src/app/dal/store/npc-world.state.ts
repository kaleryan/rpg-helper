import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { CreateModel, ChangeModel, DeleteModel, DeleteModelField,
    ChangeModelField, RenameModelField, CreateModelField, 
    ChangeModelFieldLabel, RemoveModelField, StoreWorldInLocalStorage, LoadWorldFromLocalStorage,
    ImportWorld, CreateRealSheet, RenameRealSheet, ChangeRealSheet, DeleteRealSheet, DeleteRealField, ChangeModelInstField, AddModelFieldToModel as AddModelInstFieldToModel, CreateCustomRealField, UpdateRealFieldValue, SaveWorld, LoadWorld, RenameWorld, ChangeRealField, AddRealFieldValue, NewWorld, CloneWorld, AddExternalWorld, RemoveExternalWorld } from './npc-world.actions';
import { NpcModelInstField, NpcModelSheet } from '../../models/NpcModelSheet';
import { NpcWorld } from '../../models/NpcWorld';
import { NpcWorldService } from '../db-service/npc-world.service';
import { NpcModelEditorService } from '../db-service/npc-model-editor.service';
import { NpcRealSheet, NpcRealField } from '../../models/NpcRealSheet';
import { produce } from 'immer';
import { UtilsRef } from '../../utils/UtilsRef';
import { NpcModelField } from '../../models/NpcModelField';
import { IStringDictionary } from '@app/utils/UtilsDictionary';

export interface NpcWorldStateModel {
    world: NpcWorld;
}

@State<NpcWorldStateModel>({
    name: 'world',
    defaults: {
        world: NpcWorld.Create()
    }
})
@Injectable()
export class NpcWorldState {

    public constructor(private worldService: NpcWorldService,
        private modelEditorService: NpcModelEditorService) {
    }

    @Selector()
    static getWorld(state: NpcWorldStateModel) {
        return state.world;
    }

    @Action(StoreWorldInLocalStorage)
    storeWorldInLocalStorage(ctx: StateContext<NpcWorldStateModel>, { payload }: StoreWorldInLocalStorage) {
        let world = ctx.getState().world;
        this.worldService.storeInLocalStorage(world);
    }
    
    @Action(SaveWorld)
    saveWorld(ctx: StateContext<NpcWorldStateModel>, { payload }: SaveWorld) {
        let world = ctx.getState().world;
        this.worldService.storeInUrl(world).subscribe(x => console.log("save occurred"),
            x => alert("error when saving"));
    }

    @Action(LoadWorld)
    loadWorld(ctx: StateContext<NpcWorldStateModel>, { payload }: LoadWorld) {
        let world: NpcWorld = null;
        this.worldService.importFromUrl(payload).subscribe(world => {
            if (world != null) {
                ctx.setState((state: NpcWorldStateModel) => ({
                    ...state,
                    world: world
                }));
            }
        });
    }

    @Action(LoadWorldFromLocalStorage)
    loadWorldFromLocalStorage(ctx: StateContext<NpcWorldStateModel>, { payload }: LoadWorldFromLocalStorage) {
        this.worldService.importFromLocalStorage().subscribe(world => {
            if (world != null) {
                ctx.setState((state: NpcWorldStateModel) => ({
                    ...state,
                    world: world
                }));
            }
        });
    }
    
    @Action(ImportWorld)
    importWorld(ctx: StateContext<NpcWorldStateModel>, { payload }: ImportWorld) {
        this.worldService.importFromJson(payload).subscribe(world => {
            if (world != null) {
                ctx.setState((state: NpcWorldStateModel) => ({
                    ...state,
                    world: world
                }));
            }
        });
    }
    
    @Action(NewWorld)
    newWorld(ctx: StateContext<NpcWorldStateModel>, { payload }: NewWorld) {
        let newWorld = NpcWorld.Create();
        newWorld.name = payload;
        ctx.setState(produce(state => {
            state.world = newWorld
        }));
        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }
    
    @Action(CloneWorld)
    cloneWorld(ctx: StateContext<NpcWorldStateModel>, { payload }: CloneWorld) {
        ctx.setState(produce(state => {
            state.world.name = payload
        }));
        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }
    
    @Action(RenameWorld)
    renameWorld(ctx: StateContext<NpcWorldStateModel>, { payload }: RenameWorld) {
        
        // il faudrait effacer?
        ctx.setState(produce(state => {
            state.world.name = payload
        }));

        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }
    
    @Action(AddExternalWorld)
    addExternalWorld(ctx: StateContext<NpcWorldStateModel>, { payload }: AddExternalWorld) {
        
        let newExternalWorlds = ctx.getState().world.externalWorlds;
        if (newExternalWorlds == null) { newExternalWorlds = [] }
        else { newExternalWorlds = newExternalWorlds.map(x => x) }
        newExternalWorlds.push(payload)
        ctx.setState(produce(state => {
            state.world.externalWorlds = newExternalWorlds}));

        this.worldService.reloadingDependencies(ctx.getState().world).subscribe(world => {
            if (world != null) {
                ctx.setState((state: NpcWorldStateModel) => ({
                    ...state,
                    world: world
                }));
            }
        });
        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }

    
    @Action(RemoveExternalWorld)
    removeExternalWorld(ctx: StateContext<NpcWorldStateModel>, { payload }: RemoveExternalWorld) {
        
        let newExternalWorlds = ctx.getState().world.externalWorlds.filter(x => x !== payload)
        ctx.setState(produce(state => {
            state.world.externalWorlds = newExternalWorlds
        }));

        this.worldService.reloadingDependencies(ctx.getState().world).subscribe(world => {
            if (world != null) {
                ctx.setState((state: NpcWorldStateModel) => ({
                    ...state,
                    world: world
                }));
            }
        });
        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }

    @Action(CreateModel)
    createModel(ctx: StateContext<NpcWorldStateModel>, { payload }: CreateModel) {
        const name = payload || "dummyModel";
        if (ctx.getState().world.modelContainer.modelSheets[name] !== undefined) {
            return;
        }

        const newModel = NpcModelSheet.create(name);
        
        ctx.setState(produce(state => {
            state.world.modelContainer.modelSheets[newModel.id] = newModel
        }));

        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }
    
    @Action(ChangeModel)
    changeModel(ctx: StateContext<NpcWorldStateModel>, { payload }: ChangeModel) {
        let newModelList = Object.assign({}, ctx.getState().world.modelContainer.modelSheets);
        let model = Object.assign({}, newModelList[payload.model.id]);

        if (payload.model.desc !== undefined) {
            model.desc = payload.model.desc;
        }
        if (payload.model.modelSheet_Parent !== undefined) {
            model.modelSheet_Parent = payload.model.modelSheet_Parent;
            this.modelEditorService.refreshCache();
        }
        if (payload.model.modelSheet_containedSheets !== undefined) {
            model.modelSheet_containedSheets = payload.model.modelSheet_containedSheets;
            this.modelEditorService.refreshCache();
        }
        if (payload.model.name !== undefined) {
            if (Object.values(ctx.getState().world.modelContainer.modelSheets).find(x => x.name === payload.model.name) == null) {
                model.name = payload.model.name;
            }
        }

        ctx.setState(produce(state => {
            state.world.modelContainer.modelSheets[model.id] = model
        }));

        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }
    
    @Action(DeleteModel)
    deleteModel(ctx: StateContext<NpcWorldStateModel>, { payload }: DeleteModel) {        
        ctx.setState(produce(state => {
            delete state.world.modelContainer.modelSheets[payload.id]
        }));
        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }
    
    @Action(CreateModelField)
    createModelField(ctx: StateContext<NpcWorldStateModel>, { payload }: CreateModelField) {
        const name = payload.id || "dummyField";
        if (ctx.getState().world.modelContainer.modelFields[name] !== undefined) {
            return;
        }
        const newModelField = NpcModelField.create(name);
        newModelField.fieldType = payload.modelFieldContent.fieldType;
        newModelField.minVal = 1;
        newModelField.maxVal = 12;
        newModelField.meanVal = 7;
        newModelField.stdVal = 2;

        ctx.setState(produce(state => {
            state.world.modelContainer.modelFields[newModelField.id] = newModelField
        }));
        
        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }

    @Action(RenameModelField)
    renameModelField(ctx: StateContext<NpcWorldStateModel>, { payload }: RenameModelField) {
        if (ctx.getState().world.modelContainer.modelFields[payload.newId] !== undefined) {
            return;
        }

        ctx.setState(produce(state => {
            state.world.modelContainer.modelFields[payload.oldId].id = payload.newId
            state.world.modelContainer.modelFields[payload.newId] = state.world.modelContainer.modelFields[payload.oldId]
            delete state.world.modelContainer.modelFields[payload.oldId]
        }));

        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }
    
    @Action(ChangeModelField)
    changeModelField(ctx: StateContext<NpcWorldStateModel>, { payload }: ChangeModelField) {
        let modelField = Object.assign({}, ctx.getState().world.modelContainer.modelFields[payload.modelField.id]);

        if (payload.modelField.modelSheet_Type !== undefined) {
            if (payload.modelField.modelSheet_Type === null) {
                modelField.modelSheet_Type = undefined;
            } else {
                modelField.modelSheet_Type = payload.modelField.modelSheet_Type;
            }
        }
        if (payload.modelField.desc !== undefined) {
            modelField.desc = payload.modelField.desc;
        }
        if (payload.modelField.modelValues !== undefined) {
            modelField.modelValues = payload.modelField.modelValues;
        }
        if (payload.modelField.minVal !== undefined) {
            modelField.minVal = payload.modelField.minVal;
        }
        if (payload.modelField.maxVal !== undefined) {
            modelField.maxVal = payload.modelField.maxVal;
        }
        if (payload.modelField.meanVal !== undefined) {
            modelField.meanVal = payload.modelField.meanVal;
        }
        if (payload.modelField.stdVal !== undefined) {
            modelField.stdVal = payload.modelField.stdVal;
        }
        if (payload.modelField.fieldType !== undefined) {
            modelField.fieldType = payload.modelField.fieldType;
        }
        if (payload.modelField.tag !== undefined) {
            modelField.tag = payload.modelField.tag;
        }

        ctx.setState(produce(state => {
            state.world.modelContainer.modelFields[modelField.id] = modelField
        }));

        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }
    
    @Action(DeleteModelField)
    deleteModelField(ctx: StateContext<NpcWorldStateModel>, { payload }: DeleteModelField) {
        ctx.setState(produce(state => {
            delete state.world.modelContainer.modelFields[payload.id]
        }));
        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }

    @Action(AddModelInstFieldToModel)
    addModelInstFieldToModel(ctx: StateContext<NpcWorldStateModel>, { payload }: AddModelInstFieldToModel) {
        const name = payload.label || payload.modelField.name;
        if (ctx.getState().world.modelContainer.modelSheets[payload.modelSheet.id].modelInstFields[name] !== undefined) {
            return;
        }

        payload.newModelInstField.id = NpcWorld.createId();
        
        ctx.setState(produce(state => {
            state.world.modelContainer.modelInstFields[payload.newModelInstField.id] = payload.newModelInstField;
            state.world.modelContainer.modelSheets[payload.modelSheet.id].modelInstFields[name]
                = new UtilsRef(payload.newModelInstField.id, NpcModelInstField.TYPE);
        }));

        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }
    
    @Action(ChangeModelFieldLabel)
    changeModelFieldLabel(ctx: StateContext<NpcWorldStateModel>, { payload }: ChangeModelFieldLabel) {
        if (ctx.getState().world.modelContainer.modelSheets[payload.model.id].modelInstFields[payload.newLabel] !== undefined) {
            return;
        }

        ctx.setState(produce(state => {
            state.world.modelContainer.modelSheets[payload.model.id].modelFields[payload.newLabel] = state.world.modelContainer.modelSheets[payload.model.id].modelFields[payload.oldLabel]
            delete state.world.modelContainer.modelSheets[payload.model.id].modelFields[payload.oldLabel]
        }));

        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }
    
    @Action(ChangeModelInstField)
    changeModelInstField(ctx: StateContext<NpcWorldStateModel>, { payload }: ChangeModelInstField) {
        let modelInstField: NpcModelInstField;
        if (payload.realSheet == null) {
            modelInstField = Object.assign({}, ctx.getState().world.modelContainer.modelInstFields[payload.id]);
        } else {
            modelInstField = Object.assign({}, ctx.getState().world.realContainer.realSheetsById[payload.realSheet.id].realFields[payload.realFieldId].customModel);
        }
        if (payload.modelInstField.maxCount !== undefined) {
            modelInstField.maxCount = payload.modelInstField.maxCount;
        }
        if (payload.modelInstField.meanCount !== undefined) {
            modelInstField.meanCount = payload.modelInstField.meanCount;
        }
        if (payload.modelInstField.unicityInValues !== undefined) {
            modelInstField.unicityInValues = payload.modelInstField.unicityInValues;
        }
        
        if (payload.realSheet == null) {
            ctx.setState(produce(state => {
                state.world.modelContainer.modelInstFields[payload.id] = modelInstField;
            }));
        } else {
            ctx.setState(produce(state => {
                state.world.realContainer.realSheetsById[payload.realSheet.id].realFields[payload.realFieldId].customModel = modelInstField;
            }));
        }

        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }

    @Action(RemoveModelField)
    removeModelInstField(ctx: StateContext<NpcWorldStateModel>, { payload }: RemoveModelField) {
        let debug = ctx.getState().world.modelContainer;
        ctx.setState(produce(state => {
            delete state.world.modelContainer.modelSheets[payload.modelSheet.id].modelInstFields[payload.label]
            delete state.world.modelContainer.modelInstFields[payload.label]
        }));

        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }


    @Action(CreateRealSheet)
    createRealSheet(ctx: StateContext<NpcWorldStateModel>, { payload }: CreateRealSheet) {
        if (ctx.getState().world.realContainer.realSheetIdsByName[payload.label] !== undefined) {
            return;
        }

        const newRealSheet = NpcRealSheet.create(payload.label);

        let model = ctx.getState().world.modelContainer.modelSheets[payload.model]
        newRealSheet.modelSheet = new UtilsRef(model.id, NpcModelSheet.TYPE);
        newRealSheet.realFields = {};
        this.modelEditorService.getAllLabelledModelInstFields(model)
            .forEach(result => {
                const realField = NpcRealField.createRefInst(result.label, new UtilsRef(result.item.modelInstField.id, NpcModelInstField.TYPE),
                    new UtilsRef(result.item.modelSheet.id, NpcModelSheet.TYPE), false);
                newRealSheet.realFields[realField.id] = realField;
            });

        ctx.setState(produce(state => {
            state.world.realContainer.realSheetIdsByName[newRealSheet.name] = newRealSheet.id;
            state.world.realContainer.realSheetsById[newRealSheet.id] = newRealSheet;
        }));

        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }

    @Action(RenameRealSheet)
    renameRealSheet(ctx: StateContext<NpcWorldStateModel>, { payload }: RenameRealSheet) {
        if (ctx.getState().world.realContainer.realSheetIdsByName[payload.realSheet.name] !== undefined) {
            return;
        }

        ctx.setState(produce(state => {
            state.world.realContainer.realSheetIdsByName[payload.realSheet.name] = payload.realSheet.id
            delete state.world.realContainer.realSheetIdsByName[payload.oldName]
            state.world.realContainer.realSheetsById[payload.realSheet.id].name = payload.realSheet.name;
        }));

        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }
    
    @Action(ChangeRealSheet)
    changeRealSheet(ctx: StateContext<NpcWorldStateModel>, { payload }: ChangeRealSheet) {

        ctx.setState(produce(state => {
            if (payload.realSheet.modelSheet !== undefined) {
                state.world.realContainer.realSheetsById[payload.realSheet.id].modelSheet = payload.realSheet.modelSheet;
            }
            if (payload.realSheet.desc !== undefined) {
                state.world.realContainer.realSheetsById[payload.realSheet.id].desc = payload.realSheet.desc;
            }
        }));

        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }
    
    @Action(DeleteRealSheet)
    deleteRealSheet(ctx: StateContext<NpcWorldStateModel>, { payload }: DeleteRealSheet) {
        ctx.setState(produce(state => {
            delete state.world.realContainer.realSheetsById[payload.id]
            delete state.world.realContainer.realSheetIdsByName[payload.name]
        }));

        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }

    @Action(CreateCustomRealField)
    createCustomRealField(ctx: StateContext<NpcWorldStateModel>, { payload }: CreateCustomRealField) {
        let realFields = ctx.getState().world.realContainer.realSheetsById[payload.realSheet.id].realFields;
        if (realFields[payload.realField.id] !== undefined) {
            return;
        }
        
        ctx.setState(produce(state => {
            state.world.realContainer.realSheetsById[payload.realSheet.id].realFields[payload.realField.id] = payload.realField;
        }));

        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }
    
    @Action(ChangeRealField)
    changeRealField(ctx: StateContext<NpcWorldStateModel>, { payload }: ChangeRealField) {
        ctx.setState(produce(state => {
            if (payload.realField.selectedValues !== undefined) {
                state.world.realContainer.realSheetsById[payload.realSheetId].realFields[payload.realField.id].selectedValues = payload.realField.selectedValues;
            }
            if (payload.realField.name !== undefined) {
                state.world.realContainer.realSheetsById[payload.realSheetId].realFields[payload.realField.id].name = payload.realField.name;
            }
            if (payload.realField.isDecorator !== undefined) {
                state.world.realContainer.realSheetsById[payload.realSheetId].realFields[payload.realField.id].isDecorator = payload.realField.isDecorator;
            }
        }));

        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }
    
    @Action(DeleteRealField)
    deleteRealField(ctx: StateContext<NpcWorldStateModel>, { payload }: DeleteRealField) {
        let realContainer = ctx.getState().world.realContainer;
        let realSheet = realContainer.realSheetsById[payload.realSheet.id];
        let realField = realSheet.realFields[payload.id];

        let removedRealFields: string[] = [];
        if (realField.isDecorator)
        {
            realField.selectedValues.forEach((value: string) => {
                let refRealSheetId = realContainer.realSheetIdsByName[value];
                let refRealSheet = realContainer.realSheetsById[refRealSheetId];
                if (refRealSheet != null) {
                    Object.entries(refRealSheet.realFields).forEach(([id, refRealField]) => {
                        let fieldToRemove = realSheet.realFields[id];
                        if (fieldToRemove != null
                            && fieldToRemove.sourceRef != null
                            && fieldToRemove.sourceRef.refType === NpcRealSheet.TYPE
                            && fieldToRemove.sourceRef.id === refRealSheet.id) {
                                removedRealFields.push(id);
                            }
                    });
                }
            })
        }

        ctx.setState(produce(state => {
            removedRealFields.forEach(x => {
                delete state.world.realContainer.realSheetsById[payload.realSheet.id].realFields[x];
            })
            delete state.world.realContainer.realSheetsById[payload.realSheet.id].realFields[payload.id]
        }));

        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }

    @Action(UpdateRealFieldValue)
    updateRealFieldValue(ctx: StateContext<NpcWorldStateModel>, { payload }: UpdateRealFieldValue) {
        if (payload.selectedValues == null) {
            return;
        }
        ctx.setState(produce(state => {
            state.world.realContainer.realSheetsById[payload.realSheet.id].realFields[payload.realField.id].selectedValues = payload.realField.selectedValues;
            payload.addedRealFields.forEach(x => {
                state.world.realContainer.realSheetsById[payload.realSheet.id].realFields[x.id] = x;
            })
            payload.removedRealFields.forEach(x => {
                delete state.world.realContainer.realSheetsById[payload.realSheet.id].realFields[x];
            })
        }));

        return ctx.dispatch(new StoreWorldInLocalStorage("tag"));
    }

    // comment splitter le reducer en plusieurs?

}

