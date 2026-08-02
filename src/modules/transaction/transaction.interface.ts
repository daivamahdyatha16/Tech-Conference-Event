export interface CreateTransactionDTO {
    ticketTypeId: number;
    quantity: number ;
    couponId?: number;
  pointUsed?: number;
}

    export interface TransactionQuery{
        page? : number;
        limit? : number;
        status? : string;
    }
