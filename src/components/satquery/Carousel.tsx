import { useState, useRef, useId, useEffect } from "react";
import { ArrowRight } from "lucide-react";

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
        className="flex flex-1 flex-col items-center justify-center relative text-center text-white w-[70vmin] h-[70vmin] mx-[4vmin] z-10 cursor-pointer"
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
          className="absolute top-0 left-0 w-full h-full rounded-lg overflow-hidden transition-all duration-150 ease-out"
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
          className={`relative p-8 transition-all duration-700 ease-in-out ${
            isActive ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <h2 className="text-lg md:text-2xl lg:text-4xl font-bold relative drop-shadow-lg">
            {slide.title}
          </h2>
          <p className="mt-3 text-sm md:text-base text-white/70 max-w-xs mx-auto">
            {slide.description}
          </p>
          <div className="flex justify-center mt-6">
            <button className="px-5 py-2.5 w-fit mx-auto text-xs md:text-sm text-black bg-white h-12 border border-transparent flex justify-center items-center gap-2 rounded-full hover:shadow-lg transition duration-200">
              {slide.button}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </article>
      </li>
    </div>
  );
}

interface CarouselControlProps {
  type: "previous" | "next";
  title: string;
  handleClick: () => void;
}

function CarouselControl({ type, title, handleClick }: CarouselControlProps) {
  return (
    <button
      className={`w-10 h-10 flex items-center mx-2 justify-center bg-muted border border-border rounded-full focus:border-primary focus:outline-none hover:-translate-y-0.5 active:translate-y-0.5 transition duration-200 ${
        type === "previous" ? "rotate-180" : ""
      }`}
      title={title}
      onClick={handleClick}
    >
      <ArrowRight className="size-4 text-muted-foreground" />
    </button>
  );
}

interface CarouselProps {
  slides: SlideData[];
}

export default function Carousel({ slides }: CarouselProps) {
  const [current, setCurrent] = useState(0);

  const handlePreviousClick = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextClick = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const handleSlideClick = (index: number) => {
    if (current !== index) setCurrent(index);
  };

  const id = useId();

  return (
    <div
      className="relative w-[70vmin] h-[70vmin] mx-auto"
      aria-labelledby={`carousel-heading-${id}`}
    >
      <ul
        className="absolute flex mx-[-4vmin] transition-transform duration-1000 ease-in-out"
        style={{
          transform: `translateX(-${current * (100 / slides.length)}%)`,
        }}
      >
        {slides.map((slide, index) => (
          <Slide
            key={index}
            slide={slide}
            index={index}
            current={current}
            handleSlideClick={handleSlideClick}
          />
        ))}
      </ul>

      <div className="absolute flex justify-center w-full top-[calc(100%+1rem)]">
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
  );
}
