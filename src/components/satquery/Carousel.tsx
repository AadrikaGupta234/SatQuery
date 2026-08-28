import { useState, useRef, useId, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface SlideData {
  title: string;
  description: string;
  button: string;
  src: string;
}

interface SlideProps {
  slide: SlideData;
  index: number;
  current: number;
  handleSlideClick: (index: number) => void;
}

function Slide({ slide, index, current, handleSlideClick }: SlideProps) {
  const slideRef = useRef<HTMLLIElement>(null);
  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return;
      slideRef.current.style.setProperty("--x", `${xRef.current}px`);
      slideRef.current.style.setProperty("--y", `${yRef.current}px`);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const handleMouseMove = (event: React.MouseEvent) => {
    const el = slideRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    xRef.current = event.clientX - (r.left + Math.floor(r.width / 2));
    yRef.current = event.clientY - (r.top + Math.floor(r.height / 2));
  };

  const handleMouseLeave = () => {
    xRef.current = 0;
    yRef.current = 0;
  };

  const isActive = current === index;

  return (
    <div className="[perspective:1200px] [transform-style:preserve-3d]">
      <li
        ref={slideRef}
        className="flex flex-1 flex-col items-center justify-center relative text-center text-white w-[65vw] h-[65vw] min-w-[260px] min-h-[260px] max-w-[420px] max-h-[420px] sm:w-[55vmin] sm:h-[55vmin] sm:min-w-0 sm:min-h-0 sm:max-w-none sm:max-h-none lg:w-[50vmin] lg:h-[50vmin] mx-2 sm:mx-4 z-10 cursor-pointer"
        onClick={() => handleSlideClick(index)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isActive
            ? "scale(1) rotateX(0deg)"
            : "scale(0.98) rotateX(8deg)",
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "bottom",
        }}
      >
        {/* Image container with 3D tilt */}
        <div
          className="absolute top-0 left-0 w-full h-full rounded-lg sm:rounded-xl overflow-hidden transition-all duration-150 ease-out"
          style={{
            transform: isActive
              ? "translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)"
              : "none",
          }}
        >
          <img
            className="absolute inset-0 w-[120%] h-[120%] object-cover transition-opacity duration-500"
            style={{ opacity: isActive ? 1 : 0.5 }}
            alt={slide.title}
            src={slide.src}
            loading="eager"
            decoding="sync"
          />
          {/* Dark overlay for text readability */}
          {isActive && (
            <div className="absolute inset-0 bg-black/40 transition-all duration-700" />
          )}
          {/* Gradient overlay at bottom for text */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        {/* Text content */}
        <article
          className={`relative p-4 sm:p-6 lg:p-8 transition-opacity duration-700 ease-in-out ${
            isActive ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <h2 className="text-base sm:text-lg lg:text-2xl font-semibold relative">
            {slide.title}
          </h2>
          <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs lg:text-sm text-neutral-300 max-w-[85%] mx-auto leading-relaxed">
            {slide.description}
          </p>
          <div className="flex justify-center mt-3 sm:mt-4">
            <button className="px-3 py-1.5 sm:px-4 sm:py-2 w-fit mx-auto text-[11px] sm:text-xs text-black bg-white h-9 sm:h-10 lg:h-12 border border-transparent flex justify-center items-center rounded-xl sm:rounded-2xl hover:shadow-lg transition duration-200 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]">
              {slide.button}
            </button>
          </div>
        </article>
      </li>
    </div>
  );
}

function CarouselControl({
  type,
  title,
  handleClick,
}: {
  type: string;
  title: string;
  handleClick: () => void;
}) {
  return (
    <button
      className={`w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center mx-1.5 sm:mx-2 bg-neutral-200 border-3 border-transparent rounded-full focus:border-[#6D64F7] focus:outline-none hover:-translate-y-0.5 active:translate-y-0.5 transition duration-200 ${
        type === "previous" ? "rotate-180" : ""
      }`}
      title={title}
      onClick={handleClick}
      aria-label={title}
    >
      <ArrowRight className="size-3.5 sm:size-4 text-neutral-600" />
    </button>
  );
}

interface CarouselProps {
  slides: SlideData[];
}

export default function Carousel({ slides }: CarouselProps) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);

  const handlePreviousClick = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextClick = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const handleSlideClick = (index: number) => {
    if (current !== index) setCurrent(index);
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      if (delta > 0) handleNextClick();
      else handlePreviousClick();
    }
  };

  const id = useId();

  return (
    <div
      className="relative w-full max-w-[500px] sm:max-w-none sm:w-[70vmin] h-[65vw] sm:h-[55vmin] lg:h-[50vmin] mx-auto overflow-hidden"
      aria-label="Features carousel"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <ul
        className="absolute flex transition-transform duration-700 sm:duration-1000 ease-in-out h-full"
        style={{
          transform: `translateX(-${current * (100 / slides.length)}%)`,
          width: `${slides.length * 100}%`,
        }}
      >
        {slides.map((slide, index) => (
          <li
            key={index}
            style={{ width: `${100 / slides.length}%` }}
            className="flex justify-center items-center"
          >
            <Slide
              slide={slide}
              index={index}
              current={current}
              handleSlideClick={handleSlideClick}
            />
          </li>
        ))}
      </ul>

      {/* Controls + dots */}
      <div className="absolute bottom-0 sm:top-[calc(100%+1rem)] left-0 right-0 flex flex-col items-center gap-2 pb-4 sm:pb-0 sm:pt-0">
        {/* Dot indicators — visible on mobile */}
        <div className="flex gap-1.5 sm:hidden">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`size-2 rounded-full transition-all ${
                i === current
                  ? "bg-primary w-5"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Arrow controls */}
        <div className="flex justify-center">
          <CarouselControl
            type="previous"
            title="Go to previous slide"
            handleClick={handlePreviousClick}
          />
          <CarouselControl
            type="next"
            title="Go to next slide"
            handleClick={handleNextClick}
          />
        </div>
      </div>
    </div>
  );
}
