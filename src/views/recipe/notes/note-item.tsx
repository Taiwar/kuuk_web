import React, { useState } from 'react'
import { Check, Trash, X } from 'react-bootstrap-icons'
import { useForm } from 'react-hook-form'
import { NoteDTO, UpdateNoteInput } from '../../../shared/graphql'

type NoteItemProps = {
  i: number,
  note: NoteDTO,
  editable: boolean,
  updateNote: (input: UpdateNoteInput) => void,
  deleteNote: (id: string) => void
}

export function NoteItem(props: NoteItemProps) {
  const { note, editable, updateNote, deleteNote, i } = props
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: note.name,
      description: note.description
    }
  })
  const [fieldsEditable, setFieldsEditable] = useState(false)

  function handleOnFormDoubleClick() {
    if (editable) {
      setFieldsEditable(true)
    }
  }

  function onSubmit(data: UpdateNoteInput) {
    const updateNoteInput: UpdateNoteInput = {
      id: note.id,
      name: data.name,
      description: data.description
    }
    updateNote(updateNoteInput)
    setFieldsEditable(false)
  }

  function handleOnDelete() {
    deleteNote(note.id)
  }

  function handleCancel(e: any) {
    e.preventDefault()
    setFieldsEditable(false)
  }

  return <div key={note.id} className="grid grid-cols-12 max-w-3xl">
    <button hidden={!editable} className="col-span-1 h-8 w-8 rounded-full px-2 my-0.5 shadow bg-pink-400 text-white mr-1" onClick={handleOnDelete}>
      <Trash size={16}/>
    </button>
    <form className="col-span-11" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-11 justify-center" onDoubleClick={handleOnFormDoubleClick}>
        <span className="col-span-1 inline-block bg-pink-400 text-white text-center rounded-full mb-1 mr-2 w-7 h-7">{i + 1}</span>

        <span className={`col-span-4 font-bold ${fieldsEditable ? 'hidden' : ''}`}>{note.name}</span>
        <input hidden={!fieldsEditable} required className={`col-span-3 mr-2 h-12 rounded-md border-gray-300 shadow-sm ${fieldsEditable ? '' : 'hidden'}`} type="text" placeholder="Name*" {...register('name')} />

        <p className={`col-span-6 inline ml-1 ${fieldsEditable ? 'hidden' : ''}`}>{note.description}</p>
        <textarea className={`col-span-5 rounded-md border-gray-300 shadow-sm ${!fieldsEditable ? 'hidden' : ''}`} placeholder="Description" {...register('description')} />

        <div className={`col-span-2 ${!fieldsEditable ? 'hidden' : ''}`} >
          <button className="rounded-full p-1 shadow bg-pink-400 text-white ml-1" type="submit">
            <Check size={20}/>
          </button>
          <button className="rounded-full p-1 shadow bg-pink-400 text-white ml-1" onClick={handleCancel}>
            <X size={20}/>
          </button>
        </div>
      </div>
    </form>
  </div>
}
