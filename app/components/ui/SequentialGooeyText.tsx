"use client";

import * as React from "react";
import { classNames } from "~/utils/classNames";

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
  textClassName
}: SequentialGooeyTextProps) {
  const text1Ref = React.useRef<HTMLSpanElement>(null);
  const text2Ref = React.useRef<HTMLSpanElement>(null);
  const indexRef = React.useRef<number>(0);
  const nextIndexRef = React.useRef<number>(1);

  React.useEffect(() => {
    if (texts.length === 0) return;
    
    let time = new Date();
    let morph = 0;
    let cooldown = cooldownTime;
    let animationFrameId: number;

    // Initialize text elements
    if (text1Ref.current && text2Ref.current) {
      text1Ref.current.textContent = texts[indexRef.current];
      text2Ref.current.textContent = texts[nextIndexRef.current];
      text1Ref.current.style.opacity = "100%";
      text2Ref.current.style.opacity = "0%";
    }

    const setMorph = (fraction: number) => {
      if (text1Ref.current && text2Ref.current) {
        // Apply the same blur and opacity to both texts
        text2Ref.current.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
        text2Ref.current.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

        fraction = 1 - fraction;
        text1Ref.current.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
        text1Ref.current.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
      }
    };

    const doCooldown = () => {
      morph = 0;
      
      if (text1Ref.current && text2Ref.current) {
        // Swap the content
        text1Ref.current.textContent = text2Ref.current.textContent;
        
        // Update indices for strict sequential order
        indexRef.current = nextIndexRef.current;
        nextIndexRef.current = (nextIndexRef.current + 1) % texts.length;
        
        // Update the next text
        text2Ref.current.textContent = texts[nextIndexRef.current];
        
        // Reset styles
        text1Ref.current.style.filter = "";
        text1Ref.current.style.opacity = "100%";
        text2Ref.current.style.filter = "";
        text2Ref.current.style.opacity = "0%";
      }
    };

    const doMorph = () => {
      morph -= cooldown;
      cooldown = 0;
      
      let fraction = morph / morphTime;
      if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
      }
      
      setMorph(fraction);
    };

    function animate() {
      const newTime = new Date();
      const dt = (newTime.getTime() - time.getTime()) / 1000;
      time = newTime;

      cooldown -= dt;

      if (cooldown <= 0) {
        doMorph();
      } else if (cooldown <= 0.01) {
        // Only do cooldown when animation is complete
        doCooldown();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    }

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      // Cleanup function
      cancelAnimationFrame(animationFrameId);
    };
  }, [texts, morphTime, cooldownTime]);

  return (
    <div className={classNames("relative", className)}>
      <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id="threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>

      <div
        className="flex items-center justify-center"
        style={{ filter: "url(#threshold)" }}
      >
        <span
          ref={text1Ref}
          className={classNames(
            "absolute inline-block select-none text-center text-3xl lg:text-6xl",
            "text-bolt-elements-textPrimary font-bold whitespace-nowrap",
            textClassName
          )}
        />
        <span
          ref={text2Ref}
          className={classNames(
            "absolute inline-block select-none text-center text-3xl lg:text-6xl",
            "text-bolt-elements-textPrimary font-bold whitespace-nowrap",
            textClassName
          )}
        />
      </div>
    </div>
  );
}
