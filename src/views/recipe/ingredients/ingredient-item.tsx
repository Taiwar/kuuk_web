import React, { useState } from 'react'
import { Check, Trash, X } from 'react-bootstrap-icons'
import { useForm } from 'react-hook-form'
import { IngredientDTO, UpdateIngredientInput } from '../../../shared/graphql'

type IngredientItemProps = {
  ingredient: IngredientDTO,
  editable: boolean,
  updateIngredient: (input: UpdateIngredientInput) => void,
  deleteIngredient: (id: string) => void
}

export function IngredientItem(props: IngredientItemProps) {
  const { ingredient, editable, updateIngredient, deleteIngredient } = props
  const { register, handleSubmit } = useForm({
    defaultValues: {
      amount: ingredient.amount,
      unit: ingredient.unit,
      name: ingredient.name
    }
  })
  const [fieldsEditable, setFieldsEditable] = useState(false)

  function handleOnFormDoubleClick() {
    if (editable) {
      setFieldsEditable(true)
    }
  }

  function onSubmit(data: UpdateIngredientInput & { amount: string }) {
    const updateIngredientInput: UpdateIngredientInput = {
      id: ingredient.id,
      name: data.name,
      amount: parseFloat(data.amount),
      unit: data.unit
    }
    updateIngredient(updateIngredientInput)
    setFieldsEditable(false)
  }

  function handleOnDelete() {
    deleteIngredient(ingredient.id)
  }

  function handleCancel(e: any) {
    e.preventDefault()
    setFieldsEditable(false)
  }

  return <div className="flex">
    <p>{ingredient.sortNr}</p>
    <button hidden={!editable} className="rounded-full p-1 shadow bg-pink-400 text-white ml-1" onClick={handleOnDelete}>
      <Trash size={16}/>
    </button>
    <input className="mx-2 mt-1" type="checkbox" />
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex-1 inline" onDoubleClick={handleOnFormDoubleClick}>
        <span hidden={fieldsEditable} className="font-bold">{ingredient.amount}</span>
        <input hidden={!fieldsEditable} required className={`mx-2 w-20 rounded-md border-gray-300 shadow-sm ${fieldsEditable ? '' : 'hidden'}`} type="number" placeholder="Amount*" {...register('amount')}/>
        <span hidden={fieldsEditable} className="font-bold mr-1">{ingredient.unit}</span>
        <input hidden={!fieldsEditable} required className={`mx-2 w-20 rounded-md border-gray-300 shadow-sm ${fieldsEditable ? '' : 'hidden'}`} type="text" placeholder="Unit*" {...register('unit')}/>
        <span hidden={fieldsEditable}>{ingredient.name}</span>
        <input hidden={!fieldsEditable} required className={`mx-2 w-50 rounded-md border-gray-300 shadow-sm ${fieldsEditable ? '' : 'hidden'}`} type="text" placeholder="Name*" {...register('name')}/>
        <div className={`inline ${!fieldsEditable ? 'hidden' : ''}`} >
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
