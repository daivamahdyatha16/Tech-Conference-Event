export interface CreateTransactionDTO {
    ticketTypeId: number;
    quantity: number ;
}

    export interface TransactionQuery{
        page? : number;
        limit? : number;
        status? : string;
    }
