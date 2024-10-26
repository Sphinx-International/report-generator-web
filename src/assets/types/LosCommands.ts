import { TheUploadingFile } from "./Mission";
export interface reqCommands {
    Number: number | null;
    id: string | undefined;
    priority: 0 | 1 | 2 | 3;
    sites: string;
    require_acceptence: boolean; // False by default | Not required
    assigned_to?: string;
    emails: string[];
    attachments: TheUploadingFile[];
  }