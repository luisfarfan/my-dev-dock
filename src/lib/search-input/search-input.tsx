import React from 'react';
import { Search } from 'lucide-react';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  className = '',
  onSearch,
  onChange,
  ...props
}) => {
  return (
    <div className={`relative group ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
      <input
        type="text"
        className="
          bg-input border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground
          focus:outline-none focus:border-primary/50 focus:bg-card/80
          placeholder:text-muted-foreground/50 transition-all w-full
        "
        {...props}
        onChange={(e) => {
          onSearch?.(e.target.value);
          onChange?.(e);
        }}
      />
    </div>
  );
};
