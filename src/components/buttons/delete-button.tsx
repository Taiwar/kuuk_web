import React, { SyntheticEvent } from 'react';
import { Trash } from 'react-bootstrap-icons';
import { KuukButton } from './kuuk-button';

type DeleteButtonProps = {
  onClick: (e: SyntheticEvent) => void;
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export function DeleteButton(props: DeleteButtonProps): JSX.Element {
  return (
    <KuukButton
      variant="primary"
      hidden={props.hidden}
      className={props.className}
      icon={<Trash size={16} className="mt-2" />}
      onClick={props.onClick}
      size={8}
    />
  );
}
