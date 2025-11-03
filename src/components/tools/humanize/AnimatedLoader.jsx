import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

const AnimatedChecklist = () => {
  const initialItems = [
    { id: 1, text: "Analyzing the Text", checked: false },
    { id: 2, text: "Detecting AI Patterns", checked: false },
    { id: 3, text: "Understanding Semantics", checked: false },
    { id: 4, text: "Recalibrating Tone", checked: false },
    { id: 5, text: "Restructuring Sentences", checked: false },
    { id: 6, text: "Diversifying Word Choice", checked: false },
    { id: 7, text: "Rewriting for Context", checked: false },
    { id: 8, text: "Optimizing Flow and Coherence", checked: false },
    { id: 9, text: "Rechecking AI Detectability", checked: false },
    { id: 10, text: "Polishing Grammar and Style", checked: false },
    { id: 11, text: "Scoring Output Quality", checked: false },
  ];

  const [items, setItems] = useState(initialItems);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    // Check if we've completed all items
    if (currentIndex >= items.length) {
      // Reset after a brief pause
      const resetTimeout = setTimeout(() => {
        setItems(initialItems);
        setCurrentIndex(0);
        setScrollOffset(0);
      }, 1000);
      return () => clearTimeout(resetTimeout);
    }

    const checkTimeout = setTimeout(() => {
      // Mark current item as checked
      setItems((prevItems) => {
        const newItems = [...prevItems];
        newItems[currentIndex].checked = true;
        return newItems;
      });

      // After checking, move to next item and adjust scroll
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);

        // Start scrolling after the second item is checked (index 1)
        if (currentIndex >= 1) {
          setScrollOffset((prev) => prev + 1);
        }
      }, 500);
    }, 2200);

    return () => clearTimeout(checkTimeout);
  }, [currentIndex, items.length]);

  const itemHeight = 62.5; // 250px / 4 items = 62.5px per item
  const maxVisibleItems = 3;

  return (
    <div className="flex max-h-[300px] items-center justify-center sm:p-8">
      <div className="relative w-full sm:max-w-md">
        <div className="overflow-hidden sm:p-6">
          <div className="relative h-[250px] overflow-hidden">
            {/* Top fade overlay */}
            <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-12 bg-gradient-to-b from-slate-50/20 to-transparent"></div>

            {/* Bottom fade overlay */}
            <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-12 bg-gradient-to-t from-slate-50/20 to-transparent"></div>

            {/* Scrollable content */}
            <motion.div
              animate={{
                y: -scrollOffset * itemHeight,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8,
              }}
              className="py-2 will-change-transform"
            >
              {items.map((item, index) => {
                const isCurrent = index === currentIndex;
                const isPast = index < currentIndex;
                const visibleStart = scrollOffset;
                const visibleEnd = scrollOffset + maxVisibleItems;
                const isInView = index >= visibleStart && index < visibleEnd;

                return (
                  <motion.div
                    key={item.id}
                    className="flex items-center gap-3 px-4"
                    style={{ height: `${itemHeight}px` }}
                    animate={{
                      opacity: isInView ? 1 : 0.2,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        item.checked
                          ? "border-emerald-500 bg-emerald-500"
                          : isCurrent
                            ? "border-emerald-400 bg-emerald-50"
                            : "border-slate-300 bg-white"
                      }`}
                      animate={{
                        scale: item.checked
                          ? [1, 1.2, 1]
                          : isCurrent
                            ? [1, 1.1, 1]
                            : 1,
                      }}
                      transition={{
                        duration: item.checked ? 0.4 : 1.5,
                        repeat: isCurrent && !item.checked ? Infinity : 0,
                        repeatType: "reverse",
                      }}
                    >
                      <AnimatePresence>
                        {item.checked && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 600,
                              damping: 20,
                            }}
                          >
                            <Check
                              className="h-3.5 w-3.5 text-white"
                              strokeWidth={3}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.span
                      className={`text-sm font-medium transition-all duration-300 ${
                        item.checked
                          ? "text-emerald-600"
                          : isCurrent
                            ? "text-slate-800"
                            : isPast
                              ? "text-slate-400"
                              : "text-slate-500"
                      }`}
                      animate={{
                        x: item.checked ? [0, 2, 0] : 0,
                      }}
                      transition={{
                        duration: 0.3,
                      }}
                    >
                      {item.text}
                    </motion.span>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedChecklist;
