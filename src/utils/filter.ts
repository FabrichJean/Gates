export const mapStatus = (value: string) => {
    if (value === 'yes') return '1';
    if (value === 'no') return '0';
    return undefined;
};

export const reverseStatus = (value: string) => {
    if (value === '1') return 'yes';
    if (value === '0') return 'no';
    return 'all';
};