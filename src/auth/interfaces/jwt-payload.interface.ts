export interface JwtPayload {
  sub: string; // user_id
  email: string;
  tenant_id: string;
  perfil: string;
  iat?: number;
  exp?: number;
}
