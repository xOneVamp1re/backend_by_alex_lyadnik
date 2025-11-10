export interface JwtPayload {
  sub: string; // ✅ стандартное поле (обязательно)
  id?: string; // ⚠️ опционально, если нужно
  email: string;
  name: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}
