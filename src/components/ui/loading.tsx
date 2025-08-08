import React from 'react';
import { Loader2, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'spinner' | 'plane';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'default',
  text,
  className,
}) => {
  const renderIcon = () => {
    switch (variant) {
      case 'plane':
        return (
          <Plane className={cn(
            sizeClasses[size],
            'animate-pulse text-primary',
            className
          )} />
        );
      case 'spinner':
        return (
          <Loader2 className={cn(
            sizeClasses[size],
            'animate-spin text-primary',
            className
          )} />
        );
      default:
        return (
          <div className={cn(
            'animate-spin rounded-full border-2 border-primary border-t-transparent',
            sizeClasses[size],
            className
          )} />
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {renderIcon()}
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

// Componente de loading para páginas inteiras
export const PageLoading: React.FC<{ text?: string }> = ({ text = "Carregando..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loading size="lg" text={text} />
    </div>
  );
};

// Componente de loading para seções
export const SectionLoading: React.FC<{ text?: string }> = ({ text = "Carregando..." }) => {
  return (
    <div className="flex items-center justify-center py-8">
      <Loading size="md" text={text} />
    </div>
  );
};

// Componente de loading inline
export const InlineLoading: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div className="flex items-center space-x-2">
      <Loading size="sm" />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};
