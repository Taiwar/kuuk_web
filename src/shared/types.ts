import {
  AddIngredientInput,
  AddNoteInput,
  AddStepInput,
  UpdateIngredientInput,
  UpdateNoteInput,
  UpdateStepInput,
} from './graphql';

export type AddInputType =
  | AddNoteInput
  | AddStepInput
  | (AddIngredientInput & { amount: string });
export type UpdateInputType =
  | UpdateNoteInput
  | UpdateStepInput
  | UpdateIngredientInput;
