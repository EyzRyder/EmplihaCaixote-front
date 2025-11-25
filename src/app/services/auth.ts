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


type Skins = {
  "id": number,
  "name": string,
  "description": string,
  "priceGems": number,
  "skinType": string,
  "iconUrl": string,
  "owned": boolean
  "Useing": boolean
}
type Powers = {
  "id": number,
  "name": string,
  "description": string,
  "priceCoins": number,
  "iconUrl": string,
  "quantity": number,
  "owned": boolean
  "Useing": boolean
}

export type Inventory = {
  powers: Powers[]
  skins: Skins[]
}