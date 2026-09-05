export type RegisterRequest = {
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
    phone: string;
    dob: string;
}

export interface LoginRequest {
    usernameOrEmail: string;
    password: string;
}

export interface VerifyEmailRequest {
    email: string;
    otp: string;
}

export interface ResetPasswordRequest {
    email: string;
    newPassword: string;
    confirmNewPassword: string;
    otp: string;
}

export interface AccessToken {
    createdAt: string;
    exp: string;
    accessToken: string;
}
