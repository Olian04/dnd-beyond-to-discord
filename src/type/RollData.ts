import { RollType } from './RollType';

export interface RollData {
  type: RollType;
  ability: string;
  rollString: string;
  rollResults: string;
  rollSum: string;
  rollMod: string;
}
