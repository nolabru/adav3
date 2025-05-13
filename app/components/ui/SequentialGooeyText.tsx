import * as React from 'react';
import { classNames } from '~/utils/classNames';

interface SequentialGooeyTextProps {
  texts: string[];
  morphTime?: number;
  cooldownTime?: number;
  className?: string;
  textClassName?: string;
}

export function SequentialGooeyText({
  texts,
  morphTime = 1,
  cooldownTime = 0.25,
  className,
  textClassName,
}: SequentialGooeyTextProps) {
  const [currentText, setCurrentText] = React.useState<string>('');
  const [nextText, setNextText] = React.useState<string>('');
  const textIndexRef = React.useRef(0);

  const elts = {
    text1: React.useRef<HTMLSpanElement>(null),
    text2: React.useRef<HTMLSpanElement>(null),
  };

  React.useEffect(() => {
    if (texts.length === 0) {
      return;
    }

    // Initialize with first two texts
    setCurrentText(texts[0]);
    setNextText(texts[1 % texts.length]);

    let animationFrame: number;
    let textFraction = 0;
    let frameCount = 0;
    let lastTime = 0;
    let pauseCount = 0;
    let isPaused = false;

    const animate = (time: number) => {
      if (lastTime === 0) {
        lastTime = time;
      }

      // Removed unused delta variable

      if (isPaused) {
        pauseCount++;

        if (pauseCount >= 60) {
          // Pause for about 1 second (60 frames)
          isPaused = false;
          pauseCount = 0;
        }
      } else if (frameCount >= 100) {
        frameCount = 0;
        isPaused = true;

        // Update text indices using ref to avoid re-triggering effect
        textIndexRef.current = (textIndexRef.current + 1) % texts.length;

        const nextIndex = (textIndexRef.current + 1) % texts.length;

        // Update displayed texts
        setCurrentText(texts[textIndexRef.current]);
        setNextText(texts[nextIndex]);

        // Reset animation
        textFraction = 0;
      } else {
        frameCount++;

        // Apply morphing effect
        if (elts.text1.current && elts.text2.current) {
          if (frameCount < 50) {
            textFraction = frameCount / 50;

            // Fade out first text
            elts.text1.current.style.opacity = (1 - textFraction).toString();
            elts.text1.current.style.filter = `blur(${Math.min(8, 8 * textFraction)}px)`;

            // Fade in second text
            elts.text2.current.style.opacity = textFraction.toString();
            elts.text2.current.style.filter = `blur(${Math.min(8, 8 * (1 - textFraction))}px)`;
          }
        }
      }

      lastTime = time;
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    // Cleanup function without a return value
    return function cleanup() {
      cancelAnimationFrame(animationFrame);
    };
  }, [texts, morphTime, cooldownTime]); // Remove textIndex from dependencies

  return (
    <div className={classNames('relative', className)}>
      <div className="flex items-center justify-center">
        <span
          ref={elts.text1}
          className={classNames(
            'inline-block select-none text-center text-3xl lg:text-6xl absolute',
            'text-bolt-elements-textPrimary font-bold whitespace-nowrap',
            textClassName,
          )}
        >
          {currentText}
        </span>
        <span
          ref={elts.text2}
          className={classNames(
            'inline-block select-none text-center text-3xl lg:text-6xl absolute opacity-0',
            'text-bolt-elements-textPrimary font-bold whitespace-nowrap',
            textClassName,
          )}
        >
          {nextText}
        </span>
      </div>
    </div>
  );
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiJ9
