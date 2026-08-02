export interface Review {
  id: number;
  userId: number;
  conferenceId: number;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    id: number;
    fullName: string;
  };
}
