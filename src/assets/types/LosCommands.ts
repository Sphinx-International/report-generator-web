import { TheUploadingFile } from "./Mission";
import { User } from "./User";
import { ResFile } from "./Mission";

export interface reqOrders {
  type: number | null;
  near_end_location: number | null;
  priority: 0 | 1 | 2 | 3;
  alternative_far_ends: number[];
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
  status: 0 | 2 | 1 | 3;
  execute_with_all_alternatives: boolean;
  assigned_to: User | null;
  type: {
    id: number;
    name: string;
  };
  near_end_location: NearEndLocation;
  created_at: Date;
}

type MailTo = {
  id: number;
  email: string;
  line_of_sight: number;
};

type FarEndAlt = {
  id: number;
  far_end_accessibility: boolean;
  los_status: 1 | 2 | 3;
  line_of_sight: number;
  site_location: NearEndLocation;
  executed: {
    near_end: boolean;
    far_end: boolean;
  };
  image_count: {
    near_end: number;
    far_end: number;
  };
};

export interface resOfOneOrder {
  line_of_sight: {
    id: number;
    near_end_accessibility: boolean;
    priority: 0 | 1 | 2 | 3;
    status: 0 | 2 | 1 | 3;
    execute_with_all_alternatives: boolean;
    assigned_to: User | null;
    type: {
      id: number;
      name: string;
    };
    near_end_location: NearEndLocation;
    created_at: Date;
    created_by: number;
  };
  alternative_far_ends: FarEndAlt[];
  mails: MailTo[];
  attachments: ResFile[];
}

export interface ReqLosExecution {
  los_result: number | null;
  site_type: 1 | 2 | null;
  hba: number | null;
  longitude: number | null;
  latitude: number | null;
}

export interface ResLosExecution {
  id: number;
  los_result: number;
  site_type: 1 | 2;
  hba: number;
  longitude: number;
  latitude: number;
}

export interface ReqUploadSiteLocation {
  site_result: number | null;
  image: number | null | undefined;
  comment: string | null;
}
