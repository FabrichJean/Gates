import { server } from "../constant";

export function cdnS3(keyUrl: string): string | null {
    const isEnc = keyUrl?.endsWith(".enc");

    if(isEnc) {
        return keyUrl ? `${server}/cdn?key=${keyUrl}` : null;
    }
    return keyUrl || null;
}