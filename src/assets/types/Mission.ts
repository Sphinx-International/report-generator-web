export type TheUploadingFile = {
  id?: number;
  progress?: number;
  file?: File;
};

export interface ReqMission {
  title: string;
  id: string | undefined;
  priority: 0 | 1 | 2 | 3;
  description: string;
  require_acceptence: boolean; // False by default | Not required
  assigned_to?: string;
  emails: string[];
  attachments: TheUploadingFile[];
}

export interface ResMission {
  id: string;
  title: string;
  priority: 0 | 1 | 2 | 3;
  status: 0 | 1 | 2 | 3 | 4 | 5;
  description: string;
  require_acceptence?: boolean; // False by default | Not required
  assigned_to: string | null;
}

type MailTo = {
  id: number;
  workorder: number;
  email: string;
};
export type ResFile = {
  id: number;
  file_name: string;
  uploaded_at: Date;
  uploaded_by: string,
  workorder: string;
  downloadProgress?: string;
  is_completed: boolean;
};

export type ReturnVoucherFile = ResFile & {
  is_last: boolean;
};

export type CertificateFile = ResFile & {
  type: 1 | 2 | 3;
};

export type ReportFile = ResFile & {
  type: 1 | 2 ;
  refuse_message: string | null,
};

export type History = {
  id: number;
  at: Date;
  action: number;
  workorder: string;
};

export interface ResOfOneMission {
  workorder: {
    id: string;
    title: string;
    priority: 0 | 1 | 2 | 3 | number;
    status: 0 | 1 | 2 | 3 | 4 | 5;
    description: string;
    require_acceptence?: boolean;
    require_return_voucher?: boolean;
    created_at: Date;
    created_by: string;
    assigned_to: string | null;
  };
  history: History[];
  mail_to: MailTo[];
  attachments: ResFile[];
  reports?: ReportFile[];
  acceptance_certificates?: CertificateFile[];
  return_vouchers?: ReturnVoucherFile[]
}

export interface alertWorkorder {
  id: string;
  title: string;
  priority: 0 | 1 | 2 | 3 | number;
  status: 0 | 1 | 2 | 3 | 4 | 5;
  description: string;
  require_acceptence: boolean;
  created_at: Date;
  created_by: string;
  assigned_to: string | null;
}
