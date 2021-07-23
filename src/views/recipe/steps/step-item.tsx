import React, { useState } from 'react'
import { Check, Trash, X } from 'react-bootstrap-icons'
import { useForm } from 'react-hook-form'
import { StepDTO, UpdateStepInput } from '../../../shared/graphql'

type StepItemProps = {
  i: number,
  step: StepDTO,
  editable: boolean,
  updateStep: (input: UpdateStepInput) => void,
  deleteStep: (id: string) => void
}

export function StepItem(props: StepItemProps) {
  const { step, editable, updateStep, deleteStep, i } = props
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: step.name,
      description: step.description
    }
  })
  const [fieldsEditable, setFieldsEditable] = useState({ name: false, description: false })

  function handleOnItemDoubleClick(fieldName: string) {
    if (editable) {
      const newFieldsEditable: any = {
        name: false,
        description: false
      }
      newFieldsEditable[fieldName] = true
      setFieldsEditable(newFieldsEditable)
    }
  }

  function onSubmit(data: UpdateStepInput) {
    const updateStepInput: UpdateStepInput = {
      id: step.id,
      name: data.name,
      description: data.description
    }
    updateStep(updateStepInput)
    setFieldsEditable({
      name: false,
      description: false
    })
  }

  function handleOnDelete(id: string) {
    deleteStep(id)
  }

  function handleCancel(e: any) {
    e.preventDefault()
    setFieldsEditable({
      name: false,
      description: false
    })
  }

  return <div key={step.id} className="flex">
    <button hidden={!editable} className="rounded-full p-1 shadow bg-pink-400 text-white ml-1" onClick={() => handleOnDelete(step.id)}>
      <Trash size={16}/>
    </button>
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex-1">
        <span className="inline-block bg-pink-400 text-white text-center rounded-full mb-1 mr-2 w-7 h-7">{i + 1}</span>
        <span className={`font-bold ${fieldsEditable.name ? 'hidden' : ''}`} onDoubleClick={() => handleOnItemDoubleClick('name')}>{step.name}</span>
        <input hidden={!fieldsEditable.name} required className={`mx-2 w-50 rounded-md border-gray-300 shadow-sm ${fieldsEditable.name ? '' : 'hidden'}`} type="text" placeholder="Name*" {...register('name')} />
        <p className={`inline ml-1 ${fieldsEditable.description ? 'hidden' : ''}`} onDoubleClick={() => handleOnItemDoubleClick('description')}>{step.description}</p>
        <textarea className={`block w-full rounded-md border-gray-300 shadow-sm ${!fieldsEditable.description ? 'hidden' : ''}`} placeholder="Description" {...register('description')} />
        <div className={`inline ${!fieldsEditable.name && !fieldsEditable.description ? 'hidden' : ''}`} >
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
