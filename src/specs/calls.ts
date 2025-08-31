export interface ICallDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    additionalProperties: boolean;
    required: string[];
    properties: {
      [key: string]: {
        type: string;
        description: string;
        enum?: string[];
      };
    };
  };
}

export interface ICallDefinitionEmbedded extends ICallDefinition {
  vectors: number[];
}
