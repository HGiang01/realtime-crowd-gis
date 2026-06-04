export type UserRole = "admin" | "user";

export interface User {
    username: string;
    role: UserRole;
    email: string;
    phone: string;
    dob: string;
}