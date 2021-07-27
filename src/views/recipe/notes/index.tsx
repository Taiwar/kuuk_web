import { gql, useMutation } from '@apollo/client'
import React, { useEffect, useRef, useState } from 'react'
import { Pencil, PencilFill, Plus, X } from 'react-bootstrap-icons'
import { useForm } from 'react-hook-form'
import { AddNoteInput, UpdateNoteInput, NoteDTO } from '../../../shared/graphql'
import { NoteItem } from './note-item'

const ADD_NOTE = gql`
    mutation AddNote($addNoteInput: AddNoteInput!) {
        addNote(addNoteInput: $addNoteInput) {
            id
            name
            description
        }
    }
`

const UPDATE_NOTE = gql`
    mutation UpdateNote($updateNoteInput: UpdateNoteInput!) {
        updateNote(updateNoteInput: $updateNoteInput) {
            id
            name
            description
        }
    }
`

const REMOVE_NOTE = gql`
    mutation RemoveNote($noteId: String!, $recipeId: String!) {
        removeNote(noteID: $noteId, recipeID: $recipeId) {
            id
            success
        }
    }
`

export function RecipeNotes(props: { recipeId: string, notes: NoteDTO[] }) {
  const [editable, setEditable] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const { register, handleSubmit, reset, setFocus } = useForm()
  const [addNote] = useMutation(ADD_NOTE, {
    update(cache, { data: { addNote } }) {
      cache.modify({
        fields: {
          recipeBySlug(recipeBySlugRef) {
            cache.modify({
              id: recipeBySlugRef.__ref,
              fields: {
                notes(existingNotes = []) {
                  const newNoteRef = cache.writeFragment({
                    data: addNote,
                    fragment: gql`
                                    fragment NewNote on NoteDTO {
                                        id
                                        name
                                        description
                                    }
                                `
                  })
                  return [...existingNotes, newNoteRef]
                }
              }
            })
            return recipeBySlugRef
          }
        }
      })
    }
  })
  const [updateNote] = useMutation(UPDATE_NOTE, {
    update(cache, { data: { updateNote } }) {
      cache.modify({
        fields: {
          recipeBySlug(recipeBySlugRef) {
            cache.modify({
              id: recipeBySlugRef.__ref,
              fields: {
                notes(existingNotes = []) {
                  const updatedNoteRef = cache.writeFragment({
                    data: updateNote,
                    fragment: gql`
                                  fragment NewNote on NoteDTO {
                                      id
                                      name
                                      description
                                  }
                              `
                  })
                  return [...existingNotes.filter((i: {__ref: string}) => {
                    return `NoteDTO:${updateNote.id}` !== i.__ref
                  }), updatedNoteRef]
                }
              }
            })
            return recipeBySlugRef
          }
        }
      })
    }
  })
  const [removeNote] = useMutation(REMOVE_NOTE, {
    update(cache, { data: { removeNote } }) {
      cache.modify({
        fields: {
          recipeBySlug(recipeBySlugRef) {
            cache.modify({
              id: recipeBySlugRef.__ref,
              fields: {
                notes(existingNotes = []) {
                  if (removeNote.success) {
                    return existingNotes.filter((i: {__ref: string}) => `NoteDTO:${removeNote.id}` !== i.__ref)
                  }
                  return existingNotes
                }
              }
            })
            return recipeBySlugRef
          }
        }
      })
    }
  })

  function onAddNoteSubmit(data: AddNoteInput) {
    const addNoteInput: AddNoteInput = {
      recipeID: props.recipeId,
      name: data.name,
      description: data.description
    }
    addNote({
      variables: { addNoteInput },
      optimisticResponse: {
        addNote: {
          __typename: 'NoteDTO',
          id: 'temp-id',
          name: addNoteInput.name,
          description: addNoteInput.description
        }
      }
    }).then(() => {
      reset()
    })
  }

  function onUpdateNoteSubmit(updateNoteInput: UpdateNoteInput) {
    updateNote({
      variables: { updateNoteInput },
      optimisticResponse: {
        updateNote: {
          __typename: 'NoteDTO',
          id: updateNoteInput.id,
          name: updateNoteInput.name,
          description: updateNoteInput.description
        }
      }
    })
  }

  function onDeleteNoteSubmit(noteId: string) {
    removeNote({
      variables: { noteId, recipeId: props.recipeId },
      optimisticResponse: {
        removeNote: {
          __typename: 'DeletionResponse',
          id: noteId,
          success: true
        }
      }
    })
  }

  function handleClickAdd() {
    setShowForm(true)
  }

  function handleClickEdit() {
    setEditable(!editable)
  }

  function handleCancel(e: any) {
    e.preventDefault()
    setShowForm(false)
  }

  useEffect(() => {
    if (showForm) {
      window.scrollTo({ top: formRef.current?.offsetTop })
      setFocus('name')
    }
  }, [showForm])

  return <div>
    <div className="flex">
      <h4 className="flex text-2xl my-3">Notes</h4>
      <div hidden={showForm} className="flex ml-2 mt-3 justify-center">
        <button className="rounded-full p-1.5 h-9 shadow bg-pink-400 text-white hover:shadow-lg" onClick={handleClickAdd}>
          <Plus size={24}/>
        </button>
        <button hidden={props.notes.length < 1} className="rounded-full p-3 h-9 shadow bg-pink-400 text-white ml-1 hover:shadow-lg" onClick={handleClickEdit}>
          { editable ? <Pencil size={12} /> : <PencilFill size={12}/> }
        </button>
      </div>
    </div>
    <div className="mb-4">
      {
        props.notes?.map((note: NoteDTO, i) => {
          return <NoteItem i={i} key={note.id} note={note} editable={editable} updateNote={onUpdateNoteSubmit} deleteNote={onDeleteNoteSubmit}/>
        })
      }
    </div>
    <form ref={formRef} hidden={!showForm} onSubmit={handleSubmit(onAddNoteSubmit)}>
      <div className="grid grid-cols-5 gap-1 lg:w-1/2">
        <div className="col-span-1">
          <input required className="block w-full rounded-md border-gray-300 shadow-sm" type="text" placeholder="Name*" {...register('name')} />
        </div>
        <div className="col-span-3">
          <textarea className="block w-full rounded-md border-gray-300 shadow-sm" placeholder="Description" {...register('description')} />
        </div>
        <div className="col-span-1">
          <button className="rounded-full p-1.5 shadow bg-pink-400 text-white" type="submit">
            <Plus size={32}/>
          </button>
          <button className="rounded-full p-1.5 shadow bg-pink-400 text-white ml-1" onClick={handleCancel}>
            <X size={32}/>
          </button>
        </div>
      </div>
    </form>
  </div>
}
