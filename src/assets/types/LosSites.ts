export interface ReqSite {
  code: string;
  region: 1 | 2 | 3;
  state: string;
  district: string;
  municipality: string;
  type: 1 | 2 | 3 | 4 | 5;
  building_height: number | null;
  site_height: number | null;
  latitude: number | null;
  longitude: number | null;
}

export interface ResSite {
  id: number;
  code: string;
  region: 1 | 2 | 3;
  state: string;
  created_at: Date;
}

export interface ResProjectType {
  id: number;
  name: string;
  created_at: Date;
}