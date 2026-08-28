import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}

export default function TextGenerateEffect({
  words,
  className,
  filter = true,
  duration = 0.5,
}: TextGenerateEffectProps) {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration: duration ?? 1,
        delay: stagger(0.2),
      }
    );
  }, [animate, filter, duration]);

  return (
    <div className={className}>
      <motion.div ref={scope} className="flex flex-wrap justify-center gap-x-[0.3em]">
        {wordsArray.map((word, idx) => (
          <motion.span
            key={`${word}-${idx}`}
            className="text-foreground opacity-0"
            style={{ filter: filter ? "blur(10px)" : "none" }}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
