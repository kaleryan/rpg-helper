import { IStringDictionary } from '../utils/UtilsDictionary';
import { UtilsRef } from '../utils/UtilsRef';
import { NpcModelInstField } from './NpcModelSheet';
import { NpcWorld } from './NpcWorld';

export class NpcRealField {
    public id: string;
    public name: string;
    public selectedValues: string[] = []
    public modelInstField: UtilsRef
    public customModel: NpcModelInstField;
    public sourceRef: UtilsRef; // decorator name or model sheet?
    public isDecorator: boolean;

    constructor() {
    }

    public static createRefInst(name: string, refToModelInstField: UtilsRef, sourceRef: UtilsRef, isDecorator: boolean): NpcRealField {
        const newItem = new NpcRealField();
        newItem.id = Math.random().toString()+Math.random().toString();
        newItem.name = name;
        newItem.modelInstField = refToModelInstField;
        newItem.sourceRef = sourceRef;
        newItem.isDecorator = isDecorator;
        return newItem;
    }
    
    public static createCustom(name: string, customModel: NpcModelInstField, sourceRef: UtilsRef, isDecorator: boolean): NpcRealField {
        const newItem = new NpcRealField();
        newItem.id = Math.random().toString()+Math.random().toString();
        newItem.name = name;
        newItem.customModel = customModel;
        newItem.sourceRef = sourceRef;
        newItem.isDecorator = isDecorator;
        return newItem;
    }
}

export class NpcRealSheet {
    constructor() {
        this.realFields = {}
    }
    public id: string;
    public name: string;
    public desc: string;
    public modelSheet: UtilsRef;
    public realFields: IStringDictionary<NpcRealField>;

    public static TYPE = "NpcRealSheet";

    public static create(name: string): NpcRealSheet {
        let result = new NpcRealSheet();
        result.id = NpcWorld.createId();
        result.name = name;
        return result;
    }
}

export class NpcRealContainer {
    public realSheetsById: IStringDictionary<NpcRealSheet>;
    public realSheetIdsByName: IStringDictionary<string>;
    public freeModelInstFields: IStringDictionary<NpcModelInstField>;

    public constructor() {
        this.realSheetsById = {}
        this.realSheetIdsByName = {}
    }
}

