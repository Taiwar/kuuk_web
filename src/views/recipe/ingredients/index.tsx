import React from 'react';
import { gql, useMutation } from '@apollo/client';
import {
  AddIngredientInput,
  GroupDTO,
  UpdateIngredientInput,
} from '../../../shared/graphql';
import { RecipeItemsSection } from '../items-section';
import { GroupItemTypes } from '../../../shared/constants';
import CacheHelper from '../../../shared/cache-helper';

const ADD_INGREDIENT = gql`
  mutation AddIngredient($addIngredientInput: AddIngredientInput!) {
    addIngredient(addIngredientInput: $addIngredientInput) {
      id
      name
      amount
      unit
      groupID
      sortNr
    }
  }
`;

const UPDATE_INGREDIENT = gql`
  mutation UpdateIngredient($updateIngredientInput: UpdateIngredientInput!) {
    updateIngredient(updateIngredientInput: $updateIngredientInput) {
      item {
        ... on IngredientDTO {
          id
          name
          amount
          unit
          groupID
          sortNr
        }
      }
      prevGroupID
      prevSortNr
    }
  }
`;

const REMOVE_INGREDIENT = gql`
  mutation RemoveIngredient($ingredientId: String!) {
    removeIngredient(ingredientID: $ingredientId) {
      id
      groupID
      success
      sortNr
    }
  }
`;

type RecipeIngredientsProps = {
  recipeId: string;
  ingredientGroups: GroupDTO[];
};

export function RecipeIngredients(props: RecipeIngredientsProps): JSX.Element {
  const [addIngredient, addResult] = useMutation(ADD_INGREDIENT, {
    update(cache, { data: { addIngredient } }) {
      CacheHelper.addItem(cache, addIngredient, GroupItemTypes.IngredientBE);
    },
  });

  const [updateIngredient, updateResult] = useMutation(UPDATE_INGREDIENT, {
    update(cache, { data: { updateIngredient } }) {
      CacheHelper.updateItem(
        cache,
        updateIngredient,
        GroupItemTypes.IngredientBE,
      );
    },
  });

  const [removeIngredient, removeResult] = useMutation(REMOVE_INGREDIENT, {
    update(cache, { data: { removeIngredient } }) {
      CacheHelper.removeItem(
        cache,
        removeIngredient,
        GroupItemTypes.IngredientBE,
      );
    },
  });

  // if (addResult.loading || updateResult.loading || removeResult.loading) return <LoadingSpinner/>
  if (addResult.error || updateResult.error || removeResult.error) {
    const error =
      addResult.error ?? updateResult.error ?? removeResult.error ?? '';
    return <p>Error {error.toString()}</p>;
  }

  function onAddIngredientSubmit(
    input: AddIngredientInput & { amount: string } & any,
  ) {
    const addIngredientInput: AddIngredientInput = {
      recipeID: props.recipeId,
      name: input.name,
      amount: parseFloat(input.amount),
      unit: input.unit,
      groupID: input.groupID,
    };
    return addIngredient({
      variables: { addIngredientInput },
      optimisticResponse: {
        addIngredient: {
          id: 'temp-id',
          name: addIngredientInput.name,
          amount: addIngredientInput.amount,
          unit: addIngredientInput.unit,
          sortNr: props.ingredientGroups.filter(
            (g) => g.id === input.groupID,
          )[0].items.length,
          groupID: addIngredientInput.groupID,
          __typename: 'IngredientDTO',
        },
      },
    });
  }

  function onUpdateIngredientSubmit(
    updateIngredientInput: UpdateIngredientInput,
    prevGroupId: string,
    prevSortNr?: number,
  ) {
    return updateIngredient({
      variables: { updateIngredientInput },
      optimisticResponse: {
        updateIngredient: {
          item: {
            id: updateIngredientInput.id,
            name: updateIngredientInput.name,
            amount: updateIngredientInput.amount,
            unit: updateIngredientInput.unit,
            groupID: updateIngredientInput.groupID,
            sortNr: updateIngredientInput.sortNr,
          },
          prevGroupID: prevGroupId,
          prevSortNr,
          __typename: 'GroupItemUpdateResponse',
        },
      },
    });
  }

  function onDeleteIngredientSubmit(
    ingredientId: string,
    groupId: string,
    sortNr: number,
  ) {
    return removeIngredient({
      variables: { ingredientId },
      optimisticResponse: {
        removeIngredient: {
          id: ingredientId,
          groupID: groupId,
          success: true,
          sortNr,
          __typename: 'GroupItemDeletionResponse',
        },
      },
    });
  }

  return (
    <RecipeItemsSection
      recipeId={props.recipeId}
      title={'Ingredients'}
      groups={props.ingredientGroups}
      itemType={GroupItemTypes.IngredientBE}
      add={onAddIngredientSubmit}
      update={onUpdateIngredientSubmit}
      delete={onDeleteIngredientSubmit}
    />
  );
}
