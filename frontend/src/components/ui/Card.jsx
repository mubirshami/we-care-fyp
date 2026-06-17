import React from 'react';

const paddings = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

export default function Card({ children, padding = 'md', className = '', as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={[
        'rounded-card bg-white shadow-card',
        paddings[padding] ?? paddings.md,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </Tag>
  );
}
