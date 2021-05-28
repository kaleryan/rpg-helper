import { NpcRealSheet, NpcRealField } from '../../models/NpcRealSheet';
import { NpcModelField } from '../../models/NpcModelField';
import { NpcModelInstField, NpcModelSheet } from '../../models/NpcModelSheet';

export class CreateModel {
    static readonly type = 'CreateModel';
    constructor(public payload: string) {}
}

export class ChangeModel {
    static readonly type = 'ChangeModel';
    constructor(public payload: {model: NpcModelSheet}) {}
}

export class DeleteModel {
    static readonly type = 'DeleteModel';
    constructor(public payload: NpcModelSheet) {}
}

export class CreateModelField {
    static readonly type = 'CreateModelField';
    constructor(public payload: {id: string, modelFieldContent: NpcModelField}) {}
}

export class RenameModelField {
    static readonly type = 'RenameModelField';
    constructor(public payload: {oldId: string, newId: string}) {}
}

export class ChangeModelField {
    static readonly type = 'ChangeModelField';
    constructor(public payload: {modelField: NpcModelField}) {}
}

export class DeleteModelField {
    static readonly type = 'DeleteModelField';
    constructor(public payload: NpcModelField) {}
}

export class AddModelFieldToModel {
    static readonly type = 'AddModelField';
    constructor(public payload: {modelSheet: NpcModelSheet, modelField: NpcModelField, label: string, newModelInstField: NpcModelInstField}) {}
}

export class ChangeModelFieldLabel {
    static readonly type = 'ChangeModelFieldLabel';
    constructor(public payload: {model: NpcModelSheet, oldLabel: string, newLabel: string}) {}
}

export class RemoveModelField {
    static readonly type = 'RemoveModelField';
    constructor(public payload: {modelSheet: NpcModelSheet, label: string}) {}
}

export class SaveWorld {
    static readonly type = 'SaveWorld';
    constructor(public payload: string) {}
}

export class LoadWorld {
    static readonly type = 'LoadWorld';
    constructor(public payload: string) {}
}

export class NewWorld {
    static readonly type = 'NewWorld';
    constructor(public payload: string) {}
}

export class CloneWorld {
    static readonly type = 'CloneWorld';
    constructor(public payload: string) {}
}

export class RenameWorld {
    static readonly type = 'RenameWorld';
    constructor(public payload: string) {}
}

export class AddExternalWorld {
    static readonly type = 'AddExternalWorld';
    constructor(public payload: string) {}
}

export class RemoveExternalWorld {
    static readonly type = 'RemoveExternalWorld';
    constructor(public payload: string) {}
}

export class StoreWorldInLocalStorage {
    static readonly type = 'StoreWorldInLocalStorage';
    constructor(public payload: string) {}
}

export class LoadWorldFromLocalStorage {
    static readonly type = 'LoadWorldFromLocalStorage';
    constructor(public payload: string) {}
}

export class ImportWorld {
    static readonly type = 'ImportWorld';
    constructor(public payload: string) {}
}

export class CreateRealSheet {
    static readonly type = 'CreateRealSheet';
    constructor(public payload: {label: string, model: string}) {}
}

export class RenameRealSheet {
    static readonly type = 'RenameRealSheet';
    constructor(public payload: {oldName: string, realSheet: NpcRealSheet}) {}
}

export class ChangeRealSheet {
    static readonly type = 'ChangeRealSheet';
    constructor(public payload: {realSheet: NpcRealSheet}) {}
}

export class DeleteRealSheet {
    static readonly type = 'DeleteRealSheet';
    constructor(public payload: NpcRealSheet) {}
}

export class CreateCustomRealField {
    static readonly type = 'CreateRealField';
    constructor(public payload: {realSheet: NpcRealSheet, realField: NpcRealField}) {}
}

export class AddRealField {
    static readonly type = 'AddRealField';
    constructor(public payload: {realSheet: NpcRealSheet, realField: NpcRealField}) {}
}

export class RenameRealFieldLabel {
    static readonly type = 'RenameRealFieldLabel';
    constructor(public payload: {realSheet: NpcRealSheet, oldId: string, newId: string}) {}
}

export class ChangeRealField {
    static readonly type = 'ChangeRealField';
    constructor(public payload: {realSheetId: string, realField: NpcRealField}) {}
}

export class DeleteRealField {
    static readonly type = 'DeleteRealField';
    constructor(public payload: {realSheet: NpcRealSheet, id: string}) {}
}

export class AddRealFieldValue {
    static readonly type = 'AddRealFieldValue';
    constructor(public payload: {realSheet: NpcRealSheet, realField: NpcRealField}) {}
}

export class RemoveRealFieldValue {
    static readonly type = 'RemoveRealFieldValue';
    constructor(public payload: {realSheet: NpcRealSheet, realField: NpcRealField, value: string}) {}
}

export class ChangeModelInstField {
    static readonly type = 'ChangeModelInstField';
    constructor (public payload: {id: string, modelInstField: NpcModelInstField, realSheet: NpcRealSheet, realFieldId: string}) {}
}

export class UpdateRealFieldValue {
    static readonly type = 'UpdateRealFieldValue';
    constructor (public payload: {realSheet: NpcRealSheet, realField: NpcRealField, selectedValues: string[], addedRealFields: NpcRealField[], removedRealFields: string[]}) {}
}