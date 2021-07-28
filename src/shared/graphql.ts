
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export interface FilterRecipesInput {
    name?: Nullable<string>;
    tags?: Nullable<string[]>;
}

export interface CreateRecipeInput {
    name: string;
    slug?: Nullable<string>;
    author?: Nullable<string>;
    prepTimeMin?: Nullable<number>;
    cookTimeMin?: Nullable<number>;
    totalTimeMin?: Nullable<number>;
    servings: number;
    rating?: Nullable<number>;
    description?: Nullable<string>;
    notes?: Nullable<string[]>;
    sourceLinks?: Nullable<string[]>;
    tags?: Nullable<string[]>;
    pictures?: Nullable<string[]>;
}

export interface UpdateRecipeInput {
    id: string;
    name?: Nullable<string>;
    slug?: Nullable<string>;
    author?: Nullable<string>;
    prepTimeMin?: Nullable<number>;
    cookTimeMin?: Nullable<number>;
    totalTimeMin?: Nullable<number>;
    servings?: Nullable<number>;
    rating?: Nullable<number>;
    description?: Nullable<string>;
    notes?: Nullable<string[]>;
    sourceLinks?: Nullable<string[]>;
    tags?: Nullable<string[]>;
    pictures?: Nullable<string[]>;
}

export interface AddIngredientInput {
    recipeID: string;
    name: string;
    amount: number;
    unit: string;
    group?: Nullable<string>;
}

export interface UpdateIngredientInput {
    id: string;
    name?: Nullable<string>;
    amount?: Nullable<number>;
    unit?: Nullable<string>;
    sortNr?: Nullable<number>;
    group?: Nullable<string>;
}

export interface AddStepInput {
    recipeID: string;
    name: string;
    description?: Nullable<string>;
    picture?: Nullable<string>;
    group?: Nullable<string>;
}

export interface UpdateStepInput {
    id: string;
    name?: Nullable<string>;
    description?: Nullable<string>;
    picture?: Nullable<string>;
    sortNr?: Nullable<number>;
    group?: Nullable<string>;
}

export interface AddNoteInput {
    recipeID: string;
    name: string;
    description?: Nullable<string>;
    group?: Nullable<string>;
}

export interface UpdateNoteInput {
    id: string;
    name?: Nullable<string>;
    description?: Nullable<string>;
    sortNr?: Nullable<number>;
    group?: Nullable<string>;
}

export interface OrderedRecipeItem {
    id: string;
    name: string;
    sortNr: number;
    group?: Nullable<string>;
}

export interface StepDTO extends OrderedRecipeItem {
    id: string;
    name: string;
    description?: Nullable<string>;
    picture?: Nullable<string>;
    sortNr: number;
    group?: Nullable<string>;
}

export interface NoteDTO {
    id: string;
    name: string;
    description?: Nullable<string>;
    sortNr: number;
    group?: Nullable<string>;
}

export interface IngredientDTO {
    id: string;
    name: string;
    amount: number;
    unit: string;
    sortNr: number;
    group?: Nullable<string>;
}

export interface RecipeDTO {
    id: string;
    name: string;
    slug: string;
    author?: Nullable<string>;
    prepTimeMin?: Nullable<number>;
    cookTimeMin?: Nullable<number>;
    totalTimeMin?: Nullable<number>;
    servings: number;
    rating?: Nullable<number>;
    description?: Nullable<string>;
    sourceLinks: string[];
    tags: string[];
    pictures: string[];
    ingredients?: Nullable<IngredientDTO[]>;
    steps?: Nullable<StepDTO[]>;
    notes?: Nullable<NoteDTO[]>;
}

export interface DeletionResponse {
    id: string;
    success: boolean;
}

export interface IQuery {
    recipes(): RecipeDTO[] | Promise<RecipeDTO[]>;
    tags(): string[] | Promise<string[]>;
    ingredientNames(): string[] | Promise<string[]>;
    filterRecipes(filterRecipesInput?: Nullable<FilterRecipesInput>): Nullable<RecipeDTO>[] | Promise<Nullable<RecipeDTO>[]>;
    recipe(id: string): Nullable<RecipeDTO> | Promise<Nullable<RecipeDTO>>;
    recipeBySlug(slug: string): Nullable<RecipeDTO> | Promise<Nullable<RecipeDTO>>;
}

export interface IMutation {
    createRecipe(createRecipeInput?: Nullable<CreateRecipeInput>): Nullable<RecipeDTO> | Promise<Nullable<RecipeDTO>>;
    updateRecipe(updateRecipeInput?: Nullable<UpdateRecipeInput>): Nullable<RecipeDTO> | Promise<Nullable<RecipeDTO>>;
    deleteRecipe(id: string): Nullable<DeletionResponse> | Promise<Nullable<DeletionResponse>>;
    addIngredient(addIngredientInput?: Nullable<AddIngredientInput>): Nullable<IngredientDTO> | Promise<Nullable<IngredientDTO>>;
    updateIngredient(updateIngredientInput?: Nullable<UpdateIngredientInput>): Nullable<IngredientDTO> | Promise<Nullable<IngredientDTO>>;
    removeIngredient(ingredientID: string, recipeID?: Nullable<string>): Nullable<DeletionResponse> | Promise<Nullable<DeletionResponse>>;
    addStep(addStepInput?: Nullable<AddStepInput>): Nullable<StepDTO> | Promise<Nullable<StepDTO>>;
    updateStep(updateStepInput?: Nullable<UpdateStepInput>): Nullable<StepDTO> | Promise<Nullable<StepDTO>>;
    removeStep(stepID: string, recipeID?: Nullable<string>): Nullable<DeletionResponse> | Promise<Nullable<DeletionResponse>>;
    addNote(addNoteInput?: Nullable<AddNoteInput>): Nullable<NoteDTO> | Promise<Nullable<NoteDTO>>;
    updateNote(updateNoteInput?: Nullable<UpdateNoteInput>): Nullable<NoteDTO> | Promise<Nullable<NoteDTO>>;
    removeNote(noteID: string, recipeID?: Nullable<string>): Nullable<DeletionResponse> | Promise<Nullable<DeletionResponse>>;
}

type Nullable<T> = T | null;
