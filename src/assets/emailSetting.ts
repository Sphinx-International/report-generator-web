interface EmialSetting {
  title: string;
  access: "eng" | "all" | "admin" | "coord";
}

export const emailMetuSettings: EmialSetting[] = [
  {
    title: "Workorder created",
    access: "admin",
  },
  {
    title: "Workorder assigned",
    access: "eng",
  },
  {
    title: "Workorder reassigned",
    access: "eng",
  },
  {
    title: "Workorder Validated",
    access: "all",
  },
  {
    title: "Workorder Accepted",
    access: "all",
  },
  {
    title: "Request update",
    access: "all",
  },
];
