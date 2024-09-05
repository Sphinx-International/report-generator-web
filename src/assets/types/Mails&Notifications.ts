export interface Resmail {
  id: number;
  email: string;
}

export interface Resgroup {
  id: number;
  name: string;
}

export interface Notification {
  id: number;
  action: number;
  on: string;
  by: string;
  at: Date;
}
