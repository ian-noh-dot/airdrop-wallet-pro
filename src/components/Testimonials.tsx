import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Alex M.',
      role: 'DeFi Trader',
      avatar: '👨‍💻',
      text: "Best DEX I've used. The 0.1% fees saved me over $500 last month alone. The staking rewards are incredible!",
      rating: 5,
      earned: '$12,450',
    },
    {
      name: 'Sarah K.',
      role: 'Crypto Investor',
      avatar: '👩‍🚀',
      text: 'Started with the airdrop, now I stake my FUSION and earn passive income daily. Customer support is amazing too.',
      rating: 5,
      earned: '$8,200',
    },
    {
      name: 'Michael T.',
      role: 'Yield Farmer',
      avatar: '🧑‍💼',
      text: 'The 500% APY on staking seemed too good to be true, but I\'ve been earning consistently for 3 months now.',
      rating: 5,
      earned: '$45,800',
    },
    {
      name: 'Jenny L.',
      role: 'NFT Collector',
      avatar: '👩‍🎨',
      text: 'Love the NFT minting feature! Got early access through my FUSION tokens. The community is incredible.',
      rating: 5,
      earned: '$6,300',
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Trusted by <span className="text-gradient">500,000+</span> Users
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See what our community is saying about their experience with Fusion Exchange
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass-effect border-border/50 p-6 h-full relative overflow-hidden group hover:border-primary/30 transition-all">
                <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>

                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>

                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  "{testimonial.text}"
                </p>

                <div className="pt-4 border-t border-border/50">
                  <div className="text-xs text-muted-foreground">Total Earned</div>
                  <div className="text-lg font-bold text-green-500">{testimonial.earned}</div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
