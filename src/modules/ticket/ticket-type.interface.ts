export interface CreateTicketTypeDTO {
    name: string;
    description?: string;
    price: number;
    quota: number;
}

export interface UpdateTicketTypeDTO extends Partial<CreateTicketTypeDTO>{}

export interface TicketTypeQuery {
    page?: number;
    limit?: number;
}