
import React from 'react';
import { cn } from '@/lib/utils';

interface ProcessingAnimationProps {
  message?: string;
  className?: string;
}

const ProcessingAnimation: React.FC<ProcessingAnimationProps> = ({
  message = 'Processing',
  className
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8', className)}>
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
      </div>
      
      <div className="flex items-center space-x-2 text-primary font-medium">
        <span>{message}</span>
        <div className="flex space-x-1">
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingAnimation;
