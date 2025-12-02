import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Shield, Eye, Database, Share2, Lock, Bell, Trash2, Globe } from 'lucide-react';

const Privacy = () => {
  const sections = [
    {
      icon: <Database className="w-5 h-5" />,
      title: '1. Information We Collect',
      content: `We collect information you provide directly to us, including:

• Wallet addresses when you connect to our Platform
• Transaction data related to your use of our services
• Communication data when you contact our support team
• Device and browser information for security purposes

We automatically collect certain information when you visit, use, or navigate our Platform. This information may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, and other technical information.`
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: '2. How We Use Your Information',
      content: `We use the information we collect for various purposes, including to:

• Provide, maintain, and improve our services
• Process transactions and send related information
• Send you technical notices, updates, and support messages
• Respond to your comments, questions, and requests
• Monitor and analyze trends, usage, and activities
• Detect, investigate, and prevent fraudulent transactions
• Personalize and improve your experience
• Comply with legal obligations and enforce our terms`
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      title: '3. Information Sharing',
      content: `We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:

• With your consent or at your direction
• To comply with laws, regulations, or legal requests
• To protect the rights, property, and safety of Fusion Exchange, our users, or others
• In connection with a merger, acquisition, or sale of assets
• With service providers who assist in our operations (under strict confidentiality agreements)

We may share aggregated or anonymized information that does not directly identify you.`
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: '4. Data Security',
      content: `We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.

Our security measures include:

• Encryption of data in transit and at rest
• Regular security assessments and penetration testing
• Access controls and authentication mechanisms
• Monitoring for suspicious activities
• Employee training on data protection

While we strive to protect your personal information, we cannot guarantee its absolute security.`
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: '5. Cookies and Tracking',
      content: `We use cookies and similar tracking technologies to collect and use personal information about you. Cookies are small data files stored on your device that help us improve our services and your experience.

Types of cookies we use:

• Essential cookies: Required for the Platform to function properly
• Analytics cookies: Help us understand how visitors interact with our Platform
• Preference cookies: Remember your settings and preferences
• Security cookies: Help detect and prevent security threats

You can control cookies through your browser settings, but disabling certain cookies may limit your ability to use some features of our Platform.`
    },
    {
      icon: <Trash2 className="w-5 h-5" />,
      title: '6. Data Retention and Deletion',
      content: `We retain personal information for as long as necessary to fulfill the purposes for which it was collected, including to satisfy legal, accounting, or reporting requirements.

The criteria used to determine our retention periods include:

• The length of time we have an ongoing relationship with you
• Whether there is a legal obligation to which we are subject
• Whether retention is advisable in light of our legal position

You may request deletion of your personal information by contacting us. Please note that we may retain certain information as required by law or for legitimate business purposes.`
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: '7. International Data Transfers',
      content: `Your information may be transferred to, and processed in, countries other than the country in which you are resident. These countries may have data protection laws that are different from the laws of your country.

We have taken appropriate safeguards to require that your personal information will remain protected in accordance with this Privacy Policy. These include implementing standard contractual clauses for transfers of personal information between our group companies and third-party service providers.`
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: '8. Your Privacy Rights',
      content: `Depending on your location, you may have certain rights regarding your personal information, including:

• The right to access your personal information
• The right to correct inaccurate information
• The right to delete your personal information
• The right to data portability
• The right to opt-out of certain processing activities
• The right to withdraw consent

To exercise any of these rights, please contact us using the information provided below. We will respond to your request within a reasonable timeframe.`
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
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-display mb-4">
              Privacy <span className="text-gradient">Policy</span>
            </h1>
            <p className="text-muted-foreground">
              Last updated: December 2024
            </p>
          </div>

          {/* Introduction */}
          <Card className="glass-effect border-border/50 p-6 mb-8">
            <p className="text-muted-foreground leading-relaxed">
              At Fusion Exchange, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform. Please read this privacy policy carefully. By using the Platform, you consent to the data practices described in this policy.
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
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us at{' '}
              <a href="mailto:privacy@fusionexchange.io" className="text-primary hover:underline">
                privacy@fusionexchange.io
              </a>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
