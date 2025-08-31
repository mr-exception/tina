import axios from "axios";

export interface IClickupTask {
  id: string;
  name: string;
  text_content: string;
  description: string;
  date_created: number;
  date_updated: number;
  archived: false;
  tags: { name: string }[];
  url: string;
  list: { id: string; name: string };
  folder: { id: string; name: string };
}

export interface IClickupListTasks {
  tasks: IClickupTask[];
  last_page: boolean;
}

export async function getClickupTasks(listId: string, accessToken: string) {
  const response = await axios
    .get<IClickupListTasks>(`https://api.clickup.com/api/v2/list/${listId}/task`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .then((response) => response.data);
  return response.tasks;
}
