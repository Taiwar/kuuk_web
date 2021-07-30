import { Plus, X } from 'react-bootstrap-icons'
import React, { useEffect, useRef } from 'react'
import { AddNoteInput } from '../../../shared/graphql'
import { useForm } from 'react-hook-form'

type NoteFormProps = {
  showForm: boolean,
  setShowForm: (showForm: boolean) => void,
  onAdd: (input: AddNoteInput) => Promise<any>
}

export function NoteForm(props: NoteFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const { register, handleSubmit, reset, setFocus } = useForm<AddNoteInput>()

  useEffect(() => {
    if (props.showForm) {
      window.scrollTo({ top: formRef.current?.offsetTop })
      setFocus('name')
    }
  }, [props.showForm])

  function handleCancel(e: any) {
    e.preventDefault()
    props.setShowForm(false)
  }

  function onSubmit(data: AddNoteInput) {
    props.onAdd(data).then(() => reset())
  }

  return <form ref={formRef} hidden={!props.showForm} onSubmit={handleSubmit(onSubmit)}>
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
}
