import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export const CardSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="glass-effect rounded-xl p-6 space-y-4"
  >
    <Skeleton className="h-10 w-10 rounded-lg" />
    <Skeleton className="h-8 w-24" />
    <Skeleton className="h-4 w-32" />
  </motion.div>
);

export const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        className="glass-effect rounded-xl p-4 md:p-6 text-center"
      >
        <Skeleton className="w-10 h-10 rounded-lg mx-auto mb-3" />
        <Skeleton className="h-8 w-20 mx-auto mb-2" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </motion.div>
    ))}
  </div>
);

export const PageLoadingSkeleton = () => (
  <div className="min-h-screen pt-20 container mx-auto px-4 space-y-8 animate-pulse">
    <div className="text-center space-y-4">
      <Skeleton className="h-12 w-64 mx-auto" />
      <Skeleton className="h-6 w-96 mx-auto" />
    </div>
    <StatsSkeleton />
    <div className="grid md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.05 }}
        className="flex items-center gap-4 p-4 glass-effect rounded-lg"
      >
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20 ml-auto" />
      </motion.div>
    ))}
  </div>
);

export default { CardSkeleton, StatsSkeleton, PageLoadingSkeleton, TableSkeleton };
