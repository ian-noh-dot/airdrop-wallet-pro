import { motion } from 'framer-motion';
import { Shield, Lock, Award, CheckCircle } from 'lucide-react';

const TrustBadges = () => {
  const badges = [
    { icon: <Shield className="w-5 h-5" />, text: 'CertiK Audited', color: 'text-green-500' },
    { icon: <Lock className="w-5 h-5" />, text: '$10M Insured', color: 'text-blue-500' },
    { icon: <Award className="w-5 h-5" />, text: 'Top 10 DEX', color: 'text-yellow-500' },
    { icon: <CheckCircle className="w-5 h-5" />, text: 'KYC Verified', color: 'text-purple-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="flex flex-wrap justify-center gap-4 md:gap-6 py-6"
    >
      {badges.map((badge, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 + i * 0.1 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-border/50"
        >
          <span className={badge.color}>{badge.icon}</span>
          <span className="text-sm font-medium">{badge.text}</span>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default TrustBadges;
