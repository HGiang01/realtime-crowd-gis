export interface ApiResponse<T = undefined> {
    code: string;
    message: string;
    timestamp: string;
    details?: T;
}