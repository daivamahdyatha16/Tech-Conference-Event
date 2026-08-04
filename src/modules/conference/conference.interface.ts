export interface CreateConferenceDTO {
    title: string;
    description: string;
    city: string;
    venue: string;
    startDate: Date;
    endDate: Date;
    isFree: boolean;
    categoryId: number;
    thumbnail?: string;
}

export interface UpdateConferenceDTO 
extends Partial<CreateConferenceDTO> {}

export interface ConferenceQuery {
    search?: string;
    city?: string;
    categoryId?: number;
    isFree?: boolean;
    page?: number;
    limit?: number;
    sortBy?: "startDate" | "createdAt";
    sortOrder?: "asc" | "desc";
}