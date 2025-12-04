import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PriceChartProps {
  token?: string;
  compact?: boolean;
}

const PriceChart = ({ token = 'FUSION', compact = false }: PriceChartProps) => {
  const { t } = useLanguage();
  const [timeframe, setTimeframe] = useState('24H');
  
  // Simulated price data
  const generateData = (tf: string) => {
    const points = tf === '1H' ? 12 : tf === '24H' ? 24 : tf === '7D' ? 7 : tf === '30D' ? 30 : 12;
    const basePrice = token === 'FUSION' ? 1.50 : token === 'ETH' ? 2400 : token === 'BNB' ? 300 : 1;
    const volatility = 0.05;
    
    return Array.from({ length: points }, (_, i) => {
      const change = (Math.random() - 0.45) * volatility * basePrice;
      const price = basePrice + change * (i / points);
      return {
        time: tf === '1H' ? `${i * 5}m` : tf === '24H' ? `${i}h` : tf === '7D' ? `Day ${i + 1}` : `${i + 1}`,
        price: Number(price.toFixed(4)),
        volume: Math.floor(Math.random() * 1000000) + 500000,
      };
    });
  };

  const data = generateData(timeframe);
  const currentPrice = data[data.length - 1]?.price || 0;
  const startPrice = data[0]?.price || 0;
  const priceChange = ((currentPrice - startPrice) / startPrice) * 100;
  const isPositive = priceChange >= 0;

  const timeframes = ['1H', '24H', '7D', '30D', '1Y'];

  if (compact) {
    return (
      <div className="h-16 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <Card className="glass-effect border-border/50 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">{token}/USD</h3>
            <span className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
            </span>
          </div>
          <div className="text-2xl font-bold text-gradient">${currentPrice.toFixed(4)}</div>
        </div>
        
        <div className="flex gap-1 p-1 rounded-lg bg-secondary/50">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              size="sm"
              variant={timeframe === tf ? 'default' : 'ghost'}
              className={timeframe === tf ? 'gradient-primary text-primary-foreground' : ''}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>

      <motion.div
        key={timeframe}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-64"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPriceFull" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
              domain={['auto', 'auto']}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-card)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => [`$${value.toFixed(4)}`, 'Price']}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#colorPriceFull)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/50">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">{t('chart.high')}</p>
          <p className="font-semibold text-green-500">${(currentPrice * 1.05).toFixed(4)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">{t('chart.low')}</p>
          <p className="font-semibold text-red-500">${(currentPrice * 0.95).toFixed(4)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">{t('chart.volume')}</p>
          <p className="font-semibold">$2.4M</p>
        </div>
      </div>
    </Card>
  );
};

export default PriceChart;
