import { motion } from "framer-motion";
import Spotlight from "@/components/satquery/Spotlight";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col relative overflow-hidden"
    >
      <Spotlight />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4">
        <div className="max-w-5xl mx-auto relative">
          <div className="flex items-center justify-center min-h-[160px] sm:min-h-[200px]">
            <div className="text-center">
              <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-3 sm:mb-4">404</h1>
              <p className="text-base sm:text-lg text-muted-foreground">Page Not Found</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
