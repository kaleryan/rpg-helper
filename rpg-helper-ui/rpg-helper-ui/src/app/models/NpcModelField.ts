import { UtilsRef } from '../utils/UtilsRef';

export class NpcFieldValueModel {
    public label: string;
    public weight: number = 1;
    public realValue: string;

    public static create(label: string, weight: number, realValue: string = undefined) {
        const valueModel = new NpcFieldValueModel;
        valueModel.label = label;
        valueModel.weight = weight;
        valueModel.realValue = realValue || label;
        return valueModel;
    }
}

export enum FieldType {
    NumbersInRange,
    ModelSheets,
    Labels
}

export class NpcModelField {
    public isExternal: boolean;
    public desc: string;

    public static readonly TYPE = "NpcModelField";
    
    public tag: string;
    public name: string;
    public id: string;

    public fieldType: FieldType;
    
    // only relevant for Labels
    public modelValues: NpcFieldValueModel[] = [];

    // only relevant for ModelSheets
    public modelSheet_Type: UtilsRef;

    // only relevant for NumbersInRange
    public minVal: number;
    public maxVal: number;
    public meanVal: number;
    public stdVal: number;

    public fieldGeneratorId: string;

    constructor() {
        this.modelValues = []
    }

    public static create(name: string): NpcModelField {
        const newItem = new NpcModelField();
        newItem.id = Math.random().toString()+Math.random().toString();
        newItem.name = name;
        return newItem;
    }

    public static createPatch(modelField: NpcModelField): NpcModelField {
        const newItem = new NpcModelField();
        newItem.id = modelField.id;
        newItem.modelValues = undefined;
        return newItem;
    }
}
