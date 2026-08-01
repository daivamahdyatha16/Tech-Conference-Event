export interface Conference {
  id: number;
  title: string;
  description: string;
  city: string;
  venue: string;
  thumbnail: string | null;
  startDate: string;
  endDate: string;
  isFree: boolean;
  categoryId: number;

  category: {
    id: number;
    name: string;
  };
}

export interface ConferenceResponse {
  message: string;
  data: Conference[];
  meta: {
    page: number;
    limit: number;
    totalData: number;
    totalPage: number;
  };
}
