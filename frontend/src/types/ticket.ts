export interface TicketType {
  id: number;
  conferenceId: number;
  name: string;
  description: string | null;
  price: number;
  quota: number;
  availableSeat: number;
}
