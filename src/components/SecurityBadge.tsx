import { motion } from 'framer-motion';
import { Shield, Lock, CheckCircle, Award, Globe, Verified, Star, Users } from 'lucide-react';

const SecurityBadge = () => {
  const securityFeatures = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'CertiK Audited',
      description: 'Smart contracts verified',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: '$10M Insurance',
      description: 'Funds protected',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Verified className="w-5 h-5" />,
      title: 'KYC Verified',
      description: 'Team fully doxxed',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: '180+ Countries',
      description: 'Worldwide access',
      color: 'from-orange-500 to-amber-500',
    },
  ];

  const stats = [
    { value: '524K+', label: 'Active Users' },
    { value: '$127M+', label: 'Total Volume' },
    { value: '99.99%', label: 'Uptime' },
    { value: '0', label: 'Security Incidents' },
  ];

  return (
    <div className="space-y-8">
      {/* Security Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {securityFeatures.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-effect rounded-xl p-4 text-center hover:border-primary/30 transition-all group"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mx-auto mb-3 text-white group-hover:scale-110 transition-transform`}>
              {feature.icon}
            </div>
            <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
            <p className="text-xs text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Trust Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="text-center"
          >
            <div className="text-xl md:text-2xl font-bold text-gradient">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Partners & Certifications */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-center flex-wrap gap-4 pt-4 border-t border-border/30"
      >
        <span className="text-xs text-muted-foreground">Verified by:</span>
        {['CertiK', 'SlowMist', 'PeckShield', 'Hacken'].map((partner) => (
          <span
            key={partner}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <CheckCircle className="w-3 h-3 text-green-500" />
            {partner}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default SecurityBadge;
