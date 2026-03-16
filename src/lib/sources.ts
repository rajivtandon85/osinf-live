import { Category, CategoryId, FeedSource } from "@/types/feed";

export const CATEGORIES: Record<CategoryId, Category> = {
  geopolitical: {
    id: "geopolitical",
    label: "News",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    icon: "🌍",
  },
  cyber: {
    id: "cyber",
    label: "Cyber",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    icon: "🛡",
  },
  maritime: {
    id: "maritime",
    label: "Maritime",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    icon: "⚓",
  },
  aviation: {
    id: "aviation",
    label: "Aviation",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    icon: "✈",
  },
  environmental: {
    id: "environmental",
    label: "Environmental",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    icon: "🌿",
  },
  "dark-web": {
    id: "dark-web",
    label: "Dark Web",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    icon: "🕵",
  },
};

export const FEED_SOURCES: FeedSource[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // WEST — News
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "reuters-world",
    name: "Reuters",
    url: "https://news.google.com/rss/search?q=source:reuters+when:1d&hl=en-US&gl=US&ceid=US:en",
    category: "geopolitical",
    alignment: "west",
    country: "UK",
    description: "Western wire service (via Google News)",
  },
  {
    id: "bbc-world",
    name: "BBC World",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    category: "geopolitical",
    alignment: "west",
    country: "UK",
    description: "UK state broadcaster",
  },
  {
    id: "ap-world",
    name: "AP News",
    url: "https://news.google.com/rss/search?q=source:apnews+when:1d&hl=en-US&gl=US&ceid=US:en",
    category: "geopolitical",
    alignment: "west",
    country: "US",
    description: "US wire service (via Google News)",
  },
  {
    id: "rferl",
    name: "Radio Free Europe",
    url: "https://pressroom.rferl.org/rss",
    category: "geopolitical",
    alignment: "west",
    country: "US",
    description: "US government funded",
  },
  {
    id: "cnn-world",
    name: "CNN",
    url: "http://rss.cnn.com/rss/edition_world.rss",
    category: "geopolitical",
    alignment: "west",
    country: "US",
    description: "US mainstream",
  },
  {
    id: "guardian-world",
    name: "The Guardian",
    url: "https://www.theguardian.com/world/rss",
    category: "geopolitical",
    alignment: "west",
    country: "UK",
    description: "UK liberal broadsheet",
  },
  {
    id: "france24",
    name: "France24",
    url: "https://www.france24.com/en/rss",
    category: "geopolitical",
    alignment: "west",
    country: "France",
    description: "French state international broadcaster",
  },
  {
    id: "dw",
    name: "Deutsche Welle",
    url: "https://rss.dw.com/rdf/rss-en-all",
    category: "geopolitical",
    alignment: "west",
    country: "Germany",
    description: "German state international broadcaster",
  },
  {
    id: "the-hindu",
    name: "The Hindu",
    url: "https://www.thehindu.com/feeder/default.rss",
    category: "geopolitical",
    alignment: "west",
    country: "India",
    description: "Anglophile editorial, tracks BBC/Guardian line",
  },
  {
    id: "ndtv",
    name: "NDTV",
    url: "https://feeds.feedburner.com/ndtvnews-top-stories",
    category: "geopolitical",
    alignment: "west",
    country: "India",
    description: "Western-leaning editorial",
  },
  {
    id: "scroll-in",
    name: "Scroll.in",
    url: "http://feeds.feedburner.com/ScrollinArticles.rss",
    category: "geopolitical",
    alignment: "west",
    country: "India",
    description: "Liberal, Western-aligned framing",
  },
  {
    id: "japan-times",
    name: "Japan Times",
    url: "https://www.japantimes.co.jp/feed/topstories/",
    category: "geopolitical",
    alignment: "west",
    country: "Japan",
    description: "English-language, US/Japan alliance aligned",
  },
  {
    id: "kyodo",
    name: "Kyodo News",
    url: "https://news.google.com/rss/search?q=site:english.kyodonews.net+when:1d&hl=en-US&gl=US&ceid=US:en",
    category: "geopolitical",
    alignment: "west",
    country: "Japan",
    description: "Japanese wire, generally US-aligned (via Google News)",
  },
  {
    id: "daily-star-bd",
    name: "The Daily Star",
    url: "https://www.thedailystar.net/frontpage/rss.xml",
    category: "geopolitical",
    alignment: "west",
    country: "Bangladesh",
    description: "English-language, Western-aligned editorial",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NEUTRAL — News: Middle East / West Asia
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "aljazeera",
    name: "Al Jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    category: "geopolitical",
    alignment: "neutral",
    country: "Qatar",
    description: "Independent of Western narrative, strong on Palestine",
  },
  {
    id: "middle-east-eye",
    name: "Middle East Eye",
    url: "https://www.middleeasteye.net/rss",
    category: "geopolitical",
    alignment: "neutral",
    country: "UK (Arab editorial)",
    description: "Pro-Palestinian, critical of Western policy",
  },
  {
    id: "press-tv",
    name: "Press TV",
    url: "https://www.presstv.ir/RSS",
    category: "geopolitical",
    alignment: "neutral",
    country: "Iran",
    description: "Iranian state perspective",
  },
  {
    id: "trt-world",
    name: "TRT World",
    url: "https://www.trtworld.com/rss",
    category: "geopolitical",
    alignment: "neutral",
    country: "Turkey",
    description: "Turkish state perspective",
  },
  // Mehr, Tasnim, ISNA removed — Farsi language feeds

  // ═══════════════════════════════════════════════════════════════════════════
  // NEUTRAL — News: South Asia
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "dawn",
    name: "Dawn",
    url: "https://www.dawn.com/feeds/home",
    category: "geopolitical",
    alignment: "neutral",
    country: "Pakistan",
    description: "Independent, critical of both US and Pakistan military",
  },
  {
    id: "express-tribune",
    name: "Express Tribune",
    url: "https://tribune.com.pk/feed/home",
    category: "geopolitical",
    alignment: "neutral",
    country: "Pakistan",
    description: "Centrist Pakistani",
  },
  {
    id: "the-news-intl",
    name: "The News International",
    url: "https://www.thenews.com.pk/rss/1/1",
    category: "geopolitical",
    alignment: "neutral",
    country: "Pakistan",
    description: "Jang Group, mainstream Pakistani",
  },
  {
    id: "swarajya",
    name: "Swarajya",
    url: "https://prod-qt-images.s3.amazonaws.com/production/swarajya/feed.xml",
    category: "geopolitical",
    alignment: "neutral",
    country: "India",
    description: "Nationalist, non-Western-aligned",
  },
  {
    id: "opindia",
    name: "OpIndia",
    url: "https://feeds.feedburner.com/opindia",
    category: "geopolitical",
    alignment: "neutral",
    country: "India",
    description: "Right-wing, rejects Western liberal framing",
  },
  {
    id: "theprint",
    name: "ThePrint",
    url: "https://theprint.in/feed/",
    category: "geopolitical",
    alignment: "neutral",
    country: "India",
    description: "Independent, data-driven, less Western-deferential",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NEUTRAL — News: East Asia / Pacific
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "scmp",
    name: "South China Morning Post",
    url: "https://www.scmp.com/rss/91/feed",
    category: "geopolitical",
    alignment: "neutral",
    country: "Hong Kong",
    description: "Asia-Pacific view, independent of Western framing",
  },
  {
    id: "global-times",
    name: "Global Times",
    url: "https://www.globaltimes.cn/rss/outbrain.xml",
    category: "geopolitical",
    alignment: "neutral",
    country: "China",
    description: "Chinese state perspective, English",
  },
  {
    id: "channel-news-asia",
    name: "Channel News Asia",
    url: "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml",
    category: "geopolitical",
    alignment: "neutral",
    country: "Singapore",
    description: "Southeast Asian perspective",
  },
  {
    id: "inquirer",
    name: "Inquirer",
    url: "https://www.inquirer.net/fullfeed",
    category: "geopolitical",
    alignment: "neutral",
    country: "Philippines",
    description: "Filipino perspective",
  },
  // Tribunnews removed — Indonesian language

  // ═══════════════════════════════════════════════════════════════════════════
  // NEUTRAL — News: Russia / Eurasia
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tass",
    name: "TASS",
    url: "http://tass.com/rss/v2.xml",
    category: "geopolitical",
    alignment: "neutral",
    country: "Russia",
    description: "Official Russian state wire",
  },
  {
    id: "rt",
    name: "RT",
    url: "https://www.rt.com/rss/",
    category: "geopolitical",
    alignment: "neutral",
    country: "Russia",
    description: "Counter-Western narrative",
  },
  {
    id: "meduza",
    name: "Meduza",
    url: "https://meduza.io/rss/all",
    category: "geopolitical",
    alignment: "neutral",
    country: "Russia (independent)",
    description: "Independent Russian journalism, Latvia-based",
  },
  {
    id: "unian",
    name: "UNIAN",
    url: "https://rss.unian.net/site/news_eng.rss",
    category: "geopolitical",
    alignment: "neutral",
    country: "Ukraine",
    description: "Ukrainian news agency",
  },
  // Ukrainska Pravda removed — Ukrainian language

  // ═══════════════════════════════════════════════════════════════════════════
  // NEUTRAL — News: Africa
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "sahara-reporters",
    name: "Sahara Reporters",
    url: "http://saharareporters.com/feeds/latest/feed",
    category: "geopolitical",
    alignment: "neutral",
    country: "Nigeria",
    description: "Independent Nigerian investigative",
  },
  {
    id: "premium-times",
    name: "Premium Times",
    url: "https://www.premiumtimesng.com/feed",
    category: "geopolitical",
    alignment: "neutral",
    country: "Nigeria",
    description: "Independent Nigerian",
  },
  {
    id: "daily-maverick",
    name: "Daily Maverick",
    url: "https://www.dailymaverick.co.za/dmrss/",
    category: "geopolitical",
    alignment: "neutral",
    country: "South Africa",
    description: "Independent SA investigative",
  },
  {
    id: "news24-sa",
    name: "News24",
    url: "http://feeds.news24.com/articles/news24/TopStories/rss",
    category: "geopolitical",
    alignment: "neutral",
    country: "South Africa",
    description: "Mainstream South African",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NEUTRAL — News: Latin America
  // ═══════════════════════════════════════════════════════════════════════════
  // Folha, Excélsior removed — Portuguese/Spanish language
  {
    id: "brasil-wire",
    name: "Brasil Wire",
    url: "http://www.brasilwire.com/feed/",
    category: "geopolitical",
    alignment: "neutral",
    country: "Brazil",
    description: "English-language, anti-Western-interventionist",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NEUTRAL — News: Independent / Analytical
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "the-cradle",
    name: "The Cradle",
    url: "https://new.thecradle.co/rss",
    category: "geopolitical",
    alignment: "neutral",
    description: "Beirut — West Asia analysis, anti-imperialist",
  },
  {
    id: "consortium-news",
    name: "Consortium News",
    url: "https://consortiumnews.com/feed/",
    category: "geopolitical",
    alignment: "neutral",
    country: "US",
    description: "Anti-war, challenges Western intel narratives",
  },
  {
    id: "the-grayzone",
    name: "The Grayzone",
    url: "https://thegrayzone.com/feed/",
    category: "geopolitical",
    alignment: "neutral",
    country: "US",
    description: "Investigative, anti-interventionist",
  },
  {
    id: "responsible-statecraft",
    name: "Responsible Statecraft",
    url: "https://responsiblestatecraft.org/feed/",
    category: "geopolitical",
    alignment: "neutral",
    country: "US",
    description: "Realist foreign policy, Quincy Institute",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NEUTRAL — OSINT Industry
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "osint-news",
    name: "OSINT News",
    url: "https://osint-news.com/feed/",
    category: "dark-web",
    alignment: "neutral",
    description: "OSINT industry news — tools, M&A, government use",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEST — Cyber
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "krebs",
    name: "Krebs on Security",
    url: "https://krebsonsecurity.com/feed/",
    category: "cyber",
    alignment: "west",
    country: "US",
    description: "Investigative cyber security journalism",
  },
  {
    id: "bleeping-computer",
    name: "Bleeping Computer",
    url: "https://www.bleepingcomputer.com/feed/",
    category: "cyber",
    alignment: "west",
    country: "US",
    description: "Breaking cyber security news",
  },
  {
    id: "cisa-alerts",
    name: "CISA Alerts",
    url: "https://www.cisa.gov/cybersecurity-advisories/all.xml",
    category: "cyber",
    alignment: "west",
    country: "US",
    description: "US government cybersecurity agency",
  },
  {
    id: "schneier",
    name: "Schneier on Security",
    url: "https://www.schneier.com/feed/atom",
    category: "cyber",
    alignment: "west",
    country: "US",
    description: "Security expert commentary",
  },
  {
    id: "the-hacker-news",
    name: "The Hacker News",
    url: "https://feeds.feedburner.com/TheHackersNews",
    category: "cyber",
    alignment: "west",
    country: "US",
    description: "Cybersecurity news & analysis",
  },
  {
    id: "dark-reading",
    name: "Dark Reading",
    url: "https://www.darkreading.com/rss.xml",
    category: "cyber",
    alignment: "west",
    country: "US",
    description: "Enterprise security news",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEST — Maritime
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "gcaptain",
    name: "gCaptain",
    url: "https://gcaptain.com/feed/",
    category: "maritime",
    alignment: "west",
    country: "US",
    description: "Maritime & offshore industry news",
  },
  {
    id: "maritime-executive",
    name: "The Maritime Executive",
    url: "https://maritime-executive.com/rss",
    category: "maritime",
    alignment: "west",
    country: "US",
    description: "Global maritime industry news",
  },
  {
    id: "lloyds-list",
    name: "Lloyd's List",
    url: "https://lloydslist.com/rss",
    category: "maritime",
    alignment: "west",
    country: "UK",
    description: "Shipping & trade intelligence",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEST — Aviation
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "aviation-herald",
    name: "The Aviation Herald",
    url: "https://avherald.com/h?subscribe=rss",
    category: "aviation",
    alignment: "west",
    country: "Austria",
    description: "Aviation incidents & accidents",
  },
  {
    id: "aviation-week",
    name: "Aviation Week",
    url: "https://aviationweek.com/rss.xml",
    category: "aviation",
    alignment: "west",
    country: "US",
    description: "Aviation industry news",
  },
  {
    id: "simple-flying",
    name: "Simple Flying",
    url: "https://simpleflying.com/feed/",
    category: "aviation",
    alignment: "west",
    country: "UK",
    description: "Commercial aviation news",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEST — Environmental
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "reliefweb",
    name: "ReliefWeb",
    url: "https://reliefweb.int/updates/rss.xml",
    category: "environmental",
    alignment: "west",
    description: "Humanitarian crises & disasters (UN, Western-influenced)",
  },
  {
    id: "nasa-eonet",
    name: "NASA Earth Events",
    url: "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=30&format=rss",
    category: "environmental",
    alignment: "west",
    country: "US",
    description: "Natural events tracked by NASA",
  },
  {
    id: "volcano-discovery",
    name: "Volcano Discovery",
    url: "https://www.volcanodiscovery.com/news.rss",
    category: "environmental",
    alignment: "west",
    country: "Germany",
    description: "Volcanic & seismic activity",
  },
  {
    id: "emsc",
    name: "EMSC Earthquakes",
    url: "https://www.emsc-csem.org/service/rss/rss.php?typ=emsc",
    category: "environmental",
    alignment: "west",
    country: "France",
    description: "European earthquake monitoring",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEST — Dark Web / Threat Intel
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "recorded-future",
    name: "Recorded Future Blog",
    url: "https://www.recordedfuture.com/feed",
    category: "dark-web",
    alignment: "west",
    country: "US",
    description: "Threat intelligence research",
  },
  {
    id: "intel471",
    name: "Intel471 Blog",
    url: "https://intel471.com/blog/rss.xml",
    category: "dark-web",
    alignment: "west",
    country: "US",
    description: "Cybercrime intelligence research",
  },
];

/** Get sources visible for a given alignment tab */
export function getSourcesForAlignment(alignment: "west" | "neutral"): FeedSource[] {
  return FEED_SOURCES.filter((s) => s.alignment === alignment);
}
