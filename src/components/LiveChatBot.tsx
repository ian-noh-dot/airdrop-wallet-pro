import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Minimize2,
  Sparkles,
  HelpCircle,
  Wallet,
  Shield,
  Gift
} from 'lucide-react';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const LiveChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "👋 Hi there! I'm FusionBot, your 24/7 assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    { icon: <Wallet className="w-3 h-3" />, text: "How to connect wallet?" },
    { icon: <Gift className="w-3 h-3" />, text: "How to claim airdrop?" },
    { icon: <Shield className="w-3 h-3" />, text: "Is it safe?" },
    { icon: <HelpCircle className="w-3 h-3" />, text: "Need more help" },
  ];

  const botResponses: Record<string, string> = {
    "how to connect wallet": `🔗 **Connecting your wallet is easy:**

1. Click the "Connect Wallet" button
2. Choose your wallet (MetaMask, Trust Wallet, etc.)
3. Approve the connection in your wallet app
4. You're connected! 🎉

**New to wallets?** Click the "Need Help?" button for a step-by-step guide tailored to your wallet type.`,
    
    "how to claim airdrop": `🎁 **To claim your FUSION airdrop:**

1. Connect your wallet first
2. Click "Claim Your Tokens" on the Airdrop page
3. Wait for wallet verification (a few seconds)
4. Approve the transaction in your wallet
5. Receive your 2,500+ FUSION tokens!

**Pro tip:** Use a referral code to get extra 250 bonus tokens!`,
    
    "is it safe": `🛡️ **Fusion Exchange Security:**

✅ **CertiK Audited** - Professional security audit completed
✅ **Non-custodial** - You control your funds
✅ **Open Source** - Transparent smart contracts
✅ **SSL Encrypted** - All data is encrypted
✅ **No private keys** - We never ask for your seed phrase

**Important:** Never share your seed phrase with anyone!`,
    
    "need more help": `📚 **Here are more resources:**

• **FAQ Page** - Common questions answered
• **Tutorial** - Step-by-step wallet guides
• **Discord** - Join our community
• **Twitter** - Follow for updates

You can also ask me specific questions about:
• Staking & Rewards
• NFT Minting
• Swapping tokens
• Referral program`,
    
    "staking": `💰 **Staking on Fusion:**

Lock your FUSION tokens to earn up to **500% APY**!

**Lock Periods:**
• 30 days → 125% APY
• 90 days → 250% APY
• 180 days → 400% APY
• 365 days → 500% APY

Navigate to the **Stake** page to get started!`,
    
    "referral": `👥 **Referral Program:**

Earn **500 FUSION** for each friend you refer!

**How it works:**
1. Connect your wallet
2. Copy your unique referral link
3. Share with friends
4. Earn 500 tokens per signup

Check the **Leaderboard** to see top referrers!`,
    
    "nft": `🎨 **Fusion NFT Collection:**

Mint exclusive NFTs for premium benefits:

• **Bronze** (0.05 ETH) - 5% fee discount
• **Silver** (0.1 ETH) - 10% discount + priority support
• **Gold** (0.25 ETH) - 20% discount + governance
• **Diamond** (0.5 ETH) - 50% discount + revenue share

Visit the **NFT** page to mint!`,
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    for (const [key, response] of Object.entries(botResponses)) {
      if (lowerInput.includes(key)) {
        return response;
      }
    }
    
    // Default response
    return `I understand you're asking about "${input}". 

Here's what I can help you with:
• Wallet connection
• Airdrop claiming
• Staking & rewards
• NFT minting
• Security questions
• Referral program

Try asking about any of these topics, or click one of the quick reply buttons below! 😊`;
  };

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: messageText,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot thinking
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: getBotResponse(messageText),
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 rounded-full gradient-primary glow-effect shadow-2xl"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-[380px]"
          >
            <Card className="glass-effect border-border/50 overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="gradient-primary p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-white">FusionBot</div>
                    <div className="text-xs text-white/80 flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5" />
                      Online 24/7
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20 w-8 h-8"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    <Minimize2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20 w-8 h-8"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <AnimatePresence>
                {!isMinimized && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                  >
                    <div className="h-[350px] overflow-y-auto p-4 space-y-4 bg-background/50">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`flex items-start space-x-2 max-w-[85%] ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              message.isBot ? 'gradient-primary' : 'bg-secondary'
                            }`}>
                              {message.isBot ? (
                                <Bot className="w-4 h-4 text-white" />
                              ) : (
                                <User className="w-4 h-4" />
                              )}
                            </div>
                            <div className={`p-3 rounded-2xl ${
                              message.isBot 
                                ? 'bg-secondary rounded-tl-none' 
                                : 'gradient-primary text-white rounded-tr-none'
                            }`}>
                              <div className="text-sm whitespace-pre-line">{message.text}</div>
                              <div className={`text-xs mt-1 ${message.isBot ? 'text-muted-foreground' : 'text-white/70'}`}>
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Typing Indicator */}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center space-x-2"
                        >
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-secondary p-3 rounded-2xl rounded-tl-none">
                            <div className="flex space-x-1">
                              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Replies */}
                    <div className="px-4 py-2 border-t border-border/50 bg-secondary/30">
                      <div className="flex flex-wrap gap-2">
                        {quickReplies.map((reply, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleSend(reply.text)}
                          >
                            {reply.icon}
                            <span className="ml-1">{reply.text}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-border/50 bg-background">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Type your message..."
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleSend()}
                          disabled={!inputValue.trim()}
                          className="gradient-primary"
                          size="icon"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2 text-center flex items-center justify-center">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Powered by FusionBot AI
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveChatBot;
