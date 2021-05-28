import { UtilsPtr, UtilsPtrResolver } from './UtilsPtr';

export class UtilsDeepCopy {
    public constructor() {}

    public static deepCopy(source: any): any {
        let refByTypeList = {};
        let dest = this.deepCopyRecur(source, refByTypeList);
        UtilsPtrResolver.resolvePtrs(dest, (id, type) => {
            return refByTypeList[type][id];
        });
        return dest;
    }

    public static deepCopyRecur(source: any, refByTypeList: any): any {
        if (source == null) {
            return source;
        }
        if (UtilsPtr.isPtr(source)) {
            if (refByTypeList[source.type] === undefined) {
                refByTypeList[source.type] = {};
            }
            refByTypeList[source.type][source.id] = source.ptr;
            return new UtilsPtr(source.id, source.type, UtilsPtr.pendingPtrString);
        }
        if (typeof(source) == "object") {
            let dest = {}
            for (let childKey in source) {
                dest[childKey] = this.deepCopyRecur(source[childKey], refByTypeList);
            }
            return dest;
        }
        return source;
    }
}