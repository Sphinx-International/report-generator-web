interface EmialSetting {
  title: string;
  access: "eng" | "all" | "admin" | "coord";
  type: number
}

export const emailMetuSettings: EmialSetting[] = [
  {
    title: "Workorder created",
    access: "admin",
    type: 101
  },
  {
    title: "Workorder updated",
    access: "all",
    type: 102
  },
  {
    title: "Workorder assigned",
    access: "eng",
    type: 103
  },
  {
    title: "Workorder reassigned",
    access: "eng",
    type: 104

  },
  {
    title: "Workorder executed",
    access: "all",
    type: 105
  },
  {
    title: "Workorder report uploaded",
    access: "all",
    type: 106
  },
  {
    title: "Workorder certificate uploaded",
    access: "all",
    type: 109
  },
  {
    title: "Workorder Accepted",
    access: "all",
    type: 110
  },
  {
    title: "Request update",
    access: "all",
    type: 108
  },
];
