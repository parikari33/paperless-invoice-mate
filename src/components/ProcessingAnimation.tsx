
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
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      {/* Animated container */}
      <div className="relative w-32 h-32 mb-8">
        {/* Outer spinning circle */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-primary/40 animate-spin" style={{ animationDuration: '3s' }}></div>
        
        {/* Middle spinning circle */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-primary/20 to-primary/60 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
        
        {/* Inner spinning circle */}
        <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/80 animate-spin" style={{ animationDuration: '1.5s' }}></div>
        
        {/* Pulsing core */}
        <div className="absolute inset-[35%] rounded-full bg-primary/90 animate-pulse shadow-lg shadow-primary/20"></div>
        
        {/* Decorative elements */}
        <div className="absolute h-full w-full">
          {/* Decorative dots */}
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-2 h-2 rounded-full bg-white/80 animate-pulse"
              style={{ 
                top: `${50 + 47 * Math.sin(i * Math.PI / 6)}%`, 
                left: `${50 + 47 * Math.cos(i * Math.PI / 6)}%`,
                animationDelay: `${i * 0.1}s` 
              }}
            ></div>
          ))}
          
          {/* Radial lines */}
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="absolute top-1/2 left-1/2 w-[46%] h-[1px] bg-gradient-to-r from-white/0 via-white/60 to-white/0 origin-left"
              style={{ 
                transform: `translateY(-50%) rotate(${i * 30}deg)` 
              }}
            ></div>
          ))}
        </div>
        
        {/* Glass overlay effect */}
        <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm"></div>
      </div>
      
      {/* Enhanced message display */}
      <div className="relative bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-sm px-6 py-3 rounded-full">
        <div className="flex items-center gap-3">
          <span className="text-primary font-medium tracking-wide bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">{message}</span>
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary/80 animate-bounce" style={{ animationDuration: '0.8s' }}></div>
            <div className="w-2.5 h-2.5 rounded-full bg-primary/80 animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '0.2s' }}></div>
            <div className="w-2.5 h-2.5 rounded-full bg-primary/80 animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '0.4s' }}></div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary/50 to-primary rounded-full animate-pulse" style={{ width: '100%' }}></div>
      </div>
    </div>
  );
};

export default ProcessingAnimation;
