import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { FileText, Shield, Scale, AlertTriangle, Users, Lock } from 'lucide-react';

const Terms = () => {
  const sections = [
    {
      icon: <FileText className="w-5 h-5" />,
      title: '1. Acceptance of Terms',
      content: `By accessing and using Fusion Exchange ("the Platform"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.

The materials contained in this Platform are protected by applicable copyright and trademark law. These Terms of Service apply to all users of the Platform, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.`
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: '2. User Eligibility',
      content: `You must be at least 18 years old to use this Platform. By using the Platform, you represent and warrant that you are at least 18 years of age and have the legal capacity to enter into these Terms.

You are responsible for ensuring that your use of the Platform complies with all laws, rules, and regulations applicable to you. Your right to access the Platform is revoked where these Terms or use of the Platform is prohibited.

Users from restricted jurisdictions are not permitted to use this Platform. It is your responsibility to verify whether your jurisdiction allows the use of cryptocurrency trading platforms.`
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: '3. Account Security',
      content: `You are responsible for maintaining the confidentiality of your wallet credentials and for all activities that occur under your account. You agree to:

• Immediately notify us of any unauthorized use of your account
• Ensure that you exit from your account at the end of each session
• Keep your wallet seed phrases and private keys secure
• Not share your account credentials with any third party

We reserve the right to refuse service, terminate accounts, or cancel orders at our sole discretion if we suspect fraudulent, illegal, or unauthorized activity.`
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: '4. Risk Disclosure',
      content: `Trading and investing in cryptocurrencies involves substantial risk of loss and is not suitable for every investor. The valuation of cryptocurrencies and tokens may fluctuate, and, as a result, you may lose more than your original investment.

You acknowledge and agree that:

• Past performance is not indicative of future results
• You should not invest money that you cannot afford to lose
• You are solely responsible for any trading decisions you make
• The Platform does not provide financial, investment, or legal advice
• Cryptocurrency markets can be highly volatile and unpredictable

By using this Platform, you acknowledge that you understand these risks and agree to assume full responsibility for any losses you may incur.`
    },
    {
      icon: <Scale className="w-5 h-5" />,
      title: '5. Limitation of Liability',
      content: `To the maximum extent permitted by applicable law, Fusion Exchange and its affiliates, officers, employees, agents, partners, and licensors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.

In no event shall our total liability to you for all claims arising out of or relating to these Terms or your use of the Platform exceed the amount paid by you to Fusion Exchange in the twelve (12) months preceding the claim.

Some jurisdictions do not allow the exclusion of certain warranties or the limitation of liability for consequential or incidental damages, so the above limitations may not apply to you.`
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: '6. Intellectual Property',
      content: `The Platform and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by Fusion Exchange, its licensors, or other providers of such material and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.

You are granted a limited, non-exclusive, non-transferable, and revocable license to access and use the Platform for personal, non-commercial purposes. This license does not include the right to:

• Modify or copy the materials
• Use the materials for any commercial purpose
• Remove any copyright or other proprietary notations from the materials
• Transfer the materials to another person or "mirror" the materials on any other server`
    },
  ];

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary glow-effect mb-6">
              <FileText className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-display mb-4">
              Terms of <span className="text-gradient">Service</span>
            </h1>
            <p className="text-muted-foreground">
              Last updated: December 2024
            </p>
          </div>

          {/* Introduction */}
          <Card className="glass-effect border-border/50 p-6 mb-8">
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Fusion Exchange. These Terms of Service ("Terms") govern your access to and use of our website, products, and services ("Platform"). Please read these Terms carefully before using the Platform. By using or accessing the Platform, you agree to be bound by these Terms and our Privacy Policy.
            </p>
          </Card>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-effect border-border/50 p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <span className="text-primary mr-3">{section.icon}</span>
                    {section.title}
                  </h2>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Contact */}
          <Card className="glass-effect border-border/50 p-6 mt-8">
            <h2 className="text-xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:legal@fusionexchange.io" className="text-primary hover:underline">
                legal@fusionexchange.io
              </a>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
