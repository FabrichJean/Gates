import { server } from "../constant";

export function cdnS3(keyUrl: string): string | null {
    console.log(keyUrl);
    
    return keyUrl ? `${server}/cdn?key=${keyUrl}` : null;
}