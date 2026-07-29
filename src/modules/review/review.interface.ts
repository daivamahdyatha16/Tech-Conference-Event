export interface CreateReviewDTO{
    conferenceId: number;
    rating: number;
    comment: string;
}

export interface UpdateReviewDTO {
    rating?: number;
    comment: string;
}

export interface ReviewQuery {
    page?:number;
    limit?: number;
}