export type TaskResponse = {
  task_id: string;
  title: string;
  description: string;
  acceptance_criteria: string;
  deadline: string;
  taskpriority: string;
  taskstatus: string;
  assigned_to: string;
  project_id: string;
  created_by: string;
};

export type TaskApiResponse = {
  status: string;
  message: string;
  data: TaskResponse[];
};

export enum TaskStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  InReview = 'In Review',
  Done = 'Done',

}
export enum priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export type Task = {
  TaskId: string;
  Title: string;
  Description: string;
  AcceptanceCriteria: string;
  Deadline: Date;
  TaskPriority: priority;
  TaskStatus: TaskStatus;
  AssignedTo: string;
  ProjectId: string;
  CreatedBy: string;
};

export type AddTask = {
  title: string;
  description: string;
  acceptance_criteria: string;
  deadline: string;
  priority: string;
  assigned_to: string;
};

export type EditTask = {
  titel: string;
  description: string;
  acceptanceCriteria: string;
  deadline: string;
  task_priority: string;
  empId: string;
};
