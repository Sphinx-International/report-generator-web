export interface ReqMission {
  title: string;
  ticker_number: number | undefined;
  priority: 0 | 1 | 2 | 3;
  description: string;
  require_acceptence: boolean; // False by default | Not required
  assigned_to?: string;
  accounts: string[],
  attachments:File[]
}

export interface ResMission {
  id: number;
  title: string;
  ticker_number: number | undefined;
  priority: 0 | 1 | 2 | 3;
  status: 0 | 1 | 2 | 3 | 4 | 5;
  description: string;
  require_acceptence?: boolean; // False by default | Not required
  assigned_to: string | null;
}

 type MailTo ={
    id:number,
    workorder: number,
    account:string
}
type ResFile ={
    id:number,
    file_name: string,
    uploaded_at:Date,
    workorder: number,
}



export interface ResOfOneMission {
  workorder: {
    id: number;
    title: string;
    ticker_number: number;
    priority: 0 | 1 | 2 | 3;
    status: 0 | 1 | 2 | 3 | 4 | 5;
    description: string;
    require_acceptence?: boolean;
    created_at: Date;
    created_by: string;
    assigned_to: string | null;
  };
  mail_to: MailTo[],
  attachments: ResFile[]
  report?:ResFile
  acceptance_certificate?:ResFile
}
