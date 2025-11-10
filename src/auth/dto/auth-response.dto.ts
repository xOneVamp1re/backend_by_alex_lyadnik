import { UserWithoutPassword } from '../../interfaces/user-without-password.interface';

export class AuthResponseDto {
  access_token: string;
  user: UserWithoutPassword;

  constructor(access_token: string, user: UserWithoutPassword) {
    this.access_token = access_token;
    this.user = user;
  }
}
