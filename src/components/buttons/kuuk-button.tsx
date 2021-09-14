import React, { SyntheticEvent } from 'react';

type PrimaryButtonProps = {
  icon: JSX.Element;
  size: number;
  variant: 'primary' | 'secondary';
  onClick?: (e: SyntheticEvent) => void | undefined;
  type?: 'button' | 'submit' | 'reset' | undefined;
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export function KuukButton(props: PrimaryButtonProps): JSX.Element {
  const { icon, onClick, size, className, type, variant, hidden } = props;

  let color;

  switch (variant) {
    case 'primary':
      color = 'bg-pink-400';
      break;
    case 'secondary':
      color = 'bg-gray-400';
      break;
  }

  console.log('hidden', hidden);
  return (
    <button
      className={`${className} ${
        hidden ? 'hidden' : ''
      } rounded-full h-${size} w-${size} shadow ${color} text-white hover:shadow-lg grid justify-items-center`}
      onClick={onClick}
      type={type ?? 'button'}
    >
      {icon}
    </button>
  );
}
