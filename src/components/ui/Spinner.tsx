'use client';

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
};

interface SpinnerProps {
  size?: keyof typeof sizes;
  className?: string;
}

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      className={`${sizes[size]} border-gray-300 border-t-gray-900 rounded-full animate-spin ${className}`}
    />
  );
}
