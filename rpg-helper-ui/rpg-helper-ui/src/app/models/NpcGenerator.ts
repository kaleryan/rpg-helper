
export class NpcFieldGenerator {
    constructor(public id: number, public desc: string) {}
}

export class NpcFieldGroupGenerator {
    desc: string;
    id: number;
    type: string;
    generator: string;
    fields: NpcFieldGenerator[];
}

export class NpcGenerator {
    name: string;
    fieldGroups: NpcFieldGroupGenerator[];
}
