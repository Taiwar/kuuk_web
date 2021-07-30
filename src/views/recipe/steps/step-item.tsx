import React, { useState } from 'react'
import { Check, Trash, X } from 'react-bootstrap-icons'
import { useForm } from 'react-hook-form'
import { StepDTO, UpdateStepInput } from '../../../shared/graphql'

type StepItemProps = {
  step: StepDTO,
  editable: boolean,
  updateStep: (input: UpdateStepInput) => void,
  deleteStep: (id: string) => void
}

export function StepItem(props: StepItemProps) {
  const { step, editable, updateStep, deleteStep } = props
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: step.name,
      description: step.description
    }
  })
  const [fieldsEditable, setFieldsEditable] = useState(false)

  function handleOnFormDoubleClick() {
    if (editable) {
      setFieldsEditable(true)
    }
  }

  function onSubmit(data: UpdateStepInput) {
    const updateStepInput: UpdateStepInput = {
      id: step.id,
      name: data.name,
      description: data.description
    }
    updateStep(updateStepInput)
    setFieldsEditable(false)
  }

  function handleOnDelete() {
    deleteStep(step.id)
  }

  function handleCancel(e: any) {
    e.preventDefault()
    setFieldsEditable(false)
  }

  console.log('step', step)

  return <div key={step.id} className="grid grid-cols-12 max-w-3xl">
    <button hidden={!editable} className="col-span-1 h-8 w-8 rounded-full px-2 my-0.5 shadow bg-pink-400 text-white mr-1" onClick={handleOnDelete}>
      <Trash size={16}/>
    </button>
    <form className="col-span-11" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-11 justify-center" onDoubleClick={handleOnFormDoubleClick}>
        <span className="col-span-1 inline-block bg-pink-400 text-white text-center rounded-full mb-1 mr-2 w-7 h-7">{step.sortNr}</span>

        <span className={`col-span-4 font-bold ${fieldsEditable ? 'hidden' : ''}`}>{step.name}</span>
        <input hidden={!fieldsEditable} required className={`col-span-3 mr-2 h-12 rounded-md border-gray-300 shadow-sm ${fieldsEditable ? '' : 'hidden'}`} type="text" placeholder="Name*" {...register('name')} />

        <p className={`col-span-6 inline ml-1 ${fieldsEditable ? 'hidden' : ''}`}>{step.description}</p>
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
