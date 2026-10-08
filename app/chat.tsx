import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  Pressable,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ChevronLeft, Trash2, Send, Mic, X, Volume2 } from 'lucide-react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  SharedValue,
} from 'react-native-reanimated';
import { useVideoPlayer, VideoView } from 'expo-video';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Message } from '@/utils/sessions';

const COLORS = {
  background: '#0A0A0F',
  card: '#13131A',
  border: '#2A2A3A',
  gold: '#C9A84C',
  textPrimary: '#F5F0E8',
  textSecondary: '#8A8A9A',
  bethBubble: '#1A1A28',
  userBubble: '#C9A84C',
};

const BETH_AVATAR = require('../assets/images/da99e73f-6f06-45b7-b465-fbc00b7f1169.jpeg');

const PRERECORDED_VIDEOS: Record<string, string> = {
  chasing: 'https://ziujnqcpjbflceercdij.supabase.co/storage/v1/object/public/beth-videos/chasing.mp4',
  first_date: 'https://ziujnqcpjbflceercdij.supabase.co/storage/v1/object/public/beth-videos/first_date.mp4',
  miss_him: 'https://ziujnqcpjbflceercdij.supabase.co/storage/v1/object/public/beth-videos/miss_him.mp4',
  money: 'https://ziujnqcpjbflceercdij.supabase.co/storage/v1/object/public/beth-videos/money.mp4',
  name: 'https://ziujnqcpjbflceercdij.supabase.co/storage/v1/object/public/beth-videos/name.mp4',
  promotion: 'https://ziujnqcpjbflceercdij.supabase.co/storage/v1/object/public/beth-videos/promotion.mp4',
  say_no: 'https://ziujnqcpjbflceercdij.supabase.co/storage/v1/object/public/beth-videos/say_no.mp4',
  serious: 'https://ziujnqcpjbflceercdij.supabase.co/storage/v1/object/public/beth-videos/serious.mp4',
  split: 'https://ziujnqcpjbflceercdij.supabase.co/storage/v1/object/public/beth-videos/split.mp4',
  sports: 'https://ziujnqcpjbflceercdij.supabase.co/storage/v1/object/public/beth-videos/sports.mp4',
  water: 'https://ziujnqcpjbflceercdij.supabase.co/storage/v1/object/public/beth-videos/water.mp4',
  salary: 'https://ziujnqcpjbflceercdij.supabase.co/storage/v1/object/public/beth-videos/salary.mp4',
  debt: 'https://ziujnqcpjbflceercdij.supabase.co/storage/v1/object/public/beth-videos/debt.mp4',
  focus: 'https://ziujnqcpjbflceercdij.supabase.co/storage/v1/object/public/beth-videos/focus.mp4',
  first_move: 'https://ziujnqcpjbflceercdij.supabase.co/storage/v1/object/public/beth-videos/first_move.mp4',
  indirect_communication: 'https://ziujnqcpjbflceercdij.supabase.co/storage/v1/object/public/beth-videos/indirect_communication.mp4',
  romance: 'https://ziujnqcpjbflceercdij.supabase.co/storage/v1/object/public/beth-videos/romance.mp4',
  thinking_nothing: 'https://ziujnqcpjbflceercdij.supabase.co/storage/v1/object/public/beth-videos/thinking_nothing.mp4',
  men_vulnerable: 'https://ziujnqcpjbflceercdij.supabase.co/storage/v1/object/public/beth-videos/men_vulnerable.mp4',
  initiate_intimacy: 'https://ziujnqcpjbflceercdij.supabase.co/storage/v1/object/public/beth-videos/initiate_intimacy.mp4',
};

interface ScriptedAnswer {
  keywords: string[];
  question?: string;
  answer: string;
  videoKey?: string;
}

const SCRIPTED_ANSWERS: ScriptedAnswer[] = [
  {
    keywords: ["serious", "he serious", "is he serious"],
    answer: "Watch what he builds, not what he says — a serious man makes room in his calendar, his friends and his plans without being asked twice. If you have to keep explaining your own value to him, he's already given you the answer.",
    videoKey: "serious",
  },
  {
    keywords: ["women like sports", "sports", "do women"],
    answer: "Some do, some don't — same as men. But the real question isn't whether women like sports. It's whether she likes them with you. If she doesn't care about the game and still curls up beside you to watch it, that isn't her tolerating your hobby. That's her choosing your company.",
    videoKey: "sports",
  },
  {
    keywords: ["first date", "how should a first date", "date go"],
    answer: "Short, warm, and somewhere you can actually hear each other. Ninety minutes is plenty — long enough to know whether you'd see him again, short enough that nobody feels trapped. Let him plan it, and pay attention to whether he asks you anything real. Then watch how he treats the waiter. You'll learn more in an hour of watching than three hours of talking.",
    videoKey: "first_date",
  },
  {
    keywords: ["bring up money", "when do i bring up money", "money"],
    answer: "Earlier than feels romantic — somewhere around the third or fourth date, once you know you like each other but before you've merged any of your lives. Bring it up as a fact about yourself, not a test of him: what you save, what you owe, what you'd never split.",
    videoKey: "money",
  },
  {
    keywords: ["stop chasing", "chasing him", "chasing"],
    answer: "You stop by giving the ball back — one message, then silence, and the next move is his to make. Chasing isn't love with more effort; it's anxiety with a plan, and he can feel the difference.",
    videoKey: "chasing",
  },
  {
    keywords: ["change my name", "change name", "marry", "marriage name"],
    answer: "That's a question about paperwork pretending to be a question about love. Keep it, change it or take the hyphen — but decide it for your own reasons, and notice how he reacts when you say the true thing.",
    videoKey: "name",
  },
  {
    keywords: ["say no", "without a war", "no without"],
    answer: "Say it once, plainly, in your normal voice, and then stop explaining — the extra reasons are what turn a no into a negotiation. You're allowed to disappoint someone you love; that's a cost, not a crisis.",
    videoKey: "say_no",
  },
  {
    keywords: ["earns more", "earns far more", "split things", "he earns"],
    answer: "Split by proportion, not by pride — a percentage of what each of you earns keeps the shared life equal without making the lower earner a guest in it. And say out loud what you can't afford before you resent it quietly.",
    videoKey: "split",
  },
  {
    keywords: ["promotion", "take the promotion", "evenings"],
    answer: "Take it if it buys you something you actually want — money, skill, a door that opens later — and be honest about how long you'll pay that price. Nobody hands the evenings back afterwards, so put an end date on it before you say yes.",
    videoKey: "promotion",
  },
  {
    keywords: ["miss him", "still miss", "how long", "allowed to miss"],
    answer: "As long as it takes, and longer than the people around you would like, if he mattered to you. What you're not allowed to do is keep the missing private and let it quietly run your life — say it out loud to somebody who won't flinch.",
    videoKey: "miss_him",
  },
  {
    keywords: ["water", "how much water", "8 glasses", "hydration", "drinking water"],
    answer: "The traditional '8x8 rule' is a helpful baseline, but it isn't a strict scientific requirement for everyone. The National Academies of Sciences recommends about 15.5 cups (3.7 liters) of fluids per day for men and 11.5 cups (2.7 liters) for women. About 20% of your daily fluid intake comes from foods like fruits and vegetables. Adjust for exercise — add 1.5 to 2.5 cups for short workouts, more for intense endurance exercise. Hot or humid weather also increases your needs. The simplest indicators of good hydration: you rarely feel thirsty, and your urine is clear or light pale yellow.",
    videoKey: "water",
  },
  {
    keywords: ["negotiate salary", "salary negotiation", "job offer", "negotiate pay", "rescind offer"],
    answer: "Negotiating salary is a standard part of the hiring process, and reputable employers rarely rescind an offer simply because you asked — as long as you stay professional and grounded in market research. Express enthusiasm for the role first, then anchor on objective data from Glassdoor, Payscale, or industry reports rather than personal expenses. Say something like: 'Based on current market rates for this scope in my region, the average range is X to Y — is there flexibility to adjust closer to Z?' If base salary is fixed, negotiate equity, signing bonuses, remote flexibility, or extra PTO. State your request, give your rationale, and let them respond.",
    videoKey: "salary",
  },
  {
    keywords: ["pay off debt", "emergency fund", "debt or savings", "debt first", "save money"],
    answer: "Financial planners generally recommend a hybrid approach. First, build a mini emergency fund of $1,000 to $2,000 — or one month of basic living expenses — in a high-yield savings account before aggressively tackling debt. Then attack high-interest debt above 6 to 8 percent, like credit cards. Use the Avalanche Method (highest interest first, saves the most money) or the Snowball Method (smallest balance first, builds momentum). Once high-interest debt is gone, expand your emergency fund to 3 to 6 months of essential expenses. Low-interest debt like federal student loans can be paid on schedule while you invest long-term.",
    videoKey: "debt",
  },
  {
    keywords: ["time management", "burnout", "staying focused", "pomodoro", "productivity", "focus technique"],
    answer: "One of the most validated methods for sustained focus is time-blocking paired with recovery intervals. Human energy naturally cycles in 90 to 120 minute peaks of alertness followed by a trough — work deeply on a single task for 90 minutes, then take a deliberate 15 to 20 minute rest. For smaller tasks, the Pomodoro Technique works well: 25 minutes of focused work, 5-minute break, and after 4 cycles take a longer 15 to 30 minute break. Neuroscience shows that task-switching reduces productivity by up to 40 percent. Structuring work into deliberate focus blocks protects deep concentration while scheduled recovery prevents mental fatigue.",
    videoKey: "focus",
  },
  {
    keywords: ['first move', 'make the first move', 'take the lead', 'initiate', 'who should ask'],
    question: "Do men actually need to make the first move, or do women enjoy taking the lead?",
    answer: `While traditional social norms often placed the burden on men to initiate contact, the vast majority of modern women genuinely appreciate when a man or partner takes initiative, but they are equally open to making the first move themselves.\n\nWhy initiative matters: Making the first move signals confidence, clear interest, and decisiveness—traits universally found attractive regardless of gender.\n\nTaking turns: Many women enjoy taking the lead once mutual interest is established (such as planning a date or initiating physical affection).`,
    videoKey: 'first_move',
  },
  {
    keywords: ['indirect', 'so indirect', 'communication', 'something is wrong', "i'm fine", 'what is wrong', 'not talking'],
    question: "Why is communication so indirect sometimes when something is wrong?",
    answer: `When someone says "I'm fine" despite obviously feeling upset, it usually stems from one of three psychological reasons:\n\nConflict Avoidance: A desire to avoid an immediate argument or emotional escalation until they've processed their thoughts.\n\nDesire for Unprompted Empathy: A hope that their partner will notice their emotional shift organically, signaling attentiveness and care.\n\nSafety and Comfort: Feeling uncertain about how the other person will react to vulnerable or critical feedback.\n\nPro-Tip for Men: Instead of asking "What's wrong?", try phrasing it as "I notice you seem a bit quiet/stressed today. I'm here whenever you're ready to talk about it."`,
    videoKey: 'indirect_communication',
  },
  {
    keywords: ['romance', 'romantic', 'day to day', 'daily romance', 'what is romance'],
    question: "What does 'romance' actually mean in day-to-day life?",
    answer: `Grand gestures (like expensive dinners or surprise trips) are memorable, but relationship research shows that daily consistency matters far more than occasional extravagance.\n\nMicro-attunement: Noticing small details (e.g., bringing her favorite coffee, remembering an important meeting she mentioned days ago).\n\nActs of Service: Relieving mental load—taking care of a chore without being asked.\n\nUnsolicited Compliments: Expressing genuine appreciation for who she is, not just how she looks.`,
    videoKey: 'romance',
  },
  {
    keywords: ['thinking about nothing', 'thinking about', 'nothing on his mind', 'what are you thinking', 'thinking nothing', 'blank mind'],
    question: "What does it mean when a guy says he's thinking about 'nothing'?",
    answer: `Women often find this answer hard to believe, but psychologically, men are often being completely literal.\n\nThe Cognitive Rest State: Neurologically, men's brains often enter a default mode network where they engage in low-level, non-sequential daydreaming (e.g., replaying a sports play, thinking about a random movie quote, or literally zoning out).\n\nNo Hidden Meaning: It rarely means he is hiding a thought, withholding emotion, or upset; it simply means his brain is resting.`,
    videoKey: 'thinking_nothing',
  },
  {
    keywords: ['men vulnerable', 'men overwhelmed', 'men express feelings', 'men emotions', 'men stress', 'how men cope'],
    question: "How do men express vulnerability when they are feeling overwhelmed?",
    answer: `Due to societal conditioning, men often manifest vulnerability, stress, or sadness differently than women do.\n\nAction over Words: Instead of talking through an emotion immediately, men frequently process stress by retreating into an activity (working out, gaming, fixing something, or spending time alone).\n\nPhysical Presence: Men often feel safer opening up while doing an activity side-by-side (like driving, walking, or cooking) rather than sitting face-to-face in an intense conversation.`,
    videoKey: 'men_vulnerable',
  },
  {
    keywords: ['initiating intimacy', 'initiate affection', 'men want to be pursued', 'men want affection', 'who initiates', 'initiate physical'],
    question: "Does initiating intimacy or affection matter to men as much as it does to women?",
    answer: `Yes, absolutely. Men frequently report feeling a lack of physical and emotional validation when they are expected to be the sole initiators of physical closeness.\n\nDesire to Feel Wanted: Men want to feel actively pursued and desired, not just accepted.\n\nBuilding Connection: Small, spontaneous acts—like an unexpected hug, holding his hand first, or initiating physical intimacy—go a long way in reinforcing his confidence and emotional connection to the relationship.`,
    videoKey: 'initiate_intimacy',
  },
  {
    keywords: ['favorite place', 'favorite food', 'favorite restaurant', 'where do you eat', 'do you eat', 'do you have kids', 'where do you live', 'are you married', 'do you have a family', 'how old are you', 'where are you from', 'what do you like', 'your favorite', 'favourite', 'do you like', 'have you ever', 'have you been'],
    answer: "I appreciate you asking — but I should be honest with you. I don't have a favorite restaurant, a home, or a plate of food waiting for me anywhere. I'm an AI advisor, which means I don't eat, travel, or live the way you do. What I do have is a lot of insight into the things that matter to people — relationships, money, career, life decisions. Ask me something real, and I'll give you a real answer.",
  },
];

const FALLBACK_RESPONSES = [
  "That's a significant question. Let me ask you this — what does your gut tell you when you imagine yourself six months down that path?",
  "I've seen this pattern before. The hesitation you're feeling isn't weakness — it's your instincts protecting you. What specifically feels off?",
  "Strategic clarity comes from eliminating options, not adding them. What are you willing to walk away from?",
  "The answer you're looking for isn't in the details. It's in the pattern. Tell me — has this happened before?",
  "I hear you. And I want you to know — this room is completely private. Nothing leaves here. So tell me the real version.",
  "Power moves quietly. The loudest person in the room rarely controls it. What's your read on the dynamics at play?",
];

let fallbackIndex = 0;

function getBethResponse(userMessage: string): { answer: string; videoKey: string | null } {
  const lower = userMessage.toLowerCase();
  for (const item of SCRIPTED_ANSWERS) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return { answer: item.answer, videoKey: item.videoKey ?? null };
    }
  }
  const response = FALLBACK_RESPONSES[fallbackIndex % FALLBACK_RESPONSES.length];
  fallbackIndex++;
  return { answer: response, videoKey: null };
}

function formatTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  const min = m < 10 ? `0${m}` : `${m}`;
  return `${hour}:${min} ${ampm}`;
}

function TypingIndicator() {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const animate = (val: SharedValue<number>, delay: number) => {
      val.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1,
        false
      );
    };
    animate(dot1, 0);
    setTimeout(() => animate(dot2, 200), 200);
    setTimeout(() => animate(dot3, 400), 400);
  }, []);

  const style1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const style2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const style3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={styles.typingRow}>
      <Image source={BETH_AVATAR} style={styles.msgAvatar} contentFit="cover" />
      <View style={styles.typingBubble}>
        <Reanimated.View style={[styles.typingDot, style1]} />
        <Reanimated.View style={[styles.typingDot, style2]} />
        <Reanimated.View style={[styles.typingDot, style3]} />
      </View>
    </View>
  );
}

interface MessageBubbleProps {
  message: Message & { videoKey?: string | null };
  onHearBeth?: (id: string, text: string, prerecordedUrl?: string) => void;
  isLoadingVideo?: boolean;
}

function MessageBubble({ message, onHearBeth, isLoadingVideo }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const timeStr = formatTime(message.timestamp);
  const hasPrerecorded = !!(message.videoKey && PRERECORDED_VIDEOS[message.videoKey]);

  if (isUser) {
    return (
      <View style={styles.userMsgWrapper}>
        <View style={styles.userBubble}>
          <Text style={styles.userBubbleText}>{message.content}</Text>
        </View>
        <Text style={styles.timestamp}>{timeStr}</Text>
      </View>
    );
  }

  const btnGoldColor = hasPrerecorded ? '#E0BC5A' : '#C9A84C';

  return (
    <View style={styles.bethMsgWrapper}>
      <Image source={BETH_AVATAR} style={styles.msgAvatar} contentFit="cover" />
      <View style={styles.bethMsgContent}>
        <View style={styles.bethBubble}>
          <Text style={styles.bethBubbleText}>{message.content}</Text>
        </View>
        <Text style={styles.timestamp}>{timeStr}</Text>
        <AnimatedPressable
          onPress={() => {
            const prerecordedUrl = message.videoKey ? PRERECORDED_VIDEOS[message.videoKey] : undefined;
            console.log('[Chat] Hear Beth answer pressed for message:', message.id, 'prerecorded:', !!prerecordedUrl);
            onHearBeth?.(message.id, message.content, prerecordedUrl);
          }}
          disabled={!hasPrerecorded && isLoadingVideo}
          style={styles.hearBethBtn}
        >
          {!hasPrerecorded && isLoadingVideo ? (
            <ActivityIndicator size="small" color="#C9A84C" />
          ) : (
            <>
              <Volume2 size={13} color={btnGoldColor} />
              <Text style={[styles.hearBethText, { color: btnGoldColor }]}>
                {hasPrerecorded ? '▶ Hear Beth answer' : 'Hear Beth answer'}
              </Text>
            </>
          )}
        </AnimatedPressable>
      </View>
    </View>
  );
}

function BethVideoModalNative({ videoUrl, onClose }: { videoUrl: string; onClose: () => void }) {
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = false;
    p.play();
  });

  return (
    <View style={styles.videoModalRoot}>
      <VideoView
        player={player}
        style={styles.videoPlayer}
        contentFit="contain"
        nativeControls={false}
      />
      <View style={styles.videoCloseBtn}>
        <AnimatedPressable onPress={onClose} style={styles.videoClosePressable}>
          <X size={22} color="#F5F0E8" />
        </AnimatedPressable>
      </View>
      <View style={styles.videoLabel}>
        <Text style={styles.videoLabelText}>Beth</Text>
        <Text style={styles.videoLabelSub}>Executive Counsel</Text>
      </View>
    </View>
  );
}

// Web-only: typed as any to avoid JSX conflicts with the native <video> element
const WebVideo: any = 'video';

function BethVideoModalWeb({ videoUrl, onClose }: { videoUrl: string; onClose: () => void }) {
  const webVideoRef = useRef<any>(null);

  useEffect(() => {
    if (webVideoRef.current) {
      webVideoRef.current.play().catch(() => {});
    }
  }, [videoUrl]);

  return (
    <View style={styles.videoModalRoot}>
      <WebVideo
        ref={webVideoRef}
        src={videoUrl}
        autoPlay
        controls
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }}
      />
      <View style={styles.videoCloseBtn}>
        <AnimatedPressable onPress={onClose} style={styles.videoClosePressable}>
          <X size={22} color="#F5F0E8" />
        </AnimatedPressable>
      </View>
      <View style={styles.videoLabel}>
        <Text style={styles.videoLabelText}>Beth</Text>
        <Text style={styles.videoLabelSub}>Executive Counsel</Text>
      </View>
    </View>
  );
}

function BethVideoModal({ videoUrl, onClose }: { videoUrl: string; onClose: () => void }) {
  if (Platform.OS === 'web') {
    return <BethVideoModalWeb videoUrl={videoUrl} onClose={onClose} />;
  }
  return <BethVideoModalNative videoUrl={videoUrl} onClose={onClose} />;
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoLoadingMsgId, setVideoLoadingMsgId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const hasAutoSent = useRef(false);

  useEffect(() => {
    if (params.q && !hasAutoSent.current) {
      hasAutoSent.current = true;
      const initialQ = params.q;
      console.log('[Chat] Auto-sending initial question:', initialQ);
      setTimeout(() => {
        sendMessage(initialQ);
      }, 300);
    }
  }, []);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    console.log('[Chat] User sent message:', trimmed);

    const userMsg: Message = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const delay = 1500 + Math.random() * 1000;
    console.log('[Chat] Beth is typing, delay:', Math.round(delay), 'ms');

    setTimeout(() => {
      const { answer, videoKey } = getBethResponse(trimmed);
      console.log('[Chat] Beth responded:', answer.substring(0, 50) + '...', 'videoKey:', videoKey);
      const bethMsg: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: answer,
        timestamp: new Date(),
        videoKey: videoKey,
      };
      setMessages((prev) => [...prev, bethMsg]);
      setIsTyping(false);
    }, delay);
  }, []);

  async function handleHearBeth(messageId: string, text: string, prerecordedUrl?: string) {
    // If we have a pre-recorded URL, play it instantly
    if (prerecordedUrl) {
      console.log('[Chat] Playing pre-recorded video for messageId:', messageId);
      setVideoUrl(prerecordedUrl);
      return;
    }
    // Otherwise fall back to generating via API
    if (videoLoading) return;
    console.log('[Chat] handleHearBeth pressed, messageId:', messageId, '— generating via API');
    setVideoLoadingMsgId(messageId);
    setVideoLoading(true);
    try {
      console.log('[Chat] Fetching HeyGen video for text:', text.substring(0, 60) + '...');
      const res = await fetch('https://ziujnqcpjbflceercdij.supabase.co/functions/v1/heygen-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.log('[Chat] HeyGen video request failed:', res.status, errText);
        Alert.alert('Could not generate video', 'Please try again.');
        return;
      }
      const data = await res.json();
      console.log('[Chat] HeyGen video response received, video_url:', data.video_url ? 'present' : 'missing');
      if (data.video_url) {
        setVideoUrl(data.video_url);
      } else {
        Alert.alert('Could not generate video', data.error || 'Please try again.');
      }
    } catch (e) {
      console.log('[Chat] HeyGen video fetch error:', e);
      Alert.alert('Error', 'Could not reach Beth right now. Please try again.');
    } finally {
      setVideoLoading(false);
      setVideoLoadingMsgId(null);
    }
  }

  function handleSend() {
    console.log('[Chat] Send button pressed');
    sendMessage(inputText);
  }

  function handleVoice() {
    console.log('[Chat] Voice button pressed from chat');
    router.push('/voice');
  }

  function handleBack() {
    console.log('[Chat] Back button pressed');
    router.back();
  }

  function handleWipe() {
    console.log('[Chat] Wipe button pressed');
    Alert.alert(
      'Clear conversation?',
      'This will remove all messages in this session.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            console.log('[Chat] Conversation cleared');
            setMessages([]);
          },
        },
      ]
    );
  }

  const allItems: (Message | { id: string; type: 'typing' })[] = isTyping
    ? [...messages, { id: 'typing', type: 'typing' as const }]
    : messages;

  return (
    <View style={[styles.root, { backgroundColor: COLORS.background }]}>
      {/* Custom header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <AnimatedPressable onPress={handleBack} style={styles.headerBtn}>
          <ChevronLeft size={24} color={COLORS.gold} />
        </AnimatedPressable>

        <View style={styles.headerCenter}>
          <Image source={BETH_AVATAR} style={styles.headerAvatar} contentFit="cover" />
          <View>
            <Text style={styles.headerName}>Beth</Text>
            <Text style={styles.headerSubtitle}>Executive Counsel</Text>
          </View>
        </View>

        <AnimatedPressable onPress={handleWipe} style={styles.headerBtn}>
          <Trash2 size={20} color={COLORS.textSecondary} />
        </AnimatedPressable>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={allItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messagesList,
            { paddingBottom: 16 },
          ]}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
          renderItem={({ item }) => {
            if ('type' in item && item.type === 'typing') {
              return <TypingIndicator />;
            }
            return (
              <MessageBubble
                message={item as Message}
                onHearBeth={handleHearBeth}
                isLoadingVideo={videoLoadingMsgId === (item as Message).id}
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Image source={BETH_AVATAR} style={styles.emptyAvatar} contentFit="cover" />
              <Text style={styles.emptyTitle}>Start a conversation</Text>
              <Text style={styles.emptySubtitle}>
                Beth is here. Everything you share stays private.
              </Text>
            </View>
          }
        />

        {/* Input bar */}
        <View
          style={[
            styles.inputBar,
            { paddingBottom: insets.bottom + 8 },
          ]}
        >
          <AnimatedPressable onPress={handleVoice} style={styles.voiceBtn}>
            <Mic size={20} color={COLORS.gold} />
          </AnimatedPressable>

          <TextInput
            style={styles.chatInput}
            placeholder="Message Beth..."
            placeholderTextColor={COLORS.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            returnKeyType="default"
            onSubmitEditing={handleSend}
          />

          <AnimatedPressable
            onPress={handleSend}
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            disabled={!inputText.trim()}
          >
            <Send size={18} color="#0A0A0F" />
          </AnimatedPressable>
        </View>
      </KeyboardAvoidingView>

      {/* Full-screen video modal */}
      <Modal
        visible={!!videoUrl}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => {
          console.log('[Chat] Video modal closed');
          setVideoUrl(null);
        }}
      >
        {videoUrl ? (
          <BethVideoModal
            videoUrl={videoUrl}
            onClose={() => {
              console.log('[Chat] Video modal close button pressed');
              setVideoUrl(null);
            }}
          />
        ) : null}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3A',
    backgroundColor: '#0A0A0F',
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F5F0E8',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#8A8A9A',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexGrow: 1,
  },
  userMsgWrapper: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userBubble: {
    backgroundColor: '#C9A84C',
    borderRadius: 18,
    borderTopRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '75%',
  },
  userBubbleText: {
    color: '#0A0A0F',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  bethMsgWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    gap: 8,
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    flexShrink: 0,
  },
  bethMsgContent: {
    flex: 1,
    maxWidth: '75%',
  },
  bethBubble: {
    backgroundColor: '#1A1A28',
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bethBubbleText: {
    color: '#F5F0E8',
    fontSize: 15,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    color: '#8A8A9A',
    marginTop: 4,
    marginHorizontal: 4,
  },
  hearBethBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(201, 168, 76, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.25)',
    alignSelf: 'flex-start',
    minHeight: 28,
    minWidth: 80,
    justifyContent: 'center',
  },
  hearBethText: {
    fontSize: 12,
    color: '#C9A84C',
    fontWeight: '500',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    gap: 8,
  },
  typingBubble: {
    backgroundColor: '#1A1A28',
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#C9A84C',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F5F0E8',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8A8A9A',
    textAlign: 'center',
    lineHeight: 20,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A3A',
    backgroundColor: '#13131A',
    gap: 8,
  },
  voiceBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A28',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#F5F0E8',
    fontSize: 15,
    maxHeight: 100,
    lineHeight: 20,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C9A84C',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  videoModalRoot: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoPlayer: {
    flex: 1,
    width: '100%',
  },
  videoCloseBtn: {
    position: 'absolute',
    top: 56,
    left: 20,
    zIndex: 10,
  },
  videoClosePressable: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoLabel: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  videoLabelText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F5F0E8',
  },
  videoLabelSub: {
    fontSize: 14,
    color: '#C9A84C',
    marginTop: 4,
  },
});
