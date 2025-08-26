type ClickupTaskListReportJob = {
  type: "clickup:tasks:report";
  description: string;
  workspace: string;
  folder: string;
  list: string;
};

export type JobDefinition = ClickupTaskListReportJob;
