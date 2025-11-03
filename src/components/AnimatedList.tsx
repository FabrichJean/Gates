import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode } from "react";

interface AnimatedListProps<T extends { id: string | number }> {
  items?: T[];
  children: (item: T) => ReactNode;
  className?: string;
}

export default function AnimatedList<T extends { id: string | number }>({
  items = [],
  children,
  className,
}: AnimatedListProps<T>) {
  return (
    <AnimatePresence>
      {items?.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          {children(item)}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
