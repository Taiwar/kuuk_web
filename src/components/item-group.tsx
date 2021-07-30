import React, { useState } from 'react'
import { GroupDTO, IngredientDTO, NoteDTO, StepDTO } from '../shared/graphql'
import { DEFAULT_GROUP_NAME, GroupItemTypes } from '../shared/constants'
import { IngredientItem } from '../views/recipe/ingredients/ingredient-item'
import { NoteItem } from '../views/recipe/notes/note-item'
import { StepItem } from '../views/recipe/steps/step-item'
import { Pencil, PencilFill, Plus } from 'react-bootstrap-icons'
import { IngredientForm } from '../views/recipe/ingredients/ingredient-form'
import { StepForm } from '../views/recipe/steps/step-form'
import { NoteForm } from '../views/recipe/notes/note-form'

export type ItemGroupProps = {
  group: GroupDTO,
  add: (input: any) => Promise<any>,
  update: (input: any) => Promise<any>,
  delete: (id: string, groupId: string) => Promise<any>
}

export function ItemGroup(props: ItemGroupProps) {
  const [editable, setEditable] = useState(false)
  const [showForm, setShowForm] = useState(false)

  function handleClickAdd() {
    setShowForm(true)
  }

  function handleClickEdit() {
    setEditable(!editable)
  }

  function handleAdd(data: any) {
    return props.add({
      ...data,
      groupID: props.group.id
    })
  }

  function handleDelete(id: string) {
    return props.delete(id, props.group.id)
  }

  let itemForm = null

  switch (props.group.itemType) {
    case GroupItemTypes.IngredientBE:
      itemForm = <IngredientForm onAdd={handleAdd} showForm={showForm} setShowForm={setShowForm}/>
      break
    case GroupItemTypes.StepBE:
      itemForm = <StepForm onAdd={handleAdd} showForm={showForm} setShowForm={setShowForm}/>
      break
    case GroupItemTypes.NoteBE:
      itemForm = <NoteForm onAdd={handleAdd} showForm={showForm} setShowForm={setShowForm}/>
      break
    default:
      break
  }

  return (<div>
    <div className="flex">
      <h4 className="text-xl">{props.group.name === DEFAULT_GROUP_NAME ? 'General' : props.group.name}</h4>
      <div hidden={showForm} className="flex ml-2 justify-center">
        <button className="rounded-full h-8 w-8 shadow bg-pink-400 text-white hover:shadow-lg pl-1" onClick={handleClickAdd}>
          <Plus size={24}/>
        </button>
        <button hidden={props.group.items.length < 1} className="rounded-full h-8 w-8 shadow bg-pink-400 text-white hover:shadow-lg pl-2.5 ml-1" onClick={handleClickEdit}>
          { editable ? <Pencil size={12} /> : <PencilFill size={12}/> }
        </button>
      </div>
    </div>
    {
      [...props.group.items]
        .sort((a, b) => a.sortNr - b.sortNr)
        .map((item, i) => {
          switch (props.group.itemType) {
            case GroupItemTypes.IngredientBE:
              return <IngredientItem key={i} ingredient={item as IngredientDTO} editable={editable} updateIngredient={props.update} deleteIngredient={handleDelete} />
            case GroupItemTypes.StepBE:
              return <StepItem key={i} step={item as StepDTO} editable={editable} updateStep={props.update} deleteStep={handleDelete} />
            case GroupItemTypes.NoteBE:
              return <NoteItem key={i} note={item as NoteDTO} editable={editable} updateNote={props.update} deleteNote={handleDelete} />
            default:
              return <p key={i}>Unknown item {item}</p>
          }
        })
    }
    {
      itemForm
    }
  </div>)
}
