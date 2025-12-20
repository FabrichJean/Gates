export const mapStatus = (value: string) => {
    if (value === 'yes') return '1';
    if (value === 'no') return '0';
    return undefined;
};

export const mapStatusProcessing = (value: string) => {
    if (value === 'yes') return 'done';
    if (value === 'no') return 'null';
    return undefined;
};

export const reverseStatus = (value: string | undefined) => {
    if (value === '1') return 'yes';
    if (value === '0') return 'no';
    return 'all';
};

export function checkObjectContent(obj: Record<string, any>) {
    const values = Object.values(obj);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isEmpty = (v: any) => v === "" || v === "all";

    const allEmpty = values.every(isEmpty);
    const hasContent = values.some(v => !isEmpty(v));

    return { allEmpty, hasContent };
}