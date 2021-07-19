import React from 'react'
import { Plus } from 'react-bootstrap-icons'
import {
  Link
} from 'react-router-dom'
import KuukNavLink from './kuuk-nav-link'

export function Header() {
  return <aside
    className="flex flex-col items-center bg-white text-gray-700 shadow"
  >
    <div className="h-16 flex items-center">
      <Link className="h-6 w-6 mx-auto" to="/">
        <img
          className="h-6 w-6 mx-auto"
          src="/logo512.png"
          alt="Kuuk logo"/>
      </Link>
    </div>

    <KuukNavLink to="/createRecipe" icon={<Plus/>}/>
  </aside>
}
