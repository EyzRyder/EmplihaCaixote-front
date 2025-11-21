export interface AuthRequest {
    username: string;
    password: string;
  }
  
  export interface CadastroResponse {
    message: string;
    user: User;
  }
  
  export interface LoginResponse {
    token: string;
    user: User;
  }
  
  export interface User {
    id: string;
    username: string;
    coins: number;
    gems: number;
    createdAt: number;
  }