export class UtilsRef {
    public constructor(public id: string = '', public refType: string) {
    }

    public static isRef(obj: any) {
        return obj != null && obj['refType'] != undefined && obj['id'] != undefined;
    }
}

export class UtilsRefType {
  public name: string;
}


// REVAMP!

// constraint:
// - ne pas faire de trop gros tableau pour ne pas pénaliser la duplication des immutables
// - le resolver doit etre tres efficace => que des recherches par cles, pas d'iterations!
// - avoir un UtilsRef

// revoir le datamodel !
// - acces facile aux anciens ptr
// - mettre le ptr resolver en visibilité dans les components, via l'IoC
// - le resolver est un service qui prend le world en entree

// ajouter des helpers
// - pour gérer les valeurs initiales des select (avec un objet helper à ajouter dans les components)

// revoir les ids unique basés sur les noms
// les names devraient etre independants et les ids ne devraient jamais changer?
// conséquence:
//   comment assurer l'unicité?
//   si un champ est ajouté à la mano, puis complété