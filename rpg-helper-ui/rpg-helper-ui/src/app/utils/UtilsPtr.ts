import { UtilsScanner, UtilsScannerReturn } from './UtilsScanner';

export class UtilsPtr<TPtr> {
    
    public constructor(public id: string = '', public type: string = '', public ptr: TPtr = null) {
    }

    public static pendingPtrString = 'pending';

    public static filterPtr(key: string, value: any, pendingValue: string) {
        if (key === "ptr") {
            return pendingValue;
        }
        return value;
    }

    public static isPtr(obj: any) {
        return obj != null && obj['ptr'] != undefined;
    }
}

export class UtilsPtrResolver {

  public static resolvePtrs(obj: any, findByIdAndType: (id: string, type: string) => any) {
    let scanner = new UtilsScanner(this.resolvePtr, 
        {pendingPtrString: UtilsPtr.pendingPtrString, findByIdAndType: findByIdAndType});
    scanner.scanRecur(obj);
  }

  private static resolvePtr(ctx: any, obj: any, isBefore: boolean): UtilsScannerReturn {
    if (!isBefore || obj['ptr'] === undefined) {
      return UtilsScannerReturn.Continue;
    }
    if (obj['ptr'] === ctx.pendingPtrString) {
      let ptr = ctx.findByIdAndType(obj['id'], obj['type']);
      if (ptr != null) {
        obj['ptr'] = ptr;
      } else {
        console.log('error in resolution: ptr not found for type:'+obj['type']+' and id:'+obj['id']);
      }
    }
    return UtilsScannerReturn.Skip;
  }
}