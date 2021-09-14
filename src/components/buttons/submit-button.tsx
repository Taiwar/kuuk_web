import React from 'react';
import { Check } from 'react-bootstrap-icons';
import { KuukButton } from './kuuk-button';

type SubmitButtonProps = {
  text?: string | undefined;
  size: number;
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export function SubmitButton(props: SubmitButtonProps): JSX.Element {
  return (
    <KuukButton
      variant="primary"
      className={props.className}
      icon={<Check size={28} className="mt-0.5" />}
      type="submit"
      size={8}
    />
  );
}
