import React, { ReactElement } from 'react'
import { Link } from 'react-router-dom'

export default function KuukNavLink(props: { to: string, icon: ReactElement }) {
  return <li className="hover:bg-gray-100">
    <Link
      to={props.to}
      className="h-16 px-6 flex flex justify-center items-center w-full focus:text-orange-500">
      {props.icon}
    </Link>
  </li>
}
