import { Link } from 'react-router-dom';
import { 
  Zap, 
  Twitter, 
  Github, 
  MessageCircle,
  Mail,
  Globe,
  Shield,
  FileText
} from 'lucide-react';
import Newsletter from './Newsletter';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    platform: [
      { name: 'Airdrop', href: '/' },
      { name: 'Swap', href: '/swap' },
      { name: 'Stake', href: '/stake' },
      { name: 'Bridge', href: '/bridge' },
      { name: 'NFT Mint', href: '/nft' },
    ],
    resources: [
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Portfolio', href: '/portfolio' },
      { name: 'Transaction History', href: '/history' },
      { name: 'Dashboard', href: '/dashboard' },
    ],
    legal: [
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
    ],
    social: [
      { name: 'Twitter', icon: <Twitter className="w-5 h-5" />, href: 'https://twitter.com' },
      { name: 'Discord', icon: <MessageCircle className="w-5 h-5" />, href: 'https://discord.com' },
      { name: 'GitHub', icon: <Github className="w-5 h-5" />, href: 'https://github.com' },
    ],
  };

  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-effect">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-display">
                Fusion<span className="text-primary">Exchange</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              The next generation decentralized exchange with the most rewarding airdrop program.
            </p>
            <div className="flex space-x-3">
              {links.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-secondary hover:bg-primary/20 flex items-center justify-center transition-colors text-muted-foreground hover:text-primary"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center">
              <Globe className="w-4 h-4 mr-2 text-primary" />
              Platform
            </h4>
            <ul className="space-y-2">
              {links.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-primary" />
              Resources
            </h4>
            <ul className="space-y-2">
              {links.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold mb-4 flex items-center">
              <Shield className="w-4 h-4 mr-2 text-primary" />
              Legal
            </h4>
            <ul className="space-y-2 mb-6">
              {links.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mb-4">
              <a
                href="mailto:support@fusionexchange.io"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center"
              >
                <Mail className="w-4 h-4 mr-2" />
                support@fusionexchange.io
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mb-8">
          <Newsletter />
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {currentYear} Fusion Exchange. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                All systems operational
              </span>
              <span>|</span>
              <span>CertiK Audited</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
