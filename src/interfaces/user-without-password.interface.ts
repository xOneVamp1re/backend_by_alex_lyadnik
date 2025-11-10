export interface UserWithoutPassword {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  favorites: string[];
  createdAt: Date;
  updatedAt: Date;
}
