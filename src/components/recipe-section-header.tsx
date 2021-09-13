import React, { useState } from 'react';
import { GroupForm } from '../views/recipe/groups/group-form';
import { gql, useMutation } from '@apollo/client';
import { GroupItemTypes } from '../shared/constants';
import { AddGroupInput } from '../shared/graphql';
import { Pencil, PencilFill, Plus } from 'react-bootstrap-icons';

const ADD_GROUP = gql`
  mutation AddGroup($addGroupInput: AddGroupInput!) {
    addGroup(addGroupInput: $addGroupInput) {
      id
      recipeID
      name
      itemType
      sortNr
    }
  }
`;

const NEW_GROUP_FRAGMENT = gql`
  fragment NewGroup on GroupDTO {
    id
    recipeID
    name
    itemType
    sortNr
  }
`;

type RecipeSectionHeaderProps = {
  recipeId: string;
  title: string;
  itemType: GroupItemTypes;
  editable: boolean;
  setEditable: React.Dispatch<React.SetStateAction<boolean>>;
};

export function RecipeSectionHeader(
  props: RecipeSectionHeaderProps,
): JSX.Element {
  const [showForm, setShowForm] = useState(false);
  const [addGroup] = useMutation(ADD_GROUP, {
    update(cache, { data: { addGroup } }) {
      cache.modify({
        id: `RecipeDTO:${addGroup.recipeID}`,
        fields: {
          ingredients(existingGroups = []) {
            if (addGroup.itemType !== GroupItemTypes.IngredientBE)
              return existingGroups;
            const ref = cache.writeFragment({
              data: addGroup,
              fragment: NEW_GROUP_FRAGMENT,
            });
            return [...existingGroups, ref];
          },
          steps(existingGroups = []) {
            if (addGroup.itemType !== GroupItemTypes.StepBE)
              return existingGroups;
            const ref = cache.writeFragment({
              data: addGroup,
              fragment: NEW_GROUP_FRAGMENT,
            });
            return [...existingGroups, ref];
          },
          notes(existingGroups = []) {
            if (addGroup.itemType !== GroupItemTypes.NoteBE)
              return existingGroups;
            const ref = cache.writeFragment({
              data: addGroup,
              fragment: NEW_GROUP_FRAGMENT,
            });
            return [...existingGroups, ref];
          },
        },
      });
    },
  });

  function handleCreate(data: AddGroupInput) {
    const addGroupInput: AddGroupInput = {
      recipeID: props.recipeId,
      name: data.name,
      itemType: props.itemType,
    };
    return addGroup({
      variables: { addGroupInput },
      // TODO: Fix optimistic response
      /* optimisticResponse: {
        addGroup: {
          id: 'temp-id',
          recipeID: addGroupInput.recipeID,
          name: addGroupInput.name,
          itemType: addGroupInput.itemType,
          sortNr: 1,
          __typename: 'GroupDTO'
        }
      } */
    });
  }

  function handleClickAdd() {
    setShowForm(true);
  }

  function handleOnEditClick() {
    props.setEditable(!props.editable);
  }

  return (
    <div>
      <div className="flex">
        <h4 className="flex text-2xl my-3">{props.title}</h4>
        <div hidden={showForm} className="flex ml-2 justify-center">
          <button
            className="rounded-full h-8 w-8 shadow bg-pink-400 text-white hover:shadow-lg pl-1 mt-3.5"
            onClick={handleClickAdd}
          >
            <Plus size={24} />
          </button>
          <button
            className="rounded-full h-8 w-8 shadow bg-pink-400 text-white hover:shadow-lg pl-2.5 ml-1 mt-3.5"
            onClick={handleOnEditClick}
          >
            {props.editable ? <Pencil size={12} /> : <PencilFill size={12} />}
          </button>
        </div>
      </div>
      <GroupForm
        showForm={showForm}
        setShowForm={setShowForm}
        onCreate={handleCreate}
      />
    </div>
  );
}
