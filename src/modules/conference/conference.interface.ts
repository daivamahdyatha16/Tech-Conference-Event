export interface CreateConferenceDTO {
    title: string;
    description: string;
    city: string;
    venue: string;
    startDate: Date;
    endDate: Date;
    isFree: boolean;
    categoryId: number;
}

export interface UpdateConferenceDTO 
extends Partial<CreateConferenceDTO> {}