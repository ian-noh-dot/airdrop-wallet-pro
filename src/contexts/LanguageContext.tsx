import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'zh' | 'es' | 'ko' | 'ja' | 'ar';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

export const translations: Translations = {
  // Navbar
  'nav.airdrop': { en: 'Airdrop', zh: '空投', es: 'Airdrop', ko: '에어드롭', ja: 'エアドロップ', ar: 'إيردروب' },
  'nav.dashboard': { en: 'Dashboard', zh: '仪表板', es: 'Panel', ko: '대시보드', ja: 'ダッシュボード', ar: 'لوحة القيادة' },
  'nav.swap': { en: 'Swap', zh: '交换', es: 'Intercambiar', ko: '스왑', ja: 'スワップ', ar: 'مبادلة' },
  'nav.stake': { en: 'Stake', zh: '质押', es: 'Stake', ko: '스테이킹', ja: 'ステーキング', ar: 'ستيك' },
  'nav.bridge': { en: 'Bridge', zh: '跨链桥', es: 'Puente', ko: '브릿지', ja: 'ブリッジ', ar: 'جسر' },
  'nav.nft': { en: 'NFT', zh: 'NFT', es: 'NFT', ko: 'NFT', ja: 'NFT', ar: 'NFT' },
  
  // Hero
  'hero.title': { en: 'Claim Your Free', zh: '领取您的免费', es: 'Reclama Tu', ko: '무료로 받으세요', ja: '無料でゲット', ar: 'احصل على مجاني' },
  'hero.tokens': { en: 'FUSION Tokens', zh: 'FUSION 代币', es: 'Tokens FUSION', ko: 'FUSION 토큰', ja: 'FUSIONトークン', ar: 'رموز FUSION' },
  'hero.subtitle': { en: 'Join 500,000+ users earning passive income with up to 500% APY staking rewards', zh: '加入50万+用户，通过高达500% APY质押奖励赚取被动收入', es: 'Únete a más de 500,000 usuarios ganando ingresos pasivos con hasta 500% APY', ko: '500,000명 이상의 사용자와 함께 최대 500% APY로 수동 소득을 벌어보세요', ja: '50万人以上のユーザーと最大500% APYで受動収入を得よう', ar: 'انضم إلى أكثر من 500,000 مستخدم يكسبون دخلاً سلبياً بنسبة تصل إلى 500% APY' },
  'hero.claim': { en: 'Claim Airdrop', zh: '领取空投', es: 'Reclamar Airdrop', ko: '에어드롭 받기', ja: 'エアドロップを受け取る', ar: 'احصل على الإيردروب' },
  'hero.connect': { en: 'Connect Wallet', zh: '连接钱包', es: 'Conectar Billetera', ko: '지갑 연결', ja: 'ウォレットを接続', ar: 'ربط المحفظة' },
  
  // Stats
  'stats.tvl': { en: 'Total Value Locked', zh: '总锁仓价值', es: 'Valor Total Bloqueado', ko: '총 예치 가치', ja: '総ロック価値', ar: 'إجمالي القيمة المقفلة' },
  'stats.users': { en: 'Active Users', zh: '活跃用户', es: 'Usuarios Activos', ko: '활성 사용자', ja: 'アクティブユーザー', ar: 'المستخدمون النشطون' },
  'stats.rewards': { en: 'Rewards Paid', zh: '已支付奖励', es: 'Recompensas Pagadas', ko: '지급된 보상', ja: '支払済み報酬', ar: 'المكافآت المدفوعة' },
  'stats.apy': { en: 'Max APY', zh: '最高年化', es: 'APY Máximo', ko: '최대 APY', ja: '最大APY', ar: 'أعلى APY' },
  
  // Features
  'feature.lowFees': { en: 'Lowest Fees', zh: '最低费用', es: 'Tarifas Más Bajas', ko: '최저 수수료', ja: '最低手数料', ar: 'أقل الرسوم' },
  'feature.lowFeesDesc': { en: 'Only 0.1% swap fee - 10x cheaper than competitors', zh: '仅0.1%交换费用 - 比竞争对手便宜10倍', es: 'Solo 0.1% de comisión - 10 veces más barato', ko: '0.1% 스왑 수수료만 - 경쟁사보다 10배 저렴', ja: 'スワップ手数料わずか0.1% - 競合の10分の1', ar: 'رسوم تبديل 0.1% فقط - أرخص 10 مرات' },
  'feature.instant': { en: 'Instant Swaps', zh: '即时交换', es: 'Intercambios Instantáneos', ko: '즉시 스왑', ja: '即時スワップ', ar: 'تبادل فوري' },
  'feature.instantDesc': { en: 'Lightning fast transactions under 2 seconds', zh: '闪电般快速交易，不到2秒', es: 'Transacciones ultrarrápidas en menos de 2 segundos', ko: '2초 미만의 번개 같은 빠른 거래', ja: '2秒未満の超高速取引', ar: 'معاملات سريعة البرق في أقل من ثانيتين' },
  'feature.secure': { en: 'Bank-Grade Security', zh: '银行级安全', es: 'Seguridad Bancaria', ko: '은행급 보안', ja: '銀行レベルのセキュリティ', ar: 'أمان بنكي' },
  'feature.secureDesc': { en: 'Audited by CertiK & Hacken with $10M insurance', zh: '经CertiK和Hacken审计，1000万美元保险', es: 'Auditado por CertiK y Hacken con $10M de seguro', ko: 'CertiK & Hacken 감사, $10M 보험', ja: 'CertiK & Hacken監査済み、$10M保険付き', ar: 'مراجعة من CertiK و Hacken مع تأمين 10 مليون دولار' },
  
  // Staking
  'stake.title': { en: 'Stake & Earn', zh: '质押赚取', es: 'Stake y Gana', ko: '스테이킹 & 수익', ja: 'ステーキング＆稼ぐ', ar: 'ستيك واربح' },
  'stake.subtitle': { en: 'Earn up to 500% APY with flexible lock periods', zh: '灵活锁定期，最高500% APY', es: 'Gana hasta 500% APY con períodos de bloqueo flexibles', ko: '유연한 잠금 기간으로 최대 500% APY 획득', ja: '柔軟なロック期間で最大500% APYを獲得', ar: 'اربح حتى 500% APY مع فترات قفل مرنة' },
  
  // Bridge
  'bridge.title': { en: 'Cross-Chain Bridge', zh: '跨链桥', es: 'Puente Cross-Chain', ko: '크로스체인 브릿지', ja: 'クロスチェーンブリッジ', ar: 'جسر عبر السلاسل' },
  'bridge.subtitle': { en: 'Transfer tokens across networks instantly with zero slippage', zh: '零滑点即时跨网络转移代币', es: 'Transfiere tokens entre redes instantáneamente sin deslizamiento', ko: '슬리피지 없이 즉시 네트워크간 토큰 전송', ja: 'スリッページゼロで即座にネットワーク間トークン転送', ar: 'انقل الرموز عبر الشبكات فوراً بدون انزلاق' },
  
  // Common
  'common.connectWallet': { en: 'Connect Wallet', zh: '连接钱包', es: 'Conectar Billetera', ko: '지갑 연결', ja: 'ウォレット接続', ar: 'ربط المحفظة' },
  'common.learnMore': { en: 'Learn More', zh: '了解更多', es: 'Saber Más', ko: '더 알아보기', ja: '詳しく見る', ar: 'اعرف المزيد' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
] as const;
