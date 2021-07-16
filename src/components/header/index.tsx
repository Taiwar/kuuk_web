import React from 'react'
import { Nav } from 'react-bootstrap'
import {
  useRouteMatch
} from 'react-router-dom'
import KuukNavLink from './kuuk-nav-link'

export function Header() {
  const match = useRouteMatch()

  return <Nav
    className="border-b-4 border-pink-400"
    activeKey={match.path}
  >
    <KuukNavLink to="/" text="Home"/>
    <KuukNavLink to="/createRecipe" text="Recipe"/>
  </Nav>
}
