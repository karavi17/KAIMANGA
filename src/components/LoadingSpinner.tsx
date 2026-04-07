import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "Summoning the next chapter...",
  "Sharpening the Katana...",
  "Gathering Chakra...",
  "Powering up to Super Saiyan...",
  "Consulting the Hokage...",
  "Searching the Grand Line...",
  "Waiting for the Titan to fall...",
  "Loading your destiny...",
  "Preparing the Spirit Bomb...",
  "Finding the One Piece...",
  "Executing the Bankai...",
  "Activating the Sharingan...",
  "Feeding the hollow...",
  "Recharging your Mana...",
  "Entering the Soul Society...",
  "Training in the Hyperbolic Time Chamber...",
  "Reading the Ninja Scroll...",
  "Consulting the Death Note...",
  "Unlocking the Grimoire...",
  "Mastering the Nen...",
  "Collecting the Dragon Balls...",
  "Waiting for the hero's arrival...",
  "Buffering the manga goodness...",
  "Translating the ancient texts...",
  "Ink is drying, please wait..."
];

// Define animation types
type AnimationType = 
  | 'spinner' | 'dots' | 'bars' | 'bounce' | 'pulse' 
  | 'circle-rotate' | 'dot-wave' | 'scaling-dots' | 'flipping-square' | 'ring-expand';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  fullScreen = false, 
  message: customMessage,
  className = "" 
}) => {
  const [animation, setAnimation] = useState<AnimationType>('spinner');
  const [loadingMessage, setLoadingMessage] = useState("");

  useEffect(() => {
    // Pick random animation and message on mount
    const animations: AnimationType[] = [
      'spinner', 'dots', 'bars', 'bounce', 'pulse', 
      'circle-rotate', 'dot-wave', 'scaling-dots', 'flipping-square', 'ring-expand'
    ];
    setAnimation(animations[Math.floor(Math.random() * animations.length)]);
    setLoadingMessage(customMessage || MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
  }, [customMessage]);

  const renderAnimation = () => {
    switch (animation) {
      case 'dots':
        return (
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
          </div>
        );
      case 'bars':
        return (
          <div className="flex items-end space-x-1 h-8">
            <div className="w-2 bg-orange-500 animate-[pulse_1s_infinite] h-full"></div>
            <div className="w-2 bg-orange-500 animate-[pulse_1s_infinite_0.2s] h-3/4"></div>
            <div className="w-2 bg-orange-500 animate-[pulse_1s_infinite_0.4s] h-1/2"></div>
            <div className="w-2 bg-orange-500 animate-[pulse_1s_infinite_0.6s] h-3/4"></div>
          </div>
        );
      case 'bounce':
        return (
          <div className="relative w-12 h-12">
            <div className="absolute top-0 left-0 w-full h-full bg-orange-500 rounded-full opacity-60 animate-ping"></div>
            <div className="relative w-full h-full bg-orange-500 rounded-full"></div>
          </div>
        );
      case 'pulse':
        return (
          <div className="w-16 h-16 bg-orange-500 rounded-full animate-pulse flex items-center justify-center">
            <div className="w-10 h-10 bg-white/20 rounded-full"></div>
          </div>
        );
      case 'circle-rotate':
        return (
          <svg className="animate-spin h-12 w-12 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'dot-wave':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className={`w-2 h-2 bg-orange-500 rounded-full animate-[bounce_1s_infinite]`} style={{ animationDelay: `${i * 0.1}s` }}></div>
            ))}
          </div>
        );
      case 'scaling-dots':
        return (
          <div className="flex space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full animate-[pulse_1s_infinite]"></div>
            <div className="w-4 h-4 bg-orange-500 rounded-full animate-[pulse_1s_infinite_0.3s]"></div>
            <div className="w-4 h-4 bg-orange-500 rounded-full animate-[pulse_1s_infinite_0.6s]"></div>
          </div>
        );
      case 'flipping-square':
        return (
          <div className="w-10 h-10 bg-orange-500 animate-[spin_2s_linear_infinite] rounded-lg"></div>
        );
      case 'ring-expand':
        return (
          <div className="relative w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
        );
      case 'spinner':
      default:
        return (
          <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-600 rounded-full animate-spin"></div>
        );
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="mb-6">
        {renderAnimation()}
      </div>
      <p className="text-orange-600 dark:text-orange-400 font-bold text-lg animate-pulse text-center">
        {loadingMessage}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[999] bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};
