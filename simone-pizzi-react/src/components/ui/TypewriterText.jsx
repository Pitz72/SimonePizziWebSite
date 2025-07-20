import React, { useState, useEffect } from 'react';

const TypewriterText = ({ 
  text, 
  speed = 100, 
  delay = 1000, 
  className = '',
  cursor = true,
  onComplete = null 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (currentIndex === 0 && !isTyping) {
      // Start typing after delay
      const startTimer = setTimeout(() => {
        setIsTyping(true);
      }, delay);

      return () => clearTimeout(startTimer);
    }

    if (isTyping && currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (isTyping && currentIndex >= text.length) {
      setIsTyping(false);
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentIndex, isTyping, text, speed, delay, onComplete]);

  return (
    <span className={className}>
      {displayText}
      {cursor && isTyping && (
        <span className="inline-block w-0.5 h-6 bg-primary-500 ml-1 animate-blink">
          &nbsp;
        </span>
      )}
    </span>
  );
};

export default TypewriterText; 