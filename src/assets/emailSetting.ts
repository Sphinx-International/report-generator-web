interface EmialSetting {
  title: string;
  access: "eng" | "all" | "admin" | "coord";
  type: number
}

export const emailMetuSettings: EmialSetting[] = [
  {
    title: "Workorder created",
    access: "admin",
    type: 300
  },
  {
    title: "Workorder updated",
    access: "all",
    type: 301
  },
  {
    title: "Workorder assigned",
    access: "eng",
    type: 302
  },
  {
    title: "Workorder reassigned",
    access: "eng",
    type: 303

  },
  {
    title: "Workorder executed",
    access: "all",
    type: 304
  },
  {
    title: "Workorder report uploaded",
    access: "all",
    type: 305
  },
  {
    title: "Workorder certificate uploaded",
    access: "all",
    type: 307
  },
  {
    title: "Workorder Accepted",
    access: "all",
    type: 308
  },
  {
    title: "Request update",
    access: "all",
    type: 309
  },
  {
    title: "Return voucher uploaded",
    access: "all",
    type: 310
  },  {
    title: "Return voucher submitted",
    access: "all",
    type: 311
  },
];
