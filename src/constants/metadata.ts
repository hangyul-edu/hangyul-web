/**
 * locale별 SEO/OG 메타데이터
 *
 * 언어를 추가할 때는 routing.locales, LOCALE_CONFIG, messages/<locale>.json과 함께
 * 이 파일에도 항목을 추가해야 합니다. 항목이 없으면 영어(en)로 대체됩니다.
 */
export type LocaleMeta = {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogLocale: string;
};

export const LOCALE_META: Record<string, LocaleMeta> = {
  en: {
    title: "Hangyul - AI Korean Learning App | Speak Korean with AI",
    description:
      "Speak Korean naturally with fun, AI-powered lessons made for real conversations.",
    keywords: [
      "AI Korean learning",
      "learn Korean",
      "speak Korean",
      "Korean language app",
      "Korean speaking practice",
      "AI pronunciation training",
      "Korean learning app",
      "Korean speaking AI",
      "Korean study online",
      "Talk Hangyul",
    ],
    ogTitle: "Hangyul - Speak Korean Naturally with AI",
    ogDescription:
      "Learn Korean with AI. Hangyul helps you practice pronunciation, learn real Korean sentences, and build speaking confidence through personalized AI feedback.",
    ogLocale: "en_US",
  },
  ko: {
    title: "한귤 | AI와 함께 자연스럽게 말하는 한국어",
    description: "AI와 함께 말하면서 배우는 쉽고 재미있는 한국어 학습 플랫폼",
    keywords: [
      "AI 한국어 학습",
      "한국어 회화 앱",
      "한국어 말하기 연습",
      "AI 발음 교정",
      "한국어 공부 앱",
      "한국어 학습 플랫폼",
      "한국어 회화 연습",
      "한국어 AI 튜터",
      "한국어 공부 온라인",
      "한귤 Hangyul",
    ],
    ogTitle: "AI와 함께 배우는 한국어 회화, 한귤",
    ogDescription:
      "AI 발음 분석과 개인 맞춤 학습으로 한국어를 자연스럽게 말해보세요. 실제 한국어 문장을 연습하며 말하기 자신감을 키울 수 있습니다.",
    ogLocale: "ko_KR",
  },
  ar: {
    title: "Hangyul | تطبيق تعلّم الكورية بالذكاء الاصطناعي",
    description:
      "تحدّث الكورية بطلاقة مع دروس ممتعة مدعومة بالذكاء الاصطناعي ومصمّمة للمحادثات الواقعية.",
    keywords: [
      "تعلم الكورية",
      "تطبيق تعلم الكورية",
      "تحدث الكورية",
      "تعلم اللغة الكورية بالذكاء الاصطناعي",
      "تدريب النطق الكوري",
      "محادثة كورية",
      "اختبار توبيك",
      "Hangyul",
    ],
    ogTitle: "Hangyul - تحدّث الكورية بثقة مع الذكاء الاصطناعي",
    ogDescription:
      "تعلّم الكورية مع الذكاء الاصطناعي. يساعدك Hangyul على تصحيح نطقك وحفظ جمل كورية حقيقية وبناء ثقتك في التحدث عبر ملاحظات مخصّصة لك.",
    ogLocale: "ar_SA",
  },
  bn: {
    title: "Hangyul | AI দিয়ে কোরিয়ান শেখার অ্যাপ",
    description:
      "বাস্তব কথোপকথনের জন্য তৈরি মজার AI পাঠের মাধ্যমে স্বাভাবিকভাবে কোরিয়ান বলুন।",
    keywords: [
      "কোরিয়ান শিখুন",
      "কোরিয়ান ভাষা অ্যাপ",
      "কোরিয়ান বলা অনুশীলন",
      "AI উচ্চারণ সংশোধন",
      "কোরিয়ান কথোপকথন",
      "টপিক প্রস্তুতি",
      "অনলাইনে কোরিয়ান",
      "Hangyul",
    ],
    ogTitle: "Hangyul - AI-এর সঙ্গে স্বাভাবিকভাবে কোরিয়ান বলুন",
    ogDescription:
      "AI দিয়ে কোরিয়ান শিখুন। Hangyul আপনার উচ্চারণ ঠিক করতে, বাস্তব কোরিয়ান বাক্য শিখতে এবং ব্যক্তিগত ফিডব্যাকের মাধ্যমে কথা বলার আত্মবিশ্বাস গড়তে সাহায্য করে।",
    ogLocale: "bn_BD",
  },
  zh: {
    title: "Hangyul | AI 韩语学习应用，开口说韩语",
    description: "用有趣的 AI 课程练习真实对话，自然而然地开口说韩语。",
    keywords: [
      "韩语学习",
      "学韩语",
      "韩语口语",
      "韩语学习软件",
      "AI 发音纠正",
      "韩语会话练习",
      "TOPIK 备考",
      "Hangyul",
    ],
    ogTitle: "Hangyul - 用 AI 自然地说出韩语",
    ogDescription:
      "和 AI 一起学韩语。Hangyul 帮你纠正发音、掌握真实场景的韩语句子，并通过个性化反馈建立开口说话的自信。",
    ogLocale: "zh_CN",
  },
  cs: {
    title: "Hangyul | Aplikace na korejštinu s AI",
    description:
      "Mluvte korejsky přirozeně díky zábavným lekcím s AI, které vycházejí ze skutečných konverzací.",
    keywords: [
      "učit se korejsky",
      "korejština aplikace",
      "mluvená korejština",
      "AI výslovnost",
      "korejská konverzace",
      "příprava na TOPIK",
      "korejština online",
      "Hangyul",
    ],
    ogTitle: "Hangyul - Mluvte korejsky přirozeně díky AI",
    ogDescription:
      "Učte se korejsky s AI. Hangyul vám pomůže opravit výslovnost, naučit se skutečné korejské věty a získat jistotu v mluvení díky personalizované zpětné vazbě.",
    ogLocale: "cs_CZ",
  },
  nl: {
    title: "Hangyul | Koreaans leren met AI",
    description:
      "Spreek moeiteloos Koreaans met leuke AI-lessen die zijn gemaakt voor echte gesprekken.",
    keywords: [
      "Koreaans leren",
      "Koreaans app",
      "Koreaans spreken",
      "AI uitspraaktraining",
      "Koreaanse conversatie",
      "TOPIK voorbereiding",
      "Koreaans online",
      "Hangyul",
    ],
    ogTitle: "Hangyul - Spreek natuurlijk Koreaans met AI",
    ogDescription:
      "Leer Koreaans met AI. Hangyul helpt je je uitspraak te verbeteren, echte Koreaanse zinnen te leren en met persoonlijke feedback zelfvertrouwen op te bouwen.",
    ogLocale: "nl_NL",
  },
  fr: {
    title: "Hangyul | Apprendre le coréen avec l’IA",
    description:
      "Parlez coréen naturellement grâce à des leçons ludiques propulsées par l’IA et pensées pour les vraies conversations.",
    keywords: [
      "apprendre le coréen",
      "application coréen",
      "parler coréen",
      "prononciation coréenne IA",
      "conversation coréenne",
      "préparation TOPIK",
      "cours de coréen en ligne",
      "Hangyul",
    ],
    ogTitle: "Hangyul - Parlez coréen naturellement avec l’IA",
    ogDescription:
      "Apprenez le coréen avec l’IA. Hangyul vous aide à corriger votre prononciation, à retenir de vraies phrases coréennes et à gagner en aisance à l’oral grâce à un retour personnalisé.",
    ogLocale: "fr_FR",
  },
  de: {
    title: "Hangyul | Koreanisch lernen mit KI",
    description:
      "Sprich Koreanisch ganz natürlich – mit unterhaltsamen KI-Lektionen für echte Gespräche.",
    keywords: [
      "Koreanisch lernen",
      "Koreanisch App",
      "Koreanisch sprechen",
      "KI Aussprachetraining",
      "koreanische Konversation",
      "TOPIK Vorbereitung",
      "Koreanisch online lernen",
      "Hangyul",
    ],
    ogTitle: "Hangyul - Mit KI natürlich Koreanisch sprechen",
    ogDescription:
      "Lerne Koreanisch mit KI. Hangyul verbessert deine Aussprache, vermittelt echte koreanische Sätze und gibt dir mit persönlichem Feedback Sicherheit beim Sprechen.",
    ogLocale: "de_DE",
  },
  el: {
    title: "Hangyul | Εκμάθηση κορεατικών με AI",
    description:
      "Μίλα κορεατικά με άνεση, μέσα από διασκεδαστικά μαθήματα AI φτιαγμένα για αληθινές συνομιλίες.",
    keywords: [
      "μάθε κορεατικά",
      "εφαρμογή κορεατικών",
      "ομιλία κορεατικών",
      "προφορά με AI",
      "κορεατική συνομιλία",
      "προετοιμασία TOPIK",
      "κορεατικά online",
      "Hangyul",
    ],
    ogTitle: "Hangyul - Μίλα κορεατικά φυσικά με τη βοήθεια της AI",
    ogDescription:
      "Μάθε κορεατικά με AI. Το Hangyul διορθώνει την προφορά σου, σου μαθαίνει αληθινές κορεατικές προτάσεις και σου δίνει αυτοπεποίθηση στην ομιλία με εξατομικευμένα σχόλια.",
    ogLocale: "el_GR",
  },
  hi: {
    title: "Hangyul | AI के साथ कोरियन सीखने वाला ऐप",
    description:
      "असली बातचीत के लिए बने मज़ेदार AI पाठों के साथ कोरियन बोलना सहज बनाइए।",
    keywords: [
      "कोरियन सीखें",
      "कोरियन भाषा ऐप",
      "कोरियन बोलना",
      "AI उच्चारण सुधार",
      "कोरियन संवाद अभ्यास",
      "TOPIK तैयारी",
      "ऑनलाइन कोरियन",
      "Hangyul",
    ],
    ogTitle: "Hangyul - AI के साथ स्वाभाविक रूप से कोरियन बोलिए",
    ogDescription:
      "AI के साथ कोरियन सीखिए। Hangyul आपके उच्चारण को सुधारता है, असली कोरियन वाक्य सिखाता है और व्यक्तिगत फीडबैक से बोलने का आत्मविश्वास देता है।",
    ogLocale: "hi_IN",
  },
  hu: {
    title: "Hangyul | Koreai nyelvtanulás MI-vel",
    description:
      "Beszélj természetesen koreaiul valódi beszélgetésekre épülő, szórakoztató MI-leckékkel.",
    keywords: [
      "koreai nyelvtanulás",
      "koreai alkalmazás",
      "koreai beszéd",
      "MI kiejtésjavítás",
      "koreai társalgás",
      "TOPIK felkészülés",
      "koreai online",
      "Hangyul",
    ],
    ogTitle: "Hangyul - Beszélj természetesen koreaiul MI-vel",
    ogDescription:
      "Tanulj koreaiul MI-vel. A Hangyul javítja a kiejtésedet, valódi koreai mondatokat tanít, és személyre szabott visszajelzéssel ad magabiztosságot a beszédhez.",
    ogLocale: "hu_HU",
  },
  id: {
    title: "Hangyul | Aplikasi Belajar Bahasa Korea dengan AI",
    description:
      "Bicara bahasa Korea dengan lancar lewat pelajaran AI yang seru dan dirancang untuk percakapan nyata.",
    keywords: [
      "belajar bahasa Korea",
      "aplikasi bahasa Korea",
      "berbicara bahasa Korea",
      "latihan pelafalan AI",
      "percakapan bahasa Korea",
      "persiapan TOPIK",
      "kursus Korea online",
      "Hangyul",
    ],
    ogTitle: "Hangyul - Bicara Bahasa Korea Secara Alami dengan AI",
    ogDescription:
      "Belajar bahasa Korea dengan AI. Hangyul membantu memperbaiki pelafalanmu, mengajarkan kalimat Korea yang benar-benar dipakai, dan membangun rasa percaya diri lewat umpan balik personal.",
    ogLocale: "id_ID",
  },
  it: {
    title: "Hangyul | App per imparare il coreano con l'IA",
    description:
      "Parla coreano in modo naturale con lezioni divertenti basate sull'IA e pensate per le conversazioni reali.",
    keywords: [
      "imparare il coreano",
      "app coreano",
      "parlare coreano",
      "pronuncia coreana IA",
      "conversazione coreana",
      "preparazione TOPIK",
      "corso di coreano online",
      "Hangyul",
    ],
    ogTitle: "Hangyul - Parla coreano in modo naturale con l'IA",
    ogDescription:
      "Impara il coreano con l'IA. Hangyul corregge la tua pronuncia, ti insegna frasi coreane davvero usate e ti dà sicurezza nel parlare con feedback personalizzati.",
    ogLocale: "it_IT",
  },
  ja: {
    title: "Hangyul | AIで話せる韓国語学習アプリ",
    description:
      "リアルな会話のために作られた楽しいAIレッスンで、韓国語が自然に口から出てくる。",
    keywords: [
      "韓国語 学習",
      "韓国語 アプリ",
      "韓国語 会話",
      "AI 発音矯正",
      "韓国語 スピーキング",
      "TOPIK 対策",
      "韓国語 オンライン",
      "Hangyul",
    ],
    ogTitle: "Hangyul - AIと学ぶ、話せる韓国語",
    ogDescription:
      "AIと一緒に韓国語を学びましょう。Hangyulは発音を細かく分析し、実際に使える韓国語の文を身につけながら、パーソナライズされたフィードバックで話す自信を育てます。",
    ogLocale: "ja_JP",
  },
  pl: {
    title: "Hangyul | Nauka koreańskiego z AI",
    description:
      "Mów po koreańsku swobodnie dzięki wciągającym lekcjom z AI, tworzonym z myślą o prawdziwych rozmowach.",
    keywords: [
      "nauka koreańskiego",
      "aplikacja koreański",
      "mówienie po koreańsku",
      "AI korekta wymowy",
      "konwersacje po koreańsku",
      "przygotowanie do TOPIK",
      "koreański online",
      "Hangyul",
    ],
    ogTitle: "Hangyul - Mów po koreańsku naturalnie dzięki AI",
    ogDescription:
      "Ucz się koreańskiego z AI. Hangyul poprawia Twoją wymowę, uczy zdań używanych na co dzień i buduje pewność w mówieniu dzięki spersonalizowanym wskazówkom.",
    ogLocale: "pl_PL",
  },
  pt: {
    title: "Hangyul | App para aprender coreano com IA",
    description:
      "Fale coreano com naturalidade através de lições divertidas com IA, pensadas para conversas reais.",
    keywords: [
      "aprender coreano",
      "aplicação de coreano",
      "falar coreano",
      "correção de pronúncia com IA",
      "conversação em coreano",
      "preparação para o TOPIK",
      "coreano online",
      "Hangyul",
    ],
    ogTitle: "Hangyul - Fale coreano com naturalidade graças à IA",
    ogDescription:
      "Aprenda coreano com IA. O Hangyul corrige a sua pronúncia, ensina frases coreanas reais e dá-lhe confiança para falar através de feedback personalizado.",
    ogLocale: "pt_PT",
  },
  ro: {
    title: "Hangyul | Învață coreeană cu AI",
    description:
      "Vorbește coreeană firesc, cu lecții antrenante bazate pe AI, create pentru conversații reale.",
    keywords: [
      "învață coreeană",
      "aplicație coreeană",
      "vorbește coreeană",
      "corectare pronunție AI",
      "conversație în coreeană",
      "pregătire TOPIK",
      "coreeană online",
      "Hangyul",
    ],
    ogTitle: "Hangyul - Vorbește coreeană firesc, cu ajutorul AI",
    ogDescription:
      "Învață coreeană cu AI. Hangyul îți corectează pronunția, te învață propoziții coreene folosite în realitate și îți dă încredere să vorbești prin feedback personalizat.",
    ogLocale: "ro_RO",
  },
  ru: {
    title: "Hangyul | Приложение для изучения корейского с ИИ",
    description:
      "Говорите по-корейски свободно: интересные уроки с ИИ, созданные для живого общения.",
    keywords: [
      "изучение корейского",
      "приложение корейский язык",
      "говорить по-корейски",
      "постановка произношения ИИ",
      "корейская разговорная практика",
      "подготовка к TOPIK",
      "корейский онлайн",
      "Hangyul",
    ],
    ogTitle: "Hangyul - говорите по-корейски естественно вместе с ИИ",
    ogDescription:
      "Учите корейский с ИИ. Hangyul разбирает ваше произношение, учит живым корейским фразам и помогает уверенно говорить благодаря персональной обратной связи.",
    ogLocale: "ru_RU",
  },
  es: {
    title: "Hangyul | App para aprender coreano con IA",
    description:
      "Habla coreano con naturalidad gracias a lecciones divertidas con IA pensadas para conversaciones reales.",
    keywords: [
      "aprender coreano",
      "app de coreano",
      "hablar coreano",
      "corrección de pronunciación con IA",
      "conversación en coreano",
      "preparación TOPIK",
      "coreano online",
      "Hangyul",
    ],
    ogTitle: "Hangyul - Habla coreano con naturalidad gracias a la IA",
    ogDescription:
      "Aprende coreano con IA. Hangyul corrige tu pronunciación, te enseña frases coreanas reales y te da confianza para hablar con comentarios personalizados.",
    ogLocale: "es_ES",
  },
  sv: {
    title: "Hangyul | Lär dig koreanska med AI",
    description:
      "Prata koreanska naturligt med roliga AI-lektioner som är gjorda för verkliga samtal.",
    keywords: [
      "lära sig koreanska",
      "koreanska app",
      "prata koreanska",
      "AI uttalsträning",
      "koreansk konversation",
      "TOPIK-förberedelse",
      "koreanska online",
      "Hangyul",
    ],
    ogTitle: "Hangyul - Prata koreanska naturligt med AI",
    ogDescription:
      "Lär dig koreanska med AI. Hangyul finslipar ditt uttal, lär dig meningar som används på riktigt och ger dig självförtroende att prata tack vare personlig feedback.",
    ogLocale: "sv_SE",
  },
  fil: {
    title: "Hangyul | App sa pag-aaral ng Korean gamit ang AI",
    description:
      "Magsalita ng Korean nang natural sa masayang AI lessons na gawa para sa totoong usapan.",
    keywords: [
      "matuto ng Korean",
      "Korean app",
      "magsalita ng Korean",
      "AI pagsasanay sa pagbigkas",
      "Korean conversation",
      "paghahanda sa TOPIK",
      "Korean online",
      "Hangyul",
    ],
    ogTitle: "Hangyul - Magsalita ng Korean nang natural gamit ang AI",
    ogDescription:
      "Mag-aral ng Korean gamit ang AI. Tinutulungan ka ng Hangyul na itama ang pagbigkas, matutunan ang totoong mga pangungusap na Korean, at magkaroon ng kumpiyansang magsalita sa tulong ng personalized na feedback.",
    ogLocale: "fil_PH",
  },
  ta: {
    title: "Hangyul | AI உடன் கொரிய மொழி கற்கும் ஆப்",
    description:
      "உண்மையான உரையாடல்களுக்காக உருவாக்கப்பட்ட சுவாரஸ்யமான AI பாடங்களுடன் இயல்பாக கொரிய மொழி பேசுங்கள்.",
    keywords: [
      "கொரிய மொழி கற்க",
      "கொரிய மொழி ஆப்",
      "கொரிய மொழி பேச",
      "AI உச்சரிப்பு பயிற்சி",
      "கொரிய உரையாடல்",
      "TOPIK தயாரிப்பு",
      "ஆன்லைன் கொரிய வகுப்பு",
      "Hangyul",
    ],
    ogTitle: "Hangyul - AI உடன் இயல்பாக கொரிய மொழி பேசுங்கள்",
    ogDescription:
      "AI உடன் கொரிய மொழியைக் கற்றுக்கொள்ளுங்கள். உங்கள் உச்சரிப்பைத் திருத்தி, நடைமுறையில் பயன்படும் கொரிய வாக்கியங்களைக் கற்பித்து, தனிப்பயன் கருத்துகளுடன் பேசும் தன்னம்பிக்கையை Hangyul வளர்க்கிறது.",
    ogLocale: "ta_IN",
  },
  te: {
    title: "Hangyul | AIతో కొరియన్ నేర్చుకునే యాప్",
    description:
      "నిజమైన సంభాషణల కోసం రూపొందించిన ఆసక్తికరమైన AI పాఠాలతో సహజంగా కొరియన్ మాట్లాడండి.",
    keywords: [
      "కొరియన్ నేర్చుకోండి",
      "కొరియన్ యాప్",
      "కొరియన్ మాట్లాడటం",
      "AI ఉచ్చారణ శిక్షణ",
      "కొరియన్ సంభాషణ",
      "TOPIK సన్నద్ధత",
      "ఆన్‌లైన్ కొరియన్",
      "Hangyul",
    ],
    ogTitle: "Hangyul - AIతో సహజంగా కొరియన్ మాట్లాడండి",
    ogDescription:
      "AIతో కొరియన్ నేర్చుకోండి. మీ ఉచ్చారణను సరిచేస్తూ, నిజంగా వాడే కొరియన్ వాక్యాలను నేర్పిస్తూ, వ్యక్తిగత సూచనలతో మాట్లాడే ఆత్మవిశ్వాసాన్ని Hangyul పెంచుతుంది.",
    ogLocale: "te_IN",
  },
  th: {
    title: "Hangyul | แอปเรียนภาษาเกาหลีด้วย AI",
    description:
      "พูดภาษาเกาหลีได้อย่างเป็นธรรมชาติ ด้วยบทเรียน AI สนุก ๆ ที่ออกแบบมาเพื่อบทสนทนาจริง",
    keywords: [
      "เรียนภาษาเกาหลี",
      "แอปภาษาเกาหลี",
      "พูดภาษาเกาหลี",
      "ฝึกออกเสียงด้วย AI",
      "สนทนาภาษาเกาหลี",
      "เตรียมสอบ TOPIK",
      "เรียนเกาหลีออนไลน์",
      "Hangyul",
    ],
    ogTitle: "Hangyul - พูดเกาหลีอย่างเป็นธรรมชาติไปกับ AI",
    ogDescription:
      "เรียนภาษาเกาหลีกับ AI ไปกับ Hangyul ที่ช่วยแก้การออกเสียง สอนประโยคเกาหลีที่ใช้จริง และสร้างความมั่นใจในการพูดด้วยฟีดแบ็กเฉพาะบุคคล",
    ogLocale: "th_TH",
  },
  tr: {
    title: "Hangyul | Yapay zekâ ile Korece öğrenme uygulaması",
    description:
      "Gerçek diyaloglar için hazırlanmış keyifli yapay zekâ dersleriyle Koreceyi akıcı biçimde konuşun.",
    keywords: [
      "Korece öğren",
      "Korece uygulaması",
      "Korece konuşma",
      "yapay zekâ telaffuz eğitimi",
      "Korece diyalog pratiği",
      "TOPIK hazırlık",
      "online Korece",
      "Hangyul",
    ],
    ogTitle: "Hangyul - Yapay zekâ ile doğal bir Korece konuşun",
    ogDescription:
      "Yapay zekâ ile Korece öğrenin. Hangyul telaffuzunuzu düzeltir, günlük hayatta kullanılan Korece cümleleri öğretir ve kişisel geri bildirimlerle konuşma özgüveninizi güçlendirir.",
    ogLocale: "tr_TR",
  },
  uk: {
    title: "Hangyul | Застосунок для вивчення корейської з ШІ",
    description:
      "Говоріть корейською вільно завдяки цікавим урокам зі ШІ, створеним для справжніх розмов.",
    keywords: [
      "вивчення корейської",
      "застосунок корейська мова",
      "говорити корейською",
      "постановка вимови ШІ",
      "корейська розмовна практика",
      "підготовка до TOPIK",
      "корейська онлайн",
      "Hangyul",
    ],
    ogTitle: "Hangyul - говоріть корейською природно разом зі ШІ",
    ogDescription:
      "Вивчайте корейську зі ШІ. Hangyul аналізує вашу вимову, навчає живих корейських фраз і додає впевненості в розмові завдяки персональному зворотному зв’язку.",
    ogLocale: "uk_UA",
  },
  vi: {
    title: "Hangyul | Ứng dụng học tiếng Hàn cùng AI",
    description:
      "Nói tiếng Hàn thật tự nhiên với những bài học AI thú vị, được xây dựng cho hội thoại đời thực.",
    keywords: [
      "học tiếng Hàn",
      "ứng dụng tiếng Hàn",
      "nói tiếng Hàn",
      "luyện phát âm bằng AI",
      "giao tiếp tiếng Hàn",
      "luyện thi TOPIK",
      "học tiếng Hàn online",
      "Hangyul",
    ],
    ogTitle: "Hangyul - Nói tiếng Hàn tự nhiên cùng AI",
    ogDescription:
      "Học tiếng Hàn cùng AI. Hangyul sửa phát âm cho bạn, dạy những câu tiếng Hàn dùng thật trong đời sống và giúp bạn tự tin nói nhờ nhận xét cá nhân hóa.",
    ogLocale: "vi_VN",
  },
  uz: {
    title: "Hangyul | Sunʼiy intellekt bilan koreys tilini oʻrganish ilovasi",
    description:
      "Haqiqiy suhbatlar uchun tayyorlangan qiziqarli AI darslari bilan koreys tilida erkin gapiring.",
    keywords: [
      "koreys tilini oʻrganish",
      "koreys tili ilovasi",
      "koreyscha gapirish",
      "AI talaffuz mashqi",
      "koreys tilida suhbat",
      "TOPIK tayyorgarlik",
      "onlayn koreys tili",
      "Hangyul",
    ],
    ogTitle: "Hangyul - AI bilan koreys tilida tabiiy gapiring",
    ogDescription:
      "AI bilan koreys tilini oʻrganing. Hangyul talaffuzingizni toʻgʻrilaydi, hayotda ishlatiladigan koreyscha jumlalarni oʻrgatadi va shaxsiy tavsiyalar orqali gapirishga ishonch beradi.",
    ogLocale: "uz_UZ",
  },
  kk: {
    title: "Hangyul | ЖИ көмегімен корей тілін үйрену қолданбасы",
    description:
      "Нақты сөйлесуге арналған қызықты ЖИ сабақтарымен корейше еркін сөйлеңіз.",
    keywords: [
      "корей тілін үйрену",
      "корей тілі қолданбасы",
      "корейше сөйлеу",
      "ЖИ айтылым жаттығуы",
      "корей тілінде сөйлесу",
      "TOPIK дайындық",
      "онлайн корей тілі",
      "Hangyul",
    ],
    ogTitle: "Hangyul - ЖИ көмегімен корейше еркін сөйлеңіз",
    ogDescription:
      "ЖИ-мен корей тілін үйреніңіз. Hangyul айтылымыңызды түзетеді, өмірде қолданылатын корей сөйлемдерін үйретеді және жеке кері байланыс арқылы сөйлеуге сенімділік береді.",
    ogLocale: "kk_KZ",
  },
  ky: {
    title: "Hangyul | ЖИ менен корей тилин үйрөнүү колдонмосу",
    description:
      "Чыныгы маектешүү үчүн даярдалган кызыктуу ЖИ сабактары менен корейче эркин сүйлөңүз.",
    keywords: [
      "корей тилин үйрөнүү",
      "корей тили колдонмосу",
      "корейче сүйлөө",
      "ЖИ айтылыш көнүгүүсү",
      "корей тилинде маектешүү",
      "TOPIK даярдык",
      "онлайн корей тили",
      "Hangyul",
    ],
    ogTitle: "Hangyul - ЖИ менен корейче табигый сүйлөңүз",
    ogDescription:
      "ЖИ менен корей тилин үйрөнүңүз. Hangyul айтылышыңызды оңдойт, турмушта колдонулган корей сүйлөмдөрүн үйрөтөт жана жеке кеңештер аркылуу сүйлөөгө ишеним берет.",
    ogLocale: "ky_KG",
  },
  mn: {
    title: "Hangyul | Хиймэл оюунтай солонгос хэлний апп",
    description:
      "Бодит харилцан яриаг бодож бүтээсэн сонирхолтой AI хичээлүүдээр солонгосоор чөлөөтэй яриарай.",
    keywords: [
      "солонгос хэл сурах",
      "солонгос хэлний апп",
      "солонгосоор ярих",
      "AI дуудлага засах",
      "солонгос харилцан яриа",
      "TOPIK бэлтгэл",
      "онлайн солонгос хэл",
      "Hangyul",
    ],
    ogTitle: "Hangyul - AI-тай хамт солонгосоор чөлөөтэй ярих",
    ogDescription:
      "AI-тай хамт солонгос хэл сураарай. Hangyul таны дуудлагыг засаж, амьдралд хэрэглэгддэг солонгос өгүүлбэрүүдийг заан, хувийн зөвлөмжөөр ярих итгэлийг тань нэмэгдүүлнэ.",
    ogLocale: "mn_MN",
  },
};
