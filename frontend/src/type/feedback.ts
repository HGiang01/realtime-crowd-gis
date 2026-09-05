export type FeedbackRating = "dissatisfied" | "acceptable" | "satisfied";

export interface Feedback {
    id: string;
    userId: string;
    description: string;
    satisfactionRating: FeedbackRating;
    createdAt: string;
}

export interface CreateFeedbackRequest {
    description: string;
    satisfactionRating: FeedbackRating;
}
