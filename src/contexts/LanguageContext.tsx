import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  'nav.swap': { en: 'Exchange', zh: '交换', es: 'Intercambiar', ko: '교환', ja: '交換', ar: 'تبادل' },
  'nav.stake': { en: 'Stake', zh: '质押', es: 'Stake', ko: '스테이킹', ja: 'ステーキング', ar: 'ستيك' },
  'nav.bridge': { en: 'Bridge', zh: '跨链桥', es: 'Puente', ko: '브릿지', ja: 'ブリッジ', ar: 'جسر' },
  'nav.nft': { en: 'NFT', zh: 'NFT', es: 'NFT', ko: 'NFT', ja: 'NFT', ar: 'NFT' },
  'nav.portfolio': { en: 'Portfolio', zh: '投资组合', es: 'Portafolio', ko: '포트폴리오', ja: 'ポートフォリオ', ar: 'محفظة' },
  
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
  'stake.amount': { en: 'Amount to Stake', zh: '质押金额', es: 'Cantidad a Stakear', ko: '스테이킹 금액', ja: 'ステーキング額', ar: 'المبلغ للستيك' },
  'stake.balance': { en: 'Balance', zh: '余额', es: 'Saldo', ko: '잔액', ja: '残高', ar: 'الرصيد' },
  'stake.period': { en: 'Lock Period', zh: '锁定期', es: 'Período de Bloqueo', ko: '잠금 기간', ja: 'ロック期間', ar: 'فترة القفل' },
  'stake.days': { en: 'Days', zh: '天', es: 'Días', ko: '일', ja: '日', ar: 'أيام' },
  'stake.rewards': { en: 'Staking Rewards', zh: '质押奖励', es: 'Recompensas de Staking', ko: '스테이킹 보상', ja: 'ステーキング報酬', ar: 'مكافآت الستيك' },
  'stake.totalStaked': { en: 'Total Staked', zh: '总质押量', es: 'Total Stakeado', ko: '총 스테이킹', ja: '総ステーキング', ar: 'إجمالي الستيك' },
  'stake.yourStake': { en: 'Your Stake', zh: '您的质押', es: 'Tu Stake', ko: '내 스테이킹', ja: 'あなたのステーキング', ar: 'الستيك الخاص بك' },
  'stake.earned': { en: 'Rewards Earned', zh: '已赚取奖励', es: 'Recompensas Ganadas', ko: '획득 보상', ja: '獲得報酬', ar: 'المكافآت المكتسبة' },
  
  // Bridge
  'bridge.title': { en: 'Cross-Chain Bridge', zh: '跨链桥', es: 'Puente Cross-Chain', ko: '크로스체인 브릿지', ja: 'クロスチェーンブリッジ', ar: 'جسر عبر السلاسل' },
  'bridge.subtitle': { en: 'Transfer tokens across networks instantly with zero slippage', zh: '零滑点即时跨网络转移代币', es: 'Transfiere tokens entre redes instantáneamente sin deslizamiento', ko: '슬리피지 없이 즉시 네트워크간 토큰 전송', ja: 'スリッページゼロで即座にネットワーク間トークン転送', ar: 'انقل الرموز عبر الشبكات فوراً بدون انزلاق' },
  'bridge.from': { en: 'From Network', zh: '源网络', es: 'Desde Red', ko: '보내는 네트워크', ja: '送信元ネットワーク', ar: 'من الشبكة' },
  'bridge.to': { en: 'To Network', zh: '目标网络', es: 'A Red', ko: '받는 네트워크', ja: '送信先ネットワーク', ar: 'إلى الشبكة' },
  'bridge.amount': { en: 'Amount', zh: '金额', es: 'Cantidad', ko: '금액', ja: '金額', ar: 'المبلغ' },
  'bridge.fee': { en: 'Bridge Fee', zh: '桥接费用', es: 'Tarifa de Puente', ko: '브릿지 수수료', ja: 'ブリッジ手数料', ar: 'رسوم الجسر' },
  'bridge.time': { en: 'Est. Time', zh: '预计时间', es: 'Tiempo Est.', ko: '예상 시간', ja: '予想時間', ar: 'الوقت المقدر' },
  
  // Swap
  'swap.title': { en: 'Swap', zh: '交换', es: 'Intercambiar', ko: '스왑', ja: 'スワップ', ar: 'مبادلة' },
  'swap.from': { en: 'From', zh: '从', es: 'De', ko: '보내기', ja: '送信', ar: 'من' },
  'swap.to': { en: 'To', zh: '到', es: 'A', ko: '받기', ja: '受信', ar: 'إلى' },
  'swap.rate': { en: 'Rate', zh: '汇率', es: 'Tasa', ko: '환율', ja: 'レート', ar: 'السعر' },
  'swap.fee': { en: 'Swap Fee', zh: '交换费', es: 'Comisión', ko: '수수료', ja: '手数料', ar: 'رسوم المبادلة' },
  'swap.impact': { en: 'Price Impact', zh: '价格影响', es: 'Impacto en Precio', ko: '가격 영향', ja: '価格への影響', ar: 'تأثير السعر' },
  'swap.network': { en: 'Network Fee', zh: '网络费', es: 'Tarifa de Red', ko: '네트워크 수수료', ja: 'ネットワーク手数料', ar: 'رسوم الشبكة' },
  'swap.savings': { en: 'You save ~$25 compared to other DEXs', zh: '与其他DEX相比，您节省约$25', es: 'Ahorras ~$25 comparado con otros DEXs', ko: '다른 DEX 대비 ~$25 절약', ja: '他のDEXと比較して約$25節約', ar: 'توفر حوالي 25 دولار مقارنة بالمنصات الأخرى' },
  'swap.selectToken': { en: 'Select a Token', zh: '选择代币', es: 'Seleccionar Token', ko: '토큰 선택', ja: 'トークンを選択', ar: 'اختر رمزاً' },
  'swap.search': { en: 'Search by name or symbol', zh: '按名称或符号搜索', es: 'Buscar por nombre o símbolo', ko: '이름 또는 심볼로 검색', ja: '名前またはシンボルで検索', ar: 'البحث بالاسم أو الرمز' },
  
  // Chart
  'chart.high': { en: '24h High', zh: '24小时最高', es: 'Máximo 24h', ko: '24시간 최고', ja: '24時間高値', ar: 'أعلى 24 ساعة' },
  'chart.low': { en: '24h Low', zh: '24小时最低', es: 'Mínimo 24h', ko: '24시간 최저', ja: '24時間安値', ar: 'أدنى 24 ساعة' },
  'chart.volume': { en: '24h Volume', zh: '24小时交易量', es: 'Volumen 24h', ko: '24시간 거래량', ja: '24時間出来高', ar: 'حجم 24 ساعة' },
  
  // Onboarding
  'onboarding.welcome.title': { en: 'Welcome to Fusion!', zh: '欢迎来到Fusion!', es: '¡Bienvenido a Fusion!', ko: 'Fusion에 오신 것을 환영합니다!', ja: 'Fusionへようこそ!', ar: 'مرحباً بك في Fusion!' },
  'onboarding.welcome.desc': { en: 'The most rewarding DeFi platform', zh: '最具回报的DeFi平台', es: 'La plataforma DeFi más gratificante', ko: '가장 보상이 좋은 DeFi 플랫폼', ja: '最も報酬が高いDeFiプラットフォーム', ar: 'منصة DeFi الأكثر مكافأة' },
  'onboarding.wallet.title': { en: 'Connect Your Wallet', zh: '连接您的钱包', es: 'Conecta Tu Billetera', ko: '지갑 연결하기', ja: 'ウォレットを接続', ar: 'اربط محفظتك' },
  'onboarding.wallet.desc': { en: 'Securely connect any Web3 wallet', zh: '安全连接任何Web3钱包', es: 'Conecta cualquier billetera Web3 de forma segura', ko: '모든 Web3 지갑을 안전하게 연결', ja: 'どのWeb3ウォレットも安全に接続', ar: 'اربط أي محفظة Web3 بأمان' },
  'onboarding.airdrop.title': { en: 'Claim Free Tokens', zh: '领取免费代币', es: 'Reclama Tokens Gratis', ko: '무료 토큰 받기', ja: '無料トークンを獲得', ar: 'احصل على رموز مجانية' },
  'onboarding.airdrop.desc': { en: 'Get up to 2,500 FUSION tokens free', zh: '免费获得最多2,500个FUSION代币', es: 'Obtén hasta 2,500 tokens FUSION gratis', ko: '최대 2,500 FUSION 토큰 무료 획득', ja: '最大2,500 FUSIONトークンを無料で', ar: 'احصل على ما يصل إلى 2,500 رمز FUSION مجاناً' },
  'onboarding.swap.title': { en: 'Swap with Lowest Fees', zh: '以最低费用交换', es: 'Intercambia con las Tarifas Más Bajas', ko: '최저 수수료로 스왑', ja: '最低手数料でスワップ', ar: 'تبادل بأقل الرسوم' },
  'onboarding.swap.desc': { en: 'Trade tokens at just 0.1% fees', zh: '仅0.1%费用交易代币', es: 'Intercambia tokens con solo 0.1% de comisión', ko: '0.1% 수수료로 토큰 거래', ja: 'わずか0.1%の手数料でトークン取引', ar: 'تداول الرموز برسوم 0.1% فقط' },
  'onboarding.stake.title': { en: 'Earn 500% APY', zh: '赚取500% APY', es: 'Gana 500% APY', ko: '500% APY 수익', ja: '500% APYを獲得', ar: 'اربح 500% APY' },
  'onboarding.stake.desc': { en: 'Stake tokens for massive returns', zh: '质押代币获得巨额回报', es: 'Stakea tokens para rendimientos masivos', ko: '토큰을 스테이킹하여 대규모 수익 획득', ja: 'トークンをステーキングして大きなリターンを', ar: 'قم بستيك الرموز للحصول على عوائد ضخمة' },
  'onboarding.ready.title': { en: "You're All Set!", zh: '准备就绪!', es: '¡Estás Listo!', ko: '준비 완료!', ja: '準備完了!', ar: 'أنت جاهز!' },
  'onboarding.ready.desc': { en: 'Start your DeFi journey now', zh: '现在开始您的DeFi之旅', es: 'Comienza tu viaje DeFi ahora', ko: '지금 DeFi 여정을 시작하세요', ja: '今すぐDeFiの旅を始めよう', ar: 'ابدأ رحلة DeFi الآن' },
  'onboarding.next': { en: 'Next', zh: '下一步', es: 'Siguiente', ko: '다음', ja: '次へ', ar: 'التالي' },
  'onboarding.back': { en: 'Back', zh: '返回', es: 'Atrás', ko: '이전', ja: '戻る', ar: 'رجوع' },
  'onboarding.skip': { en: 'Skip', zh: '跳过', es: 'Omitir', ko: '건너뛰기', ja: 'スキップ', ar: 'تخطي' },
  'onboarding.start': { en: 'Get Started', zh: '开始', es: 'Comenzar', ko: '시작하기', ja: '始める', ar: 'ابدأ' },
  
  // Common
  'common.connectWallet': { en: 'Connect Wallet', zh: '连接钱包', es: 'Conectar Billetera', ko: '지갑 연결', ja: 'ウォレット接続', ar: 'ربط المحفظة' },
  'common.learnMore': { en: 'Learn More', zh: '了解更多', es: 'Saber Más', ko: '더 알아보기', ja: '詳しく見る', ar: 'اعرف المزيد' },
  'common.loading': { en: 'Loading...', zh: '加载中...', es: 'Cargando...', ko: '로딩 중...', ja: '読み込み中...', ar: 'جار التحميل...' },
  'common.error': { en: 'Error', zh: '错误', es: 'Error', ko: '오류', ja: 'エラー', ar: 'خطأ' },
  'common.success': { en: 'Success', zh: '成功', es: 'Éxito', ko: '성공', ja: '成功', ar: 'نجاح' },
  'common.confirm': { en: 'Confirm', zh: '确认', es: 'Confirmar', ko: '확인', ja: '確認', ar: 'تأكيد' },
  'common.cancel': { en: 'Cancel', zh: '取消', es: 'Cancelar', ko: '취소', ja: 'キャンセル', ar: 'إلغاء' },
  
  // Newsletter
  'newsletter.title': { en: 'Stay Updated', zh: '保持更新', es: 'Mantente Actualizado', ko: '최신 소식 받기', ja: '最新情報を入手', ar: 'ابق على اطلاع' },
  'newsletter.subtitle': { en: 'Get the latest updates on airdrops, new features, and exclusive rewards', zh: '获取空投、新功能和专属奖励的最新动态', es: 'Recibe las últimas actualizaciones sobre airdrops, nuevas funciones y recompensas exclusivas', ko: '에어드롭, 새 기능, 독점 보상에 대한 최신 소식을 받아보세요', ja: 'エアドロップ、新機能、限定特典の最新情報を入手', ar: 'احصل على آخر التحديثات حول الإيردروب والميزات الجديدة والمكافآت الحصرية' },
  'newsletter.placeholder': { en: 'Enter your email', zh: '输入您的邮箱', es: 'Ingresa tu email', ko: '이메일을 입력하세요', ja: 'メールアドレスを入力', ar: 'أدخل بريدك الإلكتروني' },
  'newsletter.subscribe': { en: 'Subscribe', zh: '订阅', es: 'Suscribirse', ko: '구독', ja: '購読', ar: 'اشترك' },
  'newsletter.success': { en: 'Successfully subscribed!', zh: '订阅成功!', es: '¡Suscripción exitosa!', ko: '구독 완료!', ja: '購読完了!', ar: 'تم الاشتراك بنجاح!' },
  
  // Portfolio
  'portfolio.title': { en: 'Portfolio', zh: '投资组合', es: 'Portafolio', ko: '포트폴리오', ja: 'ポートフォリオ', ar: 'محفظة' },
  'portfolio.holdings': { en: 'Holdings', zh: '持仓', es: 'Tenencias', ko: '보유량', ja: '保有', ar: 'الحيازات' },
  'portfolio.staked': { en: 'Staked', zh: '已质押', es: 'Stakeado', ko: '스테이킹됨', ja: 'ステーキング済み', ar: 'مستيك' },
  'portfolio.nfts': { en: 'NFTs', zh: 'NFTs', es: 'NFTs', ko: 'NFTs', ja: 'NFTs', ar: 'NFTs' },
  'portfolio.activity': { en: 'Recent Activity', zh: '最近活动', es: 'Actividad Reciente', ko: '최근 활동', ja: '最近のアクティビティ', ar: 'النشاط الأخير' },
  'portfolio.totalValue': { en: 'Total Value', zh: '总价值', es: 'Valor Total', ko: '총 가치', ja: '総価値', ar: 'القيمة الإجمالية' },
  
  // Footer
  'footer.about': { en: 'About', zh: '关于', es: 'Acerca de', ko: '소개', ja: '会社概要', ar: 'حول' },
  'footer.docs': { en: 'Documentation', zh: '文档', es: 'Documentación', ko: '문서', ja: 'ドキュメント', ar: 'التوثيق' },
  'footer.support': { en: 'Support', zh: '支持', es: 'Soporte', ko: '지원', ja: 'サポート', ar: 'الدعم' },
  'footer.terms': { en: 'Terms of Service', zh: '服务条款', es: 'Términos de Servicio', ko: '이용약관', ja: '利用規約', ar: 'شروط الخدمة' },
  'footer.privacy': { en: 'Privacy Policy', zh: '隐私政策', es: 'Política de Privacidad', ko: '개인정보처리방침', ja: 'プライバシーポリシー', ar: 'سياسة الخصوصية' },
  'footer.rights': { en: 'All rights reserved', zh: '版权所有', es: 'Todos los derechos reservados', ko: '모든 권리 보유', ja: '全著作権所有', ar: 'جميع الحقوق محفوظة' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('fusion_language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('fusion_language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

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
