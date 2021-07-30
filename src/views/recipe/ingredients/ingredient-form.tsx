import { Plus, X } from 'react-bootstrap-icons'
import React, { useEffect, useRef } from 'react'
import { AddIngredientInput } from '../../../shared/graphql'
import { useForm } from 'react-hook-form'

type IngredientFormProps = {
  showForm: boolean,
  setShowForm: (showForm: boolean) => void,
  onAdd: (input: AddIngredientInput) => Promise<any>
}

export function IngredientForm(props: IngredientFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const { register, handleSubmit, reset, setFocus } = useForm<AddIngredientInput>()

  useEffect(() => {
    if (props.showForm) {
      window.scrollTo({ top: formRef.current?.offsetTop })
      setFocus('amount')
    }
  }, [props.showForm])

  function handleCancel(e: any) {
    e.preventDefault()
    props.setShowForm(false)
  }

  function onSubmit(data: AddIngredientInput) {
    props.onAdd(data).then(() => reset())
  }

  return <form ref={formRef} hidden={!props.showForm} onSubmit={handleSubmit(onSubmit)}>
    <div className="grid grid-cols-7 gap-1 lg:w-1/2">
      <div className="col-span-2">
        <input required className="block w-full rounded-md border-gray-300 shadow-sm" type="number" placeholder="Amount*" {...register('amount')} />
      </div>
      <div className="col-span-1">
        <input required className="block w-full rounded-md border-gray-300 shadow-sm" type="text" placeholder="Unit*" {...register('unit')}/>
      </div>
      <div className="col-span-3">
        <input required className="block w-full rounded-md border-gray-300 shadow-sm" type="text" placeholder="Name*" {...register('name')} />
      </div>
      <div className="col">
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
