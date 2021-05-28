import { NpcRealContainer } from './NpcRealSheet';
import { NpcModelContainer } from './NpcModelSheet';

export class NpcWorld {
    public version: string = '1.0';
    public name: string = 'world';
    public modelContainer: NpcModelContainer;
    public realContainer: NpcRealContainer;

    public externalWorlds: string[]

    public nosave_loadedExternalWorldNames: string[]

    public static Create() {
        let world = new NpcWorld;
        NpcWorld.Init(world);
        return world;
    }

    public static Init(world: NpcWorld) {
        world.modelContainer = new NpcModelContainer();
        world.realContainer = new NpcRealContainer();
    }

    public static createId() {
        return Math.random().toString()+Math.random().toString();
    }
}

// changer de version:
// on garde l'ancienne version dans un fichier à part contenant tous les modèles