import * as React from 'react';
import { useEffect, useState, useRef } from 'react';

export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}

export function Typewriter({
  text,
  speed = 100,
  cursor = '|',
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  // Validate and process input text
  const textArray = Array.isArray(text) ? text : [text];

  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'deleting' | 'pausing'>('typing');
  const [textIndex, setTextIndex] = useState(0);

  // Use a ref to track if the component is mounted
  const isMounted = useRef(true);

  useEffect(() => {
    // Set mounted flag
    isMounted.current = true;

    // Cleanup function to set mounted flag to false when component unmounts
    return function cleanup() {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (textArray.length === 0) {
      return;
    }

    let timeout: NodeJS.Timeout;

    if (phase === 'typing') {
      if (currentIndex < textArray[textIndex].length) {
        timeout = setTimeout(() => {
          if (isMounted.current) {
            setCurrentText((prev) => prev + textArray[textIndex][currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          }
        }, speed);
      } else {
        timeout = setTimeout(() => {
          if (isMounted.current) {
            setPhase('pausing');
          }
        }, delay);
      }
    } else if (phase === 'deleting') {
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          if (isMounted.current) {
            setCurrentText((prev) => prev.slice(0, -1));
          }
        }, deleteSpeed);
      } else {
        if (isMounted.current) {
          setTextIndex((prev) => (prev + 1) % textArray.length);
          setPhase('typing');
          setCurrentIndex(0);
        }
      }
    } else if (phase === 'pausing') {
      if (loop || textIndex < textArray.length - 1) {
        timeout = setTimeout(() => {
          if (isMounted.current) {
            setPhase('deleting');
          }
        }, delay);
      }
    }

    // Cleanup function without a return value
    return function cleanup() {
      clearTimeout(timeout);
    };
  }, [currentIndex, currentText, delay, deleteSpeed, loop, phase, speed, textArray, textIndex]);

  return (
    <span className={className}>
      {currentText}
      <span className="animate-pulse">{cursor}</span>
    </span>
  );
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiJ9
