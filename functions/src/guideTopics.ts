// The curated topic list for the Learn hub. Add entries here and re-run the
// `runGuidesNow` trigger to generate any that don't exist yet (idempotent).
//
// `level` groups guides into a learning path; their order within a level is the
// order they appear in this array. `title` is canonical (it becomes the slug),
// and `brief` steers the AI on what the guide should cover.

export const LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type Level = (typeof LEVELS)[number];

export interface GuideTopic {
  /** Short subject grouping, e.g. "basics", "wallets", "security". */
  topic: string;
  level: Level;
  /** Canonical title — becomes the slug; the AI keeps it as-is. */
  title: string;
  /** What this guide should teach; guides the AI's content. */
  brief: string;
}

export const GUIDE_TOPICS: GuideTopic[] = [
  {
    topic: "basics",
    level: "beginner",
    title: "What Is Cryptocurrency? A Plain-English Introduction",
    brief:
      "Explain what cryptocurrency is to someone who has never used it: digital money, why it exists, how it differs from bank money, and what problems it tries to solve. Avoid hype and jargon.",
  },
  {
    topic: "basics",
    level: "beginner",
    title: "What Is a Blockchain and Why Does It Matter?",
    brief:
      "Explain blockchains simply: a shared ledger, blocks linked together, why it's hard to tamper with, and why this enables money without a central authority. Use everyday analogies.",
  },
  {
    topic: "basics",
    level: "beginner",
    title: "Bitcoin vs Ethereum: What's the Difference?",
    brief:
      "Compare Bitcoin and Ethereum for a beginner: Bitcoin as digital money/store of value, Ethereum as a programmable platform for apps and smart contracts. Keep it balanced and simple.",
  },
  {
    topic: "wallets",
    level: "beginner",
    title: "How Crypto Wallets Work",
    brief:
      "Explain that wallets store keys, not coins. Cover public vs private keys, addresses, and the idea that whoever holds the keys controls the funds. Set up the hot vs cold distinction.",
  },
  {
    topic: "wallets",
    level: "beginner",
    title: "Hot Wallets vs Cold Wallets: Which Should You Use?",
    brief:
      "Compare hot (online) and cold (offline) wallets: convenience vs security, typical use cases, and a sensible strategy of keeping spending money hot and savings cold.",
  },
  {
    topic: "wallets",
    level: "beginner",
    title: "Seed Phrases: How to Back Up and Protect Your Wallet",
    brief:
      "Explain what a seed phrase is, why it can restore a whole wallet, and how to store it safely offline. Stress never sharing it or typing it into websites.",
  },
  {
    topic: "getting-started",
    level: "beginner",
    title: "How to Buy Your First Crypto Safely",
    brief:
      "A step-by-step beginner walkthrough: choosing a reputable exchange, verifying identity, starting small, and moving funds to self-custody. Emphasise caution and not investing more than you can afford to lose.",
  },
  {
    topic: "security",
    level: "beginner",
    title: "How to Avoid Crypto Scams and Phishing",
    brief:
      "Teach newcomers to spot common scams: fake giveaways, phishing sites, impersonators, rug pulls, and 'guaranteed returns'. Give concrete red flags and safety habits.",
  },
  {
    topic: "basics",
    level: "beginner",
    title: "Understanding Gas Fees and Transactions",
    brief:
      "Explain transactions and gas fees for beginners: why fees exist, why they change with network demand, and that transactions are irreversible so details must be checked.",
  },
  {
    topic: "basics",
    level: "beginner",
    title: "Coins vs Tokens vs Stablecoins",
    brief:
      "Clarify the difference between coins (own blockchain), tokens (built on another chain), and stablecoins (value pegged to a currency). Give simple examples of each.",
  },
  {
    topic: "defi",
    level: "intermediate",
    title: "What Is DeFi? Decentralized Finance Explained",
    brief:
      "Explain DeFi for someone who understands the basics: lending, borrowing, trading and earning yield via smart contracts instead of banks. Cover the benefits and the real risks.",
  },
  {
    topic: "defi",
    level: "intermediate",
    title: "Staking and Earning Yield: How It Works and the Risks",
    brief:
      "Explain staking and yield: how proof-of-stake rewards work, what lock-up periods mean, and the risks (slashing, smart-contract bugs, unsustainable yields). Balanced, not promotional.",
  },
  {
    topic: "trading",
    level: "intermediate",
    title: "Reading the Market: Market Cap, Volume and Volatility",
    brief:
      "Teach how to read basic market metrics: market cap vs price, trading volume, liquidity, and volatility. Help readers evaluate a coin beyond its price tag.",
  },
  {
    topic: "security",
    level: "advanced",
    title: "Self-Custody Best Practices for Serious Holders",
    brief:
      "For experienced users: hardware wallets, multisig, passphrase (25th word), backup strategies, inheritance planning, and operational security. Practical and thorough.",
  },
];
