import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  isAdmin: boolean;
  favorites: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  id: string; // виртуальное поле
}
