export interface AuthRequest {
    username: string;
    password: string;
  }
  
  export interface AuthResponse {
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