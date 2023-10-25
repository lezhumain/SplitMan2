export interface IEnv {
  production: boolean;
  app: string;
  api: string;
  addCookie?: () => void;
}
