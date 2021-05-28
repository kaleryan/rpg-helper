import { IStringDictionary } from '../utils/UtilsDictionary';
import { UtilsRef } from '../utils/UtilsRef';
import { NpcModelField } from './NpcModelField';

export class NpcModelInstField {
    public isExternal: boolean;
    public modelField: UtilsRef;

    public id: string; // randomly set

    public maxCount: number;
    public meanCount: number;
    public unicityInValues: boolean;

    // if set, values' weights are ignored
    public meanValueIndex: number;
    public stdValueIndex: number;

    public instFieldGeneratorId: string;

    public static readonly TYPE = "NpcModelInstField";
}

export class NpcModelSheet {
    public isExternal: boolean;
    public id: string;
    public name: string;
    public desc: string;
    public modelInstFields: IStringDictionary<UtilsRef>;
    public tags: string[];

    public modelSheet_Parent: UtilsRef;
    public modelSheet_containedSheets: UtilsRef[];

    public static readonly TYPE = "NpcModelSheet";

    private constructor() {
    }

    public static createPatch(modelSheet: NpcModelSheet): NpcModelSheet {
        const newItem = new NpcModelSheet();
        newItem.id = modelSheet.id;
        return newItem;
    }
    
    public static create(name: string): NpcModelSheet {
        const newItem = new NpcModelSheet();
        newItem.id = Math.random().toString()+Math.random().toString();
        newItem.name = name;

        newItem.modelInstFields = {};
        newItem.tags = [];

        newItem.modelSheet_containedSheets = [];
        return newItem;
    }
}

export class NpcModelContainer {
    public modelInstFields: IStringDictionary<NpcModelInstField> = {};
    public modelSheets: IStringDictionary<NpcModelSheet> = {};
    public modelFields: IStringDictionary<NpcModelField> = {};
}
