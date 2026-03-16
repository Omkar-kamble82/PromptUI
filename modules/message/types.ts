export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface ProjectFragment {
  id: string;
  messageId: string;
  sandboxUrl: string;
  title: string;
  files: JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}