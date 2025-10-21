export const RoleEnum = {
    ADMIN: 'admin',
    SUPERADMIN: 'superadmin',
} as const;

export type RoleEnumType = typeof RoleEnum[keyof typeof RoleEnum];

export default RoleEnum;