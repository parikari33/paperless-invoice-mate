
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
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
        
        {/* Inner circles for more visual appeal */}
        <div className="absolute inset-4 border-2 border-muted rounded-full opacity-70"></div>
        <div className="absolute inset-4 border-2 border-t-primary/70 rounded-full animate-spin" style={{ animationDuration: '0.7s' }}></div>
        
        {/* Center dot */}
        <div className="absolute inset-[40%] bg-primary/20 rounded-full animate-pulse"></div>
      </div>
      
      <div className="flex items-center space-x-2 text-primary font-medium">
        <span className="bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">{message}</span>
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-light"></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-light" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-light" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingAnimation;
