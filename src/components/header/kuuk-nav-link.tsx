import React from 'react'
import { Nav } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'

export default function KuukNavLink(props: { to: string, text: string }) {
  return <Nav.Item className="p-2 hover:bg-gray-100 rounded-md">
    <LinkContainer to={props.to}>
      <Nav.Link>{props.text}</Nav.Link>
    </LinkContainer>
  </Nav.Item>
}
