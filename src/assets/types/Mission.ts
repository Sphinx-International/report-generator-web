import { User } from "./User";
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
  require_acceptence: boolean;
  require_return_voucher: boolean;
  assigned_to?: User | null;
  emails: string[];
  attachments: TheUploadingFile[];
}

export interface ResMission {
  id: string;
  title: string;
  priority: 0 | 1 | 2 | 3;
  status: 0 | 1 | 2 | 3 ;
  description: string;
  report_status: 1 | 2 ,
  certificate_status: 1 | 2 | 3,
  voucher_status: boolean,
  require_acceptence?: boolean;
  require_return_voucher?: boolean;
  created_at: Date;
  created_by: string;
  assigned_to: User | null;
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
  uploaded_by: number;
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
  type: 1 | 2;
  refuse_message: string | null;
};

export type History = {
  id: number;
  at: Date;
  action: number;
  workorder: string;
  by:User
};

export interface ResOfOneMission {
  workorder: {
    id: string;
    report_status: 1 | 2 ,
    is_report_file_uploaded: boolean,
    certificate_status: 1 | 2 | 3,
    is_certificate_file_uploaded: boolean,
    voucher_status: boolean,
    is_voucher_file_uploaded: boolean,
    title: string;
    priority: 0 | 1 | 2 | 3 | number;
    status: 0 | 1 | 2 | 3 ;
    description: string;
    require_acceptence?: boolean;
    require_return_voucher?: boolean;
    created_at: Date;
    created_by: string;
    assigned_to: User | null;
  };
  history: History[];
  mail_to: MailTo[];
  attachments: ResFile[];
  reports?: ReportFile[];
  acceptance_certificates?: CertificateFile[];
  return_vouchers?: ReturnVoucherFile[];
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
