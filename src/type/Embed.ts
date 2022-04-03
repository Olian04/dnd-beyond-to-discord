export interface Embed {
  title: string;
  color: number;
  description: string;
  fields: {
    name: string;
    value: string;
    inline: boolean;
  }[];
}
