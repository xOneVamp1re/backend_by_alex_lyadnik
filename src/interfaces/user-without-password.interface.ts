export interface UserWithoutPassword {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  favorites: string[];
  createdAt: Date;
  updatedAt: Date;
}
