/*May need to add more subteams/info later*/
/*Double check all subteams are here later*/
export type Subteam = 'Electrical' | 'Finance' | 'Firmware' | 'Management' | 'Marketing' | 'Mechanical' | 'Web Dev';
export type Priority = 'Low' | 'Medium' | 'High';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  subteam: Subteam;
  priority: Priority;
  assignee?: string;
  dueDate?: string;     //YYYYMMDD
  completed: boolean;
  archived?: boolean;
  createdAt: string;    // timestamp
}
