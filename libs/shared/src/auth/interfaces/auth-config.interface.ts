import { JWT, JWE } from 'jose';

export interface AuthConfig {
  sign: { key: any; options?: JWT.SignOptions };
  verify: { key: any; options?: JWT.VerifyOptions<true> };
  encrypt: { key: any; options?: any };
  decrypt: { key: any; options?: JWE.DecryptOptions<true> };
}
