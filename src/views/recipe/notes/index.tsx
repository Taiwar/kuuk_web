import { gql, useMutation } from '@apollo/client'
import React from 'react'
import { AddNoteInput, UpdateNoteInput, GroupDTO } from '../../../shared/graphql'
import { GroupItemTypes } from '../../../shared/constants'
import { RecipeItemsSection } from '../items-section'

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
`

const UPDATE_NOTE = gql`
    mutation UpdateNote($updateNoteInput: UpdateNoteInput!) {
        updateNote(updateNoteInput: $updateNoteInput) {
            id
            name
            description
            groupID
            sortNr
        }
    }
`

const REMOVE_NOTE = gql`
    mutation RemoveNote($noteId: String!) {
        removeNote(noteID: $noteId) {
            id
            groupID
            success
        }
    }
`

export function RecipeNotes(props: { recipeId: string, noteGroups: GroupDTO[] }) {
  const [addNote] = useMutation(ADD_NOTE, {
    update(cache, { data: { addNote } }) {
      cache.modify({
        id: `GroupDTO:${addNote.groupID}`,
        fields: {
          items(existingItems = []) {
            const ref = cache.writeFragment({
              data: addNote,
              fragment: gql`
                              fragment NewNote on NoteDTO {
                                  id
                                  name
                                  description
                                  groupID
                                  sortNr
                              }
                          `
            })
            return [...existingItems, ref]
          }
        }
      })
    }
  })
  const [updateNote] = useMutation(UPDATE_NOTE, {
    update(cache, { data: { updateNote } }) {
      cache.modify({
        id: `GroupDTO:${updateNote.groupID}`,
        fields: {
          items(existingItems = []) {
            const ref = cache.writeFragment({
              data: updateNote,
              fragment: gql`
                              fragment NewNote on NoteDTO {
                                  id
                                  name
                                  description
                                  groupID
                                  sortNr
                              }
                          `
            })
            return [...existingItems.filter((i: {__ref: string}) => {
              return `NoteDTO:${updateNote.id}` !== i.__ref
            }), ref]
          }
        }
      })
    }
  })
  const [removeNote] = useMutation(REMOVE_NOTE, {
    update(cache, { data: { removeNote } }) {
      cache.modify({
        id: `GroupDTO:${removeNote.groupID}`,
        fields: {
          items(existingItems = []) {
            if (removeNote.success) {
              return existingItems.filter((i: {__ref: string}) => `NoteDTO:${removeNote.id}` !== i.__ref)
            }
            return existingItems
          }
        }
      })
    }
  })

  function onAddNoteSubmit(data: AddNoteInput) {
    const addNoteInput: AddNoteInput = {
      recipeID: props.recipeId,
      name: data.name,
      description: data.description,
      groupID: data.groupID
    }
    return addNote({
      variables: { addNoteInput },
      optimisticResponse: {
        addNote: {
          id: 'temp-id',
          name: addNoteInput.name,
          description: addNoteInput.description,
          groupID: addNoteInput.groupID,
          sortNr: 1,
          __typename: 'NoteDTO'
        }
      }
    })
  }

  function onUpdateNoteSubmit(updateNoteInput: UpdateNoteInput) {
    return updateNote({
      variables: { updateNoteInput },
      optimisticResponse: {
        updateNote: {
          id: updateNoteInput.id,
          name: updateNoteInput.name,
          description: updateNoteInput.description,
          groupID: updateNoteInput.groupID,
          sortNr: updateNoteInput.sortNr,
          __typename: 'NoteDTO'
        }
      }
    })
  }

  function onDeleteNoteSubmit(noteId: string, groupId: string) {
    return removeNote({
      variables: { noteId },
      optimisticResponse: {
        removeNote: {
          id: noteId,
          groupID: groupId,
          success: true,
          __typename: 'GroupItemDeletionResponse'
        }
      }
    })
  }

  return <RecipeItemsSection
      recipeId={props.recipeId}
      title={'Notes'}
      groups={props.noteGroups}
      itemType={GroupItemTypes.NoteBE}
      add={onAddNoteSubmit}
      update={onUpdateNoteSubmit}
      delete={onDeleteNoteSubmit}
  />
}
