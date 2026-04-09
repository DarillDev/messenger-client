interface IJwtPayload {
  userId: string;
  userName: string;
  exp: number;
}

export class JwtToken {
  public readonly accessToken: string;
  public readonly refreshToken: string;
  public readonly payload: IJwtPayload;

  private constructor(accessToken: string, refreshToken: string) {
    const base64Payload = accessToken.split('.')[1];
    
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.payload = JSON.parse(atob(base64Payload)) as IJwtPayload;
  }

  public get isExpired(): boolean {
    return Date.now() >= this.payload.exp * 1000;
  }

  public static decode(accessToken: string, refreshToken: string): JwtToken | null {
    try {
      return new JwtToken(accessToken, refreshToken);
    } catch {
      return null;
    }
  }
}
