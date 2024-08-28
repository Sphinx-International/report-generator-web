 export type TheUploadingFile= {
  id?:number,
  progress?:  number ,
  file?: File
 }

export interface ReqMission {
  title: string;
  id: string | undefined;
  priority: 0 | 1 | 2 | 3;
  description: string;
  require_acceptence: boolean; // False by default | Not required
  assigned_to?: string;
  emails: string[],
  attachments:TheUploadingFile[]
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

 type MailTo ={
    id:number,
    workorder: number,
    email:string
}
export type ResFile ={
    id:number,
    file_name: string,
    uploaded_at:Date,
    workorder: number,
    downloadProgress?: string
    is_completed: boolean;

}

export type ReqAccFile = ResFile & {
  type: 1 | 2 | 3;
};


export type History =  {
  id:number,
  at: Date,
  status:number,
  workorder:string
};


export interface ResOfOneMission {
  workorder: {
    id: string;
    title: string;
    priority: 0 | 1 | 2 | 3 |number;
    status: 0 | 1 | 2 | 3 | 4 | 5;
    description: string;
    require_acceptence?: boolean;
    created_at: Date;
    created_by: string;
    assigned_to: string | null;
  };
  history:History[],
  mail_to: MailTo[],
  attachments: ResFile[]
  reports?:ResFile[]
  acceptance_certificates?:ReqAccFile[]
}
