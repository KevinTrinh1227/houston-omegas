'use client';

import { ReactNode, HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';

interface BaseProps {
  className?: string;
  children: ReactNode;
}

export function Table({ className = '', children }: BaseProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
      <table className={`w-full min-w-[600px] ${className}`}>{children}</table>
    </div>
  );
}

export function Thead({ className = '', children }: BaseProps) {
  return <thead className={className}>{children}</thead>;
}

export function Tbody({ className = '', children }: BaseProps) {
  return <tbody className={className}>{children}</tbody>;
}

interface TrProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
}

export function Tr({ className = '', children, ...rest }: TrProps) {
  return (
    <tr
      className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${className}`}
      {...rest}
    >
      {children}
    </tr>
  );
}

interface ThProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export function Th({ className = '', children, ...rest }: ThProps) {
  return (
    <th
      className={`text-left text-[10px] text-gray-400 uppercase tracking-wider font-medium px-5 py-3 ${className}`}
      {...rest}
    >
      {children}
    </th>
  );
}

interface TdProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export function Td({ className = '', children, ...rest }: TdProps) {
  return (
    <td className={`px-5 py-3 text-xs text-gray-500 ${className}`} {...rest}>
      {children}
    </td>
  );
}
