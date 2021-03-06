import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';

type KuukNavLinkProps = {
  to: string;
  icon: ReactElement;
};

export default function KuukNavLink(props: KuukNavLinkProps): JSX.Element {
  return (
    <li className="hover:bg-gray-100">
      <Link
        to={props.to}
        className="h-16 flex flex justify-center items-center w-full focus:text-orange-500"
      >
        {props.icon}
      </Link>
    </li>
  );
}
