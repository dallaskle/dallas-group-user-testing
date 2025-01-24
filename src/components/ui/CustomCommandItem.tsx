import React from 'react';

interface CustomCommandItemProps {
  onSelect: () => void;
  isSelected: boolean;
  children: React.ReactNode;
  ariaLabel: string;
}

const CustomCommandItem: React.FC<CustomCommandItemProps> = ({
  onSelect,
  isSelected,
  children,
  ariaLabel,
}) => {
  return (
    <div
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none ${
        isSelected ? 'bg-primary text-primary-foreground' : ''
      }`}
    >
      {children}
    </div>
  );
};

export default CustomCommandItem;
