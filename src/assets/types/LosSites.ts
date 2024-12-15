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

export interface ReqRelocateSite {
  code: string;
  region: 1 | 2 | 3;
  state: string;
  district: string;
  municipality: string;
  type: 1 | 2 | 3 | 4 | 5;
  latitude: number | null;
  longitude: number | null;
}

export interface ResLocation {
  id: number;
  district: string;
  municipality: string;
  type: 1 | 2 | 3 | 4 | 5;
  building_height: number;
  site_height: number;
  latitude: number;
  longitude: number;
  updated_at: Date;
  site: number;
}

export interface ResSite {
  id: number;
  location: ResLocation;
  code: string;
  region: 1 | 2 | 3;
  state: string;
  created_at: Date;
}



export interface ResOfOneSite {
  site: {
    id: number;
    code: string;
    region: 1 | 2 | 3;
    state: string;
    created_at: Date;
  };
  location_history: ResLocation[];
}

export interface ResProjectType {
  id: number;
  name: string;
  created_at: Date;
}
