// Crypto glossary — a static, evergreen dataset of beginner-friendly definitions.
// Kept in code (not Firestore) because the terms change rarely and need no
// pipeline. Definitions are short Markdown so they render through `PostBody`.

export interface GlossaryTerm {
  /** Display name, e.g. "Private Key". */
  term: string;
  /** URL slug, e.g. "private-key". */
  slug: string;
  /** One-line plain summary shown on the index and as the meta description. */
  short: string;
  /** Full definition in Markdown for the term detail page. */
  definition: string;
  /** Slugs of related terms to cross-link. */
  related?: string[];
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: "Blockchain",
    slug: "blockchain",
    short: "A shared, tamper-resistant ledger of transactions maintained by many computers.",
    definition:
      "A **blockchain** is a digital ledger shared across thousands of computers. Transactions are grouped into *blocks* and chained together in order, each block cryptographically linked to the one before it.\n\nBecause every participant holds a copy and the links can't be altered without redoing all later blocks, the record is extremely hard to tamper with. This is what lets crypto networks operate **without a central authority** like a bank.",
    related: ["node", "decentralization", "consensus"],
  },
  {
    term: "Wallet",
    slug: "wallet",
    short: "Software or hardware that stores your keys and lets you send and receive crypto.",
    definition:
      "A **crypto wallet** doesn't actually hold your coins — the coins live on the blockchain. Instead, a wallet stores your **private keys**, which prove you own those coins and let you spend them.\n\nWallets come in two broad types:\n\n- **Hot wallets** are connected to the internet (apps, browser extensions). Convenient but more exposed.\n- **Cold wallets** stay offline (hardware devices, paper). Safer for long-term holdings.",
    related: ["private-key", "seed-phrase", "cold-storage", "hot-wallet"],
  },
  {
    term: "Private Key",
    slug: "private-key",
    short: "The secret number that controls your crypto. Anyone who has it controls your funds.",
    definition:
      "A **private key** is a secret number that lets you authorise transactions from your wallet. Think of it as the master password to your funds.\n\nWhoever holds the private key controls the coins — there is no \"forgot password\" and no support line. **Never share it, screenshot it, or type it into a website.**",
    related: ["public-key", "seed-phrase", "wallet"],
  },
  {
    term: "Public Key",
    slug: "public-key",
    short: "Your wallet's shareable address, derived from your private key.",
    definition:
      "A **public key** (and the wallet *address* derived from it) is what you share to receive crypto — like an account number. It's safe to give out.\n\nIt's mathematically linked to your **private key**, but the math only works one way: people can send to your public address, yet they can't reverse it to find your private key.",
    related: ["private-key", "wallet"],
  },
  {
    term: "Seed Phrase",
    slug: "seed-phrase",
    short: "A list of 12–24 words that can restore your entire wallet. Guard it like cash.",
    definition:
      "A **seed phrase** (or *recovery phrase*) is a human-readable backup of your wallet — usually **12 or 24 words**. From it, your wallet can regenerate every private key it holds.\n\nIf you lose your device but have the seed phrase, you recover everything. If someone else gets your seed phrase, they get everything. **Write it on paper, store it offline, and never enter it into a website or app you didn't initiate.**",
    related: ["private-key", "wallet", "cold-storage"],
  },
  {
    term: "Cold Storage",
    slug: "cold-storage",
    short: "Keeping keys completely offline to protect them from online attacks.",
    definition:
      "**Cold storage** means keeping your private keys on a device that never touches the internet — a hardware wallet, or even a phrase written on paper.\n\nBecause hackers can't reach an offline key, cold storage is the standard for holding larger amounts long-term. The trade-off is convenience: you have to physically access the device to move funds.",
    related: ["hot-wallet", "wallet", "seed-phrase"],
  },
  {
    term: "Hot Wallet",
    slug: "hot-wallet",
    short: "An internet-connected wallet — convenient for spending, riskier for storage.",
    definition:
      "A **hot wallet** is any wallet connected to the internet: a phone app, a browser extension, or an exchange account. It's great for everyday spending and trading because it's always available.\n\nThe downside is exposure — being online makes it a bigger target. A common approach is to keep small, spendable amounts in a hot wallet and the rest in **cold storage**.",
    related: ["cold-storage", "wallet"],
  },
  {
    term: "Gas",
    slug: "gas",
    short: "The fee you pay to have the network process your transaction.",
    definition:
      "**Gas** is the fee paid to the network's validators to include and process your transaction. On Ethereum and similar chains, gas is priced in tiny units and fluctuates with demand.\n\nWhen the network is busy, gas prices rise — your transaction competes with everyone else's. Pay more for faster confirmation, or wait for a quieter time to pay less.",
    related: ["ethereum", "transaction", "validator"],
  },
  {
    term: "DeFi",
    slug: "defi",
    short: "Decentralized Finance — financial services running on blockchains without banks.",
    definition:
      "**DeFi** (Decentralized Finance) refers to financial services — lending, borrowing, trading, earning interest — built on blockchains and run by **smart contracts** instead of banks or brokers.\n\nAnyone with a wallet can use DeFi apps, often without sign-ups or approval. The upside is openness and control; the risks include smart-contract bugs and scams, so caution matters.",
    related: ["smart-contract", "staking", "dex", "ethereum"],
  },
  {
    term: "Smart Contract",
    slug: "smart-contract",
    short: "Self-executing code on a blockchain that runs exactly as programmed.",
    definition:
      "A **smart contract** is a program stored on a blockchain that runs automatically when its conditions are met — no middleman required. It might swap two tokens, release funds, or mint an NFT.\n\nBecause the code is public and runs as written, smart contracts are transparent and predictable. But bugs are permanent and exploitable, which is why audits matter.",
    related: ["defi", "ethereum", "dapp", "nft"],
  },
  {
    term: "Staking",
    slug: "staking",
    short: "Locking up crypto to help secure a network and earn rewards.",
    definition:
      "**Staking** means locking up coins to help operate and secure a **proof-of-stake** network. In return, you earn rewards — a bit like interest.\n\nStaking supports the network's security: stakers who validate honestly earn rewards, while bad actors can lose part of their stake. Returns vary by network, and your coins may be locked for a period.",
    related: ["consensus", "validator", "defi"],
  },
  {
    term: "NFT",
    slug: "nft",
    short: "A unique, ownable token on a blockchain — often tied to art or collectibles.",
    definition:
      "An **NFT** (Non-Fungible Token) is a one-of-a-kind token recorded on a blockchain. Unlike a coin, where every unit is identical and interchangeable, each NFT is unique and can represent ownership of art, collectibles, in-game items, and more.\n\nThe blockchain provides a public record of who owns what, though the value of any given NFT is driven entirely by what people will pay.",
    related: ["smart-contract", "blockchain", "token"],
  },
  {
    term: "Token",
    slug: "token",
    short: "A digital asset built on an existing blockchain, like Ethereum.",
    definition:
      "A **token** is a crypto asset created on top of an existing blockchain rather than having its own. Many tokens live on Ethereum and follow shared standards (like ERC-20) so wallets and apps can support them easily.\n\nTokens can represent currencies, voting rights in a project, access to a service, or stakes in DeFi protocols.",
    related: ["coin", "ethereum", "smart-contract", "altcoin"],
  },
  {
    term: "Coin",
    slug: "coin",
    short: "A cryptocurrency that runs on its own blockchain, like Bitcoin or Ether.",
    definition:
      "A **coin** is a cryptocurrency native to its own blockchain — **Bitcoin** on the Bitcoin network, **Ether** on Ethereum. This is the key contrast with a **token**, which is built on top of another chain.\n\nCoins are typically used to pay network fees and reward the validators or miners that secure the chain.",
    related: ["token", "altcoin", "bitcoin"],
  },
  {
    term: "Altcoin",
    slug: "altcoin",
    short: "Any cryptocurrency other than Bitcoin.",
    definition:
      "**Altcoin** is short for \"alternative coin\" — essentially any cryptocurrency that isn't **Bitcoin**. The term covers everything from large, established projects like Ethereum to thousands of small, speculative tokens.\n\nAltcoins range widely in quality and risk, so research matters before buying any of them.",
    related: ["coin", "token", "bitcoin"],
  },
  {
    term: "Bitcoin",
    slug: "bitcoin",
    short: "The first and largest cryptocurrency, launched in 2009.",
    definition:
      "**Bitcoin** is the original cryptocurrency, introduced in 2009 by the pseudonymous Satoshi Nakamoto. It runs on its own blockchain secured by **mining** and has a fixed maximum supply of 21 million coins.\n\nIt's often described as \"digital gold\" — valued mainly as a store of value and the asset that started the whole industry.",
    related: ["coin", "mining", "blockchain"],
  },
  {
    term: "Ethereum",
    slug: "ethereum",
    short: "A blockchain built for smart contracts and apps, with the coin Ether (ETH).",
    definition:
      "**Ethereum** is a blockchain designed to run **smart contracts** — programs that power DeFi, NFTs, and thousands of decentralized apps. Its native coin is **Ether (ETH)**, used to pay gas fees.\n\nWhere Bitcoin focuses on being money, Ethereum aims to be a global, programmable platform.",
    related: ["smart-contract", "gas", "defi", "coin"],
  },
  {
    term: "Mining",
    slug: "mining",
    short: "Using computing power to validate transactions and earn new coins.",
    definition:
      "**Mining** is how *proof-of-work* networks like Bitcoin confirm transactions. Miners compete to solve a hard math puzzle; the winner adds the next block and earns newly minted coins plus fees.\n\nAll that computation is what makes the chain secure — rewriting history would require out-computing the entire honest network.",
    related: ["bitcoin", "consensus", "validator"],
  },
  {
    term: "Consensus",
    slug: "consensus",
    short: "How a decentralized network agrees on which transactions are valid.",
    definition:
      "**Consensus** is the process by which a blockchain's participants agree on a single, shared version of the truth — without a central referee. The two most common mechanisms are **proof-of-work** (mining) and **proof-of-stake** (staking).\n\nGood consensus design is what keeps a network secure and prevents anyone from spending the same coins twice.",
    related: ["mining", "staking", "validator", "blockchain"],
  },
  {
    term: "Validator",
    slug: "validator",
    short: "A participant that checks and confirms transactions on a proof-of-stake chain.",
    definition:
      "A **validator** is a participant in a proof-of-stake network that proposes and verifies new blocks. To take part, a validator locks up (stakes) coins as a security deposit.\n\nValidators that follow the rules earn rewards; those that cheat can lose part of their stake. This incentive keeps the network honest.",
    related: ["staking", "consensus", "node"],
  },
  {
    term: "Node",
    slug: "node",
    short: "A computer that stores a copy of the blockchain and helps run the network.",
    definition:
      "A **node** is any computer running the blockchain's software and keeping a copy of the ledger. Nodes share transactions and blocks with each other, enforcing the network's rules.\n\nThe more independent nodes a network has, the more **decentralized** and resilient it is.",
    related: ["blockchain", "decentralization", "validator"],
  },
  {
    term: "Decentralization",
    slug: "decentralization",
    short: "Spreading control across many participants instead of one authority.",
    definition:
      "**Decentralization** means no single person, company, or government runs the network — control is spread across many independent participants worldwide.\n\nThis is crypto's core idea: it makes systems harder to censor, shut down, or manipulate. The trade-off is that decentralized systems can be slower and harder to change.",
    related: ["blockchain", "node", "consensus"],
  },
  {
    term: "DEX",
    slug: "dex",
    short: "A decentralized exchange that lets you trade crypto directly from your wallet.",
    definition:
      "A **DEX** (Decentralized Exchange) lets people trade tokens directly from their own wallets via smart contracts — no company holding your funds, no account sign-up.\n\nThis is the opposite of a **centralized exchange (CEX)**, where a company custodies your coins. DEXs give you more control but require you to manage your own wallet and keys.",
    related: ["cex", "defi", "smart-contract", "liquidity"],
  },
  {
    term: "CEX",
    slug: "cex",
    short: "A centralized exchange run by a company that holds your crypto for you.",
    definition:
      "A **CEX** (Centralized Exchange) is a company-run platform — like a brokerage — where you create an account and the company custodies your crypto. They're beginner-friendly and easy to use.\n\nThe catch is the old crypto saying: *\"not your keys, not your coins.\"* If the exchange is hacked or fails, your funds can be at risk. Many people move long-term holdings off exchanges into their own wallets.",
    related: ["dex", "wallet", "custody"],
  },
  {
    term: "Custody",
    slug: "custody",
    short: "Who controls the private keys — you (self-custody) or a third party.",
    definition:
      "**Custody** is about who holds the private keys to your crypto.\n\n- **Self-custody**: you hold your own keys, so only you control the funds — and only you are responsible for them.\n- **Custodial**: a third party (like an exchange) holds the keys for you, trading control for convenience.\n\nUnderstanding which one you're using is one of the most important things in crypto.",
    related: ["wallet", "cex", "private-key"],
  },
  {
    term: "Liquidity",
    slug: "liquidity",
    short: "How easily an asset can be bought or sold without moving its price much.",
    definition:
      "**Liquidity** describes how easily you can buy or sell an asset without significantly changing its price. A coin with high liquidity has lots of buyers and sellers, so trades fill quickly at fair prices.\n\nLow-liquidity tokens can be hard to exit and prone to sharp price swings — a common warning sign for risky assets.",
    related: ["dex", "market-cap", "volume"],
  },
  {
    term: "Market Cap",
    slug: "market-cap",
    short: "The total value of a coin: price multiplied by circulating supply.",
    definition:
      "**Market capitalisation** (market cap) is a coin's price multiplied by how many coins are in circulation. It's a quick gauge of a project's overall size and is often a better comparison than price alone.\n\nA \"cheap\" coin at $0.01 with a billion in supply can be worth far more in total than a $50,000 coin with tiny supply.",
    related: ["volume", "liquidity", "circulating-supply"],
  },
  {
    term: "Circulating Supply",
    slug: "circulating-supply",
    short: "The number of coins currently available and trading in the market.",
    definition:
      "**Circulating supply** is the number of coins that are publicly available and changing hands right now — excluding locked, reserved, or not-yet-released coins.\n\nIt's the figure used to calculate **market cap**, and comparing it to the *total* or *maximum* supply tells you how much potential dilution is still to come.",
    related: ["market-cap", "tokenomics"],
  },
  {
    term: "Volume",
    slug: "volume",
    short: "The total amount of an asset traded over a period, usually 24 hours.",
    definition:
      "**Volume** is how much of an asset has been traded in a given window — typically the last 24 hours. High volume signals strong interest and usually better **liquidity**.\n\nSudden volume spikes often accompany big news or price moves, while persistently low volume can be a sign of a thin, riskier market.",
    related: ["liquidity", "market-cap"],
  },
  {
    term: "Stablecoin",
    slug: "stablecoin",
    short: "A crypto token designed to hold a steady value, usually pegged to a dollar.",
    definition:
      "A **stablecoin** is a token engineered to stay at a stable value — most commonly **$1**. People use them to park value, trade, and move money without exposure to crypto's volatility.\n\nThey achieve stability in different ways (cash reserves, other crypto as collateral, or algorithms). The reserve-backed kinds are generally considered the most reliable.",
    related: ["token", "defi", "volatility"],
  },
  {
    term: "Volatility",
    slug: "volatility",
    short: "How sharply and quickly an asset's price moves up and down.",
    definition:
      "**Volatility** measures how much an asset's price swings. Crypto is famously volatile — double-digit percentage moves in a day are not unusual.\n\nVolatility means bigger potential gains *and* losses. It's a key reason to only invest what you can afford to lose and to be wary of hype-driven price spikes.",
    related: ["stablecoin", "market-cap", "fomo"],
  },
  {
    term: "FOMO",
    slug: "fomo",
    short: "Fear Of Missing Out — buying impulsively because a price is rising fast.",
    definition:
      "**FOMO** (Fear Of Missing Out) is the urge to jump into an asset because it's pumping and you don't want to miss the gains. It's one of the most common ways newcomers lose money.\n\nBuying at the top of a hype wave often means buying right before a pullback. A calm plan beats chasing green candles.",
    related: ["fud", "volatility", "fear-and-greed"],
  },
  {
    term: "FUD",
    slug: "fud",
    short: "Fear, Uncertainty, and Doubt — negative sentiment, sometimes spread deliberately.",
    definition:
      "**FUD** stands for *Fear, Uncertainty, and Doubt* — negative information or sentiment that scares people into selling. Sometimes it's legitimate concern; sometimes it's spread on purpose to push prices down.\n\nLike **FOMO**, the lesson is to judge claims on evidence rather than react emotionally to the crowd.",
    related: ["fomo", "fear-and-greed"],
  },
  {
    term: "Fear and Greed Index",
    slug: "fear-and-greed",
    short: "A 0–100 gauge summarising whether the market feels fearful or greedy.",
    definition:
      "The **Fear and Greed Index** condenses several market signals into a single number from **0 (extreme fear)** to **100 (extreme greed)**.\n\nIt's a sentiment snapshot, not a prediction. Contrarians sometimes treat extreme fear as a potential buying opportunity and extreme greed as a caution sign — but it's just one input among many.",
    related: ["fomo", "fud", "volatility"],
  },
  {
    term: "Rug Pull",
    slug: "rug-pull",
    short: "A scam where creators abandon a project and run off with investors' money.",
    definition:
      "A **rug pull** is a scam in which a project's creators hype a token, attract investment, then drain the funds and vanish — leaving holders with something worthless.\n\nWarning signs include anonymous teams, promises of guaranteed returns, no audit, and locked liquidity that can suddenly be removed. If it sounds too good to be true, it usually is.",
    related: ["scam", "liquidity", "defi"],
  },
  {
    term: "Scam / Phishing",
    slug: "scam",
    short: "Tricks designed to steal your crypto, often by stealing your keys.",
    definition:
      "Crypto attracts scams because transactions are irreversible. **Phishing** sites and messages try to trick you into entering your **seed phrase** or approving a malicious transaction.\n\nGolden rules: never share your seed phrase, double-check website addresses, ignore \"support\" that DMs you first, and be deeply skeptical of giveaways or guaranteed profits.",
    related: ["rug-pull", "seed-phrase", "private-key"],
  },
  {
    term: "Dapp",
    slug: "dapp",
    short: "A decentralized application that runs on a blockchain via smart contracts.",
    definition:
      "A **dapp** (decentralized application) is an app whose backend runs on a blockchain through **smart contracts** rather than a company's servers. You typically connect your wallet to use one.\n\nDapps cover trading, lending, games, social apps, and more. Because they run on public code, they can operate without a central operator.",
    related: ["smart-contract", "defi", "wallet"],
  },
  {
    term: "Transaction",
    slug: "transaction",
    short: "A signed instruction recorded on the blockchain, like sending coins.",
    definition:
      "A **transaction** is a signed instruction broadcast to the network — most often sending coins from one address to another. Once confirmed and added to a block, it's effectively permanent.\n\nEach transaction pays a fee (**gas**) and, importantly, **cannot be reversed**. Double-check the address and amount before you send.",
    related: ["gas", "blockchain", "wallet"],
  },
  {
    term: "Tokenomics",
    slug: "tokenomics",
    short: "The economic design of a token: supply, distribution, and incentives.",
    definition:
      "**Tokenomics** describes how a token's economy is designed: how many exist, how new ones are created or burned, who holds them, and what they're used for.\n\nStrong tokenomics align incentives so the project can grow sustainably. Red flags include a tiny circulating supply with huge future unlocks, or a handful of insiders holding most of the supply.",
    related: ["circulating-supply", "token", "market-cap"],
  },
];

export function getTerm(slug: string): GlossaryTerm | undefined {
  return GLOSSARY.find((t) => t.slug === slug);
}

/** Terms sorted alphabetically by display name. */
export function sortedTerms(): GlossaryTerm[] {
  return [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
}
