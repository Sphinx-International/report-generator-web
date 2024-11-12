import { TheUploadingFile } from "./Mission";
import { User } from "./User";

export interface reqOrders {
  type: number | null;
  near_end_location: number | null;
  priority: 0 | 1 | 2 | 3;
  alternative_far_ends: number[] ;
  execute_with_all_alternatives: boolean;
  assigned_to: number | null;
  emails: string[];
  attachments: TheUploadingFile[];
}

export type NearEndLocation = {
  site_id: number;
  site_code: string;
  location_id: number;
  latitude: number;
  longitude: number;
};

export interface resOrders {
  id: number;
  near_end_accessibility: boolean;
  priority: 0 | 1 | 2 | 3;
  status: number; // will be changed later
  execute_with_all_alternatives: boolean;
  assigned_to: User | null;
  type: number;
  near_end_location: NearEndLocation;
  created_at: Date;
}
