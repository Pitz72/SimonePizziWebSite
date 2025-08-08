import React, { useState, useEffect } from 'react';

const TypewriterText = ({ 
  text, // Can be a string or an array of {text, className}
  speed = 100, 
  delay = 1000, 
  className = '',
  cursor = true,
  onComplete = null 
}) => {
  const [displayedContent, setDisplayedContent] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const textParts = Array.isArray(text) ? text : [{ text, className }];

  useEffect(() => {
    const startTimer = setTimeout(() => setIsTyping(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!isTyping) return;

    let partIndex = 0;
    let charIndex = 0;
    let currentContent = [];

    const type = () => {
      if (partIndex >= textParts.length) {
        if (onComplete) onComplete();
        setIsTyping(false);
        return;
      }

      const currentPart = textParts[partIndex];
      const currentText = currentPart.text;

      if (charIndex < currentText.length) {
        const newContent = [...textParts.slice(0, partIndex)];
        newContent.push({
          ...currentPart,
          text: currentText.substring(0, charIndex + 1)
        });
        setDisplayedContent(newContent);
        charIndex++;
        setTimeout(type, speed);
      } else {
        partIndex++;
        charIndex = 0;
        setTimeout(type, speed);
      }
    };

    type();

  }, [isTyping, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayedContent.map((part, i) => (
        <span key={i} className={part.className}>
          {part.text}
        </span>
      ))}
      {cursor && isTyping && (
        <span className="inline-block w-0.5 h-6 bg-primary-500 ml-1 animate-blink">
          &nbsp;
        </span>
      )}
    </span>
  );
};

export default TypewriterText;