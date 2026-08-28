import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TextHoverEffectProps {
  text: string;
  duration?: number;
}

export default function TextHoverEffect({
  text,
  duration = 0.15,
}: TextHoverEffectProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (svgRef.current) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
      setMaskPosition({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      });
    }
  }, [cursor]);

  const textClass = isMobile
    ? "fill-transparent text-4xl sm:text-5xl font-bold"
    : "fill-transparent text-5xl sm:text-6xl lg:text-7xl font-bold";

  const strokeClass = isMobile
    ? "fill-transparent stroke-neutral-200 text-4xl sm:text-5xl font-bold"
    : "fill-transparent stroke-neutral-200 text-5xl sm:text-6xl lg:text-7xl font-bold";

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={isMobile ? "0 0 400 80" : "0 0 600 120"}
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className="select-none"
      role="img"
      aria-label={text}
    >
      <defs>
        <linearGradient
          id="textGradient"
          gradientUnits="userSpaceOnUse"
          cx="50%"
          cy="50%"
          r="25%"
        >
          {hovered && (
            <>
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="25%" stopColor="#0ea5e9" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="75%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </>
          )}
        </linearGradient>

        <motion.radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r="20%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{ duration, ease: "easeOut" }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="textMask">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#revealMask)"
          />
        </mask>
      </defs>

      {/* Ghost outline — fades in on hover */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className={strokeClass}
        style={{
          fontFamily: "helvetica, arial, sans-serif",
          opacity: hovered ? 0.7 : 0,
        }}
      >
        {text}
      </text>

      {/* Animated stroke draw-on */}
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className={strokeClass}
        style={{ fontFamily: "helvetica, arial, sans-serif" }}
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{ strokeDashoffset: 0, strokeDasharray: 1000 }}
        transition={{ duration: 4, ease: "easeInOut" }}
      >
        {text}
      </motion.text>

      {/* Gradient fill — masked to cursor position */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#textGradient)"
        strokeWidth="0.3"
        mask="url(#textMask)"
        className={textClass}
        style={{ fontFamily: "helvetica, arial, sans-serif" }}
      >
        {text}
      </text>
    </svg>
  );
}
