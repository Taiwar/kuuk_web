import React from 'react'
import { X } from 'react-bootstrap-icons'

export function RecipeTag(props: { tag: string, onRemove: (tag: string) => void, editable: boolean }) {
  return <div className="flex-1 max-w-10 inline-block cursor-pointer mt-1 mx-1 bg-gray-100 rounded-full px-2 flex h-10">
          <span
            className="flex-1 font-bold text-sm my-auto text-center">
            {props.tag}
          </span>
    <button className={`flex-1 inline hover:bg-gray-200 rounded-full ${props.editable ? '' : 'hidden'}`} onClick={() => props.onRemove(props.tag)}>
      <X size={24} className=""/>
    </button>
  </div>
}
