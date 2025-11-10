import { Types } from 'mongoose';

export interface PopulatedFavorite {
  _id: Types.ObjectId;
  title: string;
  year: number;
  genre: string[];
  poster?: string;
  rating: number;
  duration: number;
  // другие поля
}
