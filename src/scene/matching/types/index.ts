export interface UserData {
  name: string;
  id: string;
}

export interface PartyData {
  id: string;
  owner: UserData;
  isPrivate: boolean;
  users: UserData[];
  maxUsers: number;
}
