import { FetchResult, gql, useMutation } from '@apollo/client';
import React from 'react';
import {
  AddNoteInput,
  UpdateNoteInput,
  GroupDTO,
  NoteDTO,
} from '../../../shared/graphql';
import { GroupItemTypes } from '../../../shared/constants';
import { RecipeItemsSection } from '../items-section';
import CacheHelper from '../../../shared/cache-helper';

const ADD_NOTE = gql`
  mutation AddNote($addNoteInput: AddNoteInput!) {
    addNote(addNoteInput: $addNoteInput) {
      id
      name
      description
      groupID
      sortNr
    }
  }
`;

const UPDATE_NOTE = gql`
  mutation UpdateNote($updateNoteInput: UpdateNoteInput!) {
    updateNote(updateNoteInput: $updateNoteInput) {
      item {
        ... on NoteDTO {
          id
          name
          description
          groupID
          sortNr
        }
      }
      prevSortNr
      prevGroupID
    }
  }
`;

const REMOVE_NOTE = gql`
  mutation RemoveNote($noteId: String!) {
    removeNote(noteID: $noteId) {
      id
      groupID
      success
      sortNr
    }
  }
`;

type RecipeNotesProps = {
  recipeId: string;
  noteGroups: GroupDTO[];
};

export function RecipeNotes(props: RecipeNotesProps): JSX.Element {
  const [addNote, addResult] = useMutation(ADD_NOTE, {
    update(cache, { data: { addNote } }) {
      CacheHelper.addItem(cache, addNote, GroupItemTypes.NoteBE);
    },
  });
  const [updateNote, updateResult] = useMutation(UPDATE_NOTE, {
    update(cache, { data: { updateNote } }) {
      CacheHelper.updateItem(cache, updateNote, GroupItemTypes.NoteBE);
    },
  });
  const [removeNote, removeResult] = useMutation(REMOVE_NOTE, {
    update(cache, { data: { removeNote } }) {
      CacheHelper.removeItem(cache, removeNote, GroupItemTypes.NoteBE);
    },
  });

  // if (addResult.loading || updateResult.loading || removeResult.loading) return <LoadingSpinner />
  if (addResult.error || updateResult.error || removeResult.error) {
    const error =
      addResult.error ?? updateResult.error ?? removeResult.error ?? '';
    return <p>Error {error.toString()}</p>;
  }

  function onAddNoteSubmit(data: AddNoteInput): Promise<FetchResult<NoteDTO>> {
    const addNoteInput: AddNoteInput = {
      recipeID: props.recipeId,
      name: data.name,
      description: data.description,
      groupID: data.groupID,
    };
    return addNote({
      variables: { addNoteInput },
      optimisticResponse: {
        addNote: {
          id: 'temp-id',
          name: addNoteInput.name,
          description: addNoteInput.description,
          sortNr: props.noteGroups.filter((g) => g.id === data.groupID)[0].items
            .length,
          groupID: addNoteInput.groupID,
          __typename: 'NoteDTO',
        },
      },
    });
  }

  function onUpdateNoteSubmit(
    updateNoteInput: UpdateNoteInput,
    prevGroupId: string,
    prevSortNr?: number,
  ) {
    return updateNote({
      variables: { updateNoteInput },
      optimisticResponse: {
        updateNote: {
          item: {
            id: updateNoteInput.id,
            name: updateNoteInput.name,
            description: updateNoteInput.description,
            groupID: updateNoteInput.groupID,
            sortNr: updateNoteInput.sortNr,
          },
          prevGroupID: prevGroupId,
          prevSortNr,
          __typename: 'GroupItemUpdateResponse',
        },
      },
    });
  }

  function onDeleteNoteSubmit(noteId: string, groupId: string, sortNr: number) {
    return removeNote({
      variables: { noteId },
      optimisticResponse: {
        removeNote: {
          id: noteId,
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
      title={'Notes'}
      groups={props.noteGroups}
      itemType={GroupItemTypes.NoteBE}
      add={onAddNoteSubmit}
      update={onUpdateNoteSubmit}
      delete={onDeleteNoteSubmit}
    />
  );
}
