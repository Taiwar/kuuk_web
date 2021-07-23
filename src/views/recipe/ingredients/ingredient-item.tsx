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
  const [fieldsEditable, setFieldsEditable] = useState({ amount: false, unit: false, name: false })

  function handleOnItemDoubleClick(fieldName: string) {
    if (editable) {
      const newFieldsEditable: any = {
        amount: false,
        unit: false,
        name: false
      }
      newFieldsEditable[fieldName] = true
      setFieldsEditable(newFieldsEditable)
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
    setFieldsEditable({
      amount: false,
      unit: false,
      name: false
    })
  }

  function handleOnDelete(id: string) {
    deleteIngredient(id)
  }

  function handleCancel(e: any) {
    e.preventDefault()
    setFieldsEditable({
      amount: false,
      unit: false,
      name: false
    })
  }

  console.log(fieldsEditable, !fieldsEditable.amount && !fieldsEditable.unit && !fieldsEditable.name)

  return <div key={ingredient.id} className="flex">
    <button hidden={!editable} className="rounded-full p-1 shadow bg-pink-400 text-white ml-1" onClick={() => handleOnDelete(ingredient.id)}>
      <Trash size={16}/>
    </button>
    <input className="mx-2 mt-1" type="checkbox" />
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex-1 inline">
        <span hidden={fieldsEditable.amount} className="font-bold" onDoubleClick={() => handleOnItemDoubleClick('amount')}>{ingredient.amount}</span>
        <input hidden={!fieldsEditable.amount} required className={`mx-2 w-20 rounded-md border-gray-300 shadow-sm ${fieldsEditable.amount ? '' : 'hidden'}`} type="number" placeholder="Amount*" {...register('amount')}/>
        <span hidden={fieldsEditable.unit} className="font-bold mr-1" onDoubleClick={() => handleOnItemDoubleClick('unit')}>{ingredient.unit}</span>
        <input hidden={!fieldsEditable.unit} required className={`mx-2 w-20 rounded-md border-gray-300 shadow-sm ${fieldsEditable.unit ? '' : 'hidden'}`} type="text" placeholder="Unit*" {...register('unit')}/>
        <span hidden={fieldsEditable.name} onDoubleClick={() => handleOnItemDoubleClick('name')}>{ingredient.name}</span>
        <input hidden={!fieldsEditable.name} required className={`mx-2 w-50 rounded-md border-gray-300 shadow-sm ${fieldsEditable.name ? '' : 'hidden'}`} type="text" placeholder="Name*" {...register('name')}/>
        <div className={`inline ${!fieldsEditable.amount && !fieldsEditable.unit && !fieldsEditable.name ? 'hidden' : ''}`} >
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
