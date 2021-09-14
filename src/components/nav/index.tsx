import React from 'react';
import { Download, Plus, Search } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import KuukNavLink from './kuuk-nav-link';

export function Nav(): JSX.Element {
  return (
    <aside className="flex flex-col items-center bg-white text-gray-700 shadow w-16">
      <Link className="w-full h-16 flex items-center hover:bg-gray-100" to="/">
        <div className="h-6 w-6 mx-auto">
          <img className="h-6 w-6 mx-auto" src="/logo512.png" alt="Kuuk logo" />
        </div>
      </Link>

      <ul className="w-full">
        <KuukNavLink to="/createRecipe" icon={<Plus size={28} />} />
        <KuukNavLink to="/importRecipe" icon={<Download size={20} />} />
        <KuukNavLink to="/search" icon={<Search size={16} />} />
      </ul>
    </aside>
  );
}
