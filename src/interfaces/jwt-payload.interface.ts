export interface JwtPayload {
  sub: string; // ✅ стандартное поле (обязательно)
  id?: string; // ⚠️ опционально, если нужно
  email: string;
  username: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
