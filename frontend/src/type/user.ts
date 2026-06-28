export type UserRole = "admin" | "user";
export type UserStatus =
    "pending_verification"
    | "active"
    | "repeat_false_report"
    | "spam_reporting"
    | "inappropriate_language";

export interface BasicUser {
    id: string;
    username: string;
    role: UserRole;
    email: string;
    phone: string;
    dob: string;
}

export interface FullUser extends BasicUser {
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateProfileRequest {
    username?: string;
    phone?: string;
    dob?: string;
}

export interface UpdatePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface UpdateStatusRequest {
    status: UserStatus;
}

export interface NotifyRequest {
    subject: string;
    message: string;
    notes?: string;
}