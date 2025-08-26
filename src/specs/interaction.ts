export type ModelContentResponse = {
  type: "content";
  content: string;
  usage: number;
};

export type ModelCallResponse = {
  type: "call";
  id: string;
  name: string;
  parameters: { [key: string]: string };
  usage: number;
};

export type ModelNoneResponse = {
  type: "none";
  usage: number;
};

export type ModelResponse = ModelContentResponse | ModelCallResponse | ModelNoneResponse;
