import React from 'react';
import { ArrowLeftShort } from 'react-bootstrap-icons';
import { useHistory } from 'react-router-dom';

export function TopBar(): JSX.Element {
  const history = useHistory();
  return (
    <div className="h-12 mb-4 bg-white pl-1 py-2">
      <button
        className="rounded-full shadow hover:shadow-lg
    "
        onClick={() => history.goBack()}
      >
        <ArrowLeftShort size={32} />
      </button>
    </div>
  );
}
