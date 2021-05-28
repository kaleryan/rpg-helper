export enum UtilsScannerReturn {
    Continue,
    Skip,
    Stop
}

export class UtilsScanner {

    public constructor(private callback: (ctx: any, obj: any, isBefore: boolean) => UtilsScannerReturn,
    private ctx: any) {

    }

    public scanRecur(obj: any, depth: number = 0): UtilsScannerReturn {
        switch (this.callback(this.ctx, obj, true)) {
        case UtilsScannerReturn.Stop:
            return UtilsScannerReturn.Stop;
        case UtilsScannerReturn.Skip:
            return UtilsScannerReturn.Skip;
        default:
            break;
        }
        if (typeof obj === "object") {
            if (Array.isArray(obj)) {
                for (let i = 0; i < obj.length; ++i) {
                    if (this.scanRecur(obj[i], depth + 1) === UtilsScannerReturn.Stop) {
                        return UtilsScannerReturn.Stop;
                    }
                }
            } else {
                for (let child in obj) {
                    if (this.scanRecur(obj[child], depth + 1) === UtilsScannerReturn.Stop) {
                        return UtilsScannerReturn.Stop;
                    }
                }
            }
        }
        return this.callback(this.ctx, obj, false);
    }
}