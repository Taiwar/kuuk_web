import React, { ReactChild, useState } from 'react';
import { AddButton } from '../../../components/buttons/add-button';
import { DeleteButton } from '../../../components/buttons/delete-button';
import { EditButton } from '../../../components/buttons/edit-button';
import {
  GroupDTO,
  IngredientDTO,
  NoteDTO,
  StepDTO,
} from '../../../shared/graphql';
import { DEFAULT_GROUP_NAME, GroupItemTypes } from '../../../shared/constants';
import { AddInputType, UpdateInputType } from '../../../shared/types';
import { IngredientItem } from '../ingredients/ingredient-item';
import { NoteItem } from '../notes/note-item';
import { StepItem } from '../steps/step-item';
import { IngredientForm } from '../ingredients/ingredient-form';
import { StepForm } from '../steps/step-form';
import { NoteForm } from '../notes/note-form';
import { FetchResult, gql, useMutation } from '@apollo/client';
import { MovableItem } from '../../../components/movable-item';
import { Droppable } from 'react-beautiful-dnd';

const REMOVE_GROUP = gql`
  mutation RemoveGroup($groupId: String!) {
    removeGroup(groupID: $groupId) {
      id
      success
    }
  }
`;

export type ItemGroupProps = {
  group: GroupDTO;
  add: (input: AddInputType) => Promise<FetchResult>;
  update: (input: UpdateInputType, prevGroupId: string) => Promise<FetchResult>;
  delete: (id: string, groupId: string, sortNr: number) => Promise<FetchResult>;
  editable: boolean;
};

export function GroupItem(props: ItemGroupProps): JSX.Element {
  const isDefaultGroup = props.group.name === DEFAULT_GROUP_NAME;
  const [itemEditable, setItemEditable] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [removeGroup] = useMutation(REMOVE_GROUP, {
    update(cache, { data: { removeGroup } }) {
      cache.modify({
        id: `RecipeDTO:${props.group.recipeID}`,
        fields: {
          ingredients(existingGroups = []) {
            if (props.group.itemType !== GroupItemTypes.IngredientBE)
              return existingGroups;
            if (removeGroup.success) {
              return existingGroups.filter(
                (i: { __ref: string }) =>
                  `GroupDTO:${removeGroup.id}` !== i.__ref,
              );
            }
          },
          steps(existingGroups = []) {
            if (props.group.itemType !== GroupItemTypes.StepBE)
              return existingGroups;
            if (removeGroup.success) {
              return existingGroups.filter(
                (i: { __ref: string }) =>
                  `GroupDTO:${removeGroup.id}` !== i.__ref,
              );
            }
          },
          notes(existingGroups = []) {
            if (props.group.itemType !== GroupItemTypes.NoteBE)
              return existingGroups;
            if (removeGroup.success) {
              return existingGroups.filter(
                (i: { __ref: string }) =>
                  `GroupDTO:${removeGroup.id}` !== i.__ref,
              );
            }
          },
        },
      });
    },
  });

  function handleClickAdd() {
    setShowItemForm(true);
  }

  function handleClickEdit() {
    setItemEditable(!itemEditable);
  }

  function handleItemAdd(data: AddInputType) {
    return props.add({
      ...data,
      groupID: props.group.id,
    });
  }

  function handleItemDelete(id: string, sortNr: number) {
    return props.delete(id, props.group.id, sortNr);
  }

  function handleGroupDelete() {
    return removeGroup({
      variables: { groupId: props.group.id },
      optimisticResponse: {
        removeGroup: {
          id: props.group.id,
          success: true,
          __typename: 'DeletionResponse',
        },
      },
    });
  }

  let itemForm = null;

  switch (props.group.itemType) {
    case GroupItemTypes.IngredientBE:
      itemForm = (
        <IngredientForm
          onAdd={handleItemAdd}
          showForm={showItemForm}
          setShowForm={setShowItemForm}
        />
      );
      break;
    case GroupItemTypes.StepBE:
      itemForm = (
        <StepForm
          onAdd={handleItemAdd}
          showForm={showItemForm}
          setShowForm={setShowItemForm}
        />
      );
      break;
    case GroupItemTypes.NoteBE:
      itemForm = (
        <NoteForm
          onAdd={handleItemAdd}
          showForm={showItemForm}
          setShowForm={setShowItemForm}
        />
      );
      break;
    default:
      break;
  }

  return (
    <div className="mt-2">
      <div className="flex mb-1">
        <DeleteButton
          hidden={isDefaultGroup || !props.editable}
          className="mr-1"
          onClick={handleGroupDelete}
        />
        <h4 className="text-xl">
          {isDefaultGroup ? 'General' : props.group.name}
        </h4>
        <div hidden={showItemForm} className="flex ml-2 justify-center">
          <AddButton onClick={handleClickAdd} />
          <EditButton
            className="ml-1"
            hidden={props.group.items.length < 1}
            editable={itemEditable}
            onClick={handleClickEdit}
          />
        </div>
      </div>
      <Droppable droppableId={props.group.id}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {[...props.group.items]
              .sort((a, b) => a.sortNr - b.sortNr)
              .map((item, i) => {
                let itemComponent: ReactChild;
                switch (props.group.itemType) {
                  case GroupItemTypes.IngredientBE:
                    itemComponent = (
                      <IngredientItem
                        ingredient={item as IngredientDTO}
                        editable={itemEditable}
                        updateIngredient={(input) =>
                          props.update(input, props.group.id)
                        }
                        deleteIngredient={(id) =>
                          handleItemDelete(id, item.sortNr)
                        }
                      />
                    );
                    break;
                  case GroupItemTypes.StepBE:
                    itemComponent = (
                      <StepItem
                        step={item as StepDTO}
                        editable={itemEditable}
                        updateStep={(input) =>
                          props.update(input, props.group.id)
                        }
                        deleteStep={(id) => handleItemDelete(id, item.sortNr)}
                      />
                    );
                    break;
                  case GroupItemTypes.NoteBE:
                    itemComponent = (
                      <NoteItem
                        note={item as NoteDTO}
                        editable={itemEditable}
                        updateNote={(input) =>
                          props.update(input, props.group.id)
                        }
                        deleteNote={(id) => handleItemDelete(id, item.sortNr)}
                      />
                    );
                    break;
                  default:
                    return <p key={i}>Unknown item {item}</p>;
                }
                return (
                  <MovableItem key={item?.id} id={item?.id} index={item.sortNr}>
                    {itemComponent}
                  </MovableItem>
                );
              })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      {itemForm}
    </div>
  );
}
