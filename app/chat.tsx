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
  serious: "https://files2.heygen.ai/aws_pacific/avatar_tmp/33b80180eac74952b96912424e05f074/d45b8795a8fb4201a296d6ca77db04da.mp4?download_id=cbe2994d-029c-455a-b90e-70f513f54d32&Expires=1792032052&Signature=bmCL4R99~MrkzUzqscK1Yg4KaqPnnmEOPu3nTPTiItbD059j06CHK0N3uLF4mGvcyZUw3pYpTjvTRxEoJBvv8ocxKQ2ivbtCTFhs2ezvf19lBYHvxVyKTk~kVEYTSKacGGOQxjYRa2oib0IDrlwFrJXUf7utrTTIPNZ4cFY58yjyl8yRrx12ptZ9dVdSdaNIrhZZUxbtOmAyIe6xKTz45uK9Mt2TXtOSAaEX8FktJx6jlTsu3qCa-fNttQdvKO~ddCrzSOut~1ihJAmT3HzvfY1lF-xQ27GYn1HVNhIE1NSoWE9rbTbLuQf9B1kb21Yf6QEI7HuWowVd2AZnCuERSQ__&Key-Pair-Id=K38HBHX5LX3X2H",
  sports: "https://files2.heygen.ai/aws_pacific/avatar_tmp/33b80180eac74952b96912424e05f074/b457df31c23343c4bd5341a61f0c5400.mp4?download_id=3db904aa-e6e9-4dab-9e74-71a7b0cbaa89&Expires=1792031978&Signature=d-PAtmkRVJXm3GH8u~izGaEaUA3yTeuVBMMKknQPWUW3ZAjHG88u-8v5sze1CWsyKlsrOsZBz78HOL37sQuyuZwZ17WVkD~uihCjdX48-J8s~0XakqBFtxYI9QrNtLz3nUwXUrD8vYoMOPdzFStUhBPuOc5pz~UkcWSK3~2Rlzk~uMUpKi5p-y5u6soJeP0Is6irCbAPOMzVE-TcMlp~OCrPG4mFoE9ziv1OYpXC0uMNzkdtGNoFItxj~s0~PRdgepKzpbX6pmaZwe-ODSy3Gy9DOUiZHLlF2M4JYvhJFahINR8kwY3jvH4fDwaLVuv2dTcNUvFdp~t1ggizkk3ZDA__&Key-Pair-Id=K38HBHX5LX3X2H",
  first_date: "https://files2.heygen.ai/aws_pacific/avatar_tmp/33b80180eac74952b96912424e05f074/004b1a9c89ac4bdbb6ea5a462ea8db01.mp4?download_id=fd8efec4-9559-4ae9-8acb-f6b7810db7ca&Expires=1792032472&Signature=juR4j7xCr4l4luLKNtYp5U40LQX5UFPsP6HuWu9IOnVKFrR9R8aZlDHNTZVTeuyaXbPBVErSFeGPx6uHAAp33d5RrJEzckhv38~DCSsSWWZLB5Eaq8exCi9eTX-tf2qROFPXXKN5Epy~o~1SOFYjZMdOJVh3DykQ6n3L1~Nu~CIDhGPYAwY-GhG08IUKwrlNaiG65nN6GYWvn6BiPK~FjFE6bBydrMOPOjIlJSmVWy0HTT7Bq8TV9jck2f2n3Ftk1rNv74MruCzdK-TOEB4vOOM9XqkLcpu5xxlFUbcr2pH3d~FMr2nNl30VzhQl4eOJi1aYq-1NGdXv4kK0ElBt~A__&Key-Pair-Id=K38HBHX5LX3X2H",
  money: "https://files2.heygen.ai/aws_pacific/avatar_tmp/33b80180eac74952b96912424e05f074/2e74c6470acb448a93baef312eb96e65.mp4?download_id=ff4923b9-c1f6-47c2-a694-e80748848afd&Expires=1792031978&Signature=lh6oKEjA0~89VcY9PpxW47ldLX73dQ7gz9~ujXZv1-QMJU-8nXfPqjAqlgRBrFPG~Ey~F~6wUkbpr60~MubaZjCUJU6x1ZZ-zB5tLk-V3Bd6usMoKetmlAok8fPgfHmMOC4UiC8D6akf1X4zlSeAhlvBNZ3Hj9VUxe0ddlweDs7Q4uXXcXhb4kPTmuSroruO8ix9SLRZwZWgeP-Y-4JwB~4wTN1UR2z-HfecVcjcmD1MbpERY2m9S76Q9yFGTjmyYDM2t3JJrlzkPLvtKBMzYxPk1blnso-T0fNY1jhoC05qJZN-F3wZJ1NFoPZ9PidScUG8uk~q1npfGoPwHWrBEg__&Key-Pair-Id=K38HBHX5LX3X2H",
  chasing: "https://files2.heygen.ai/aws_pacific/avatar_tmp/33b80180eac74952b96912424e05f074/523b1afa09684b15ab6bb60388b7c4f3.mp4?download_id=09de6b06-e229-46ff-8f22-156734c8b629&Expires=1792031978&Signature=Ux~T7isWQaopx8oTQ2JG5IswjF1LreoVvDOPteKqGiNPHIFP~J9gvLN3yf7Z31QTEeUpdNgtrTCYEBeRJrxsSZevg919zF6LX~M5POMqMbGW6naJCZ3mULjmwMnIYA0INwYo9NZJtVN9c13hWHUmHaHC2fYWuwNtBqhHI7KG5I92zmXL2U06T~uwDbf7hbIXf~Pih3scjHrzUuH1mWu3AXZJglUyS482nnGdOqZQC5YQmOvLwGTaevJmLb2oVFEAwIKO-O8XECQ2sZyRy22DpDgmZsp6wul-ge~x8n5VIUl7jRxKusgHlTOCrJ0MEwk-GANAOnLWKxD-sFkr3ufaEw__&Key-Pair-Id=K38HBHX5LX3X2H",
  name: "https://files2.heygen.ai/aws_pacific/avatar_tmp/33b80180eac74952b96912424e05f074/acbba14400a542d7849bd1193b58f9e0.mp4?download_id=1f8361b8-c23c-4525-ae43-d313450daaa4&Expires=1792031978&Signature=X9GhqaSe9zhflM8dMdmQWNJvkPvQx6nL2f-tg94al1vrHWjRWVz50oWMSsOsAuYvINBL15Jurk5lIkkxxqSzNJS-FjhW1GllHotKvAQFEHFuhDLmtW6h6kaTAdAjgZgPfsptQxOM8bQi3BJxtGzop2Jop83BxYZzM2x78PurCsiPIGb4UXsVyGuM5p3PfwutzodEf~3J9EYSzXiCLqAUQ9lumpAB4GcphBhSarTnCnEsAoPEWjxGO8rmC7F4uux1xhtwLX0aZS32B3cbzC4~SBXaVRNe5N~-ijlsBGJMpHkyV4ctt15IfkNNBCKS0Az7yikS5ykIHaPnJ4fgEqQ7OA__&Key-Pair-Id=K38HBHX5LX3X2H",
  say_no: "https://files2.heygen.ai/aws_pacific/avatar_tmp/33b80180eac74952b96912424e05f074/0ea7e0cf490942e79171d64b14bb266f.mp4?download_id=5d61f8a4-d9f6-4332-96d9-b8c9817c15ca&Expires=1792031978&Signature=kSCzB7tN5rq7uXTGWC3016rgXXml4fYbxMj8pXWOxZ8O27mGNWvNyk4kJNL8KfqQWO2v~QPLya~1OYHlZfPLASaa8THyMK5kQCPaPHWXX6G~VwdCnQO6pCfWJaIqe4MXiEY5n1Sky7B-aYRSZqve-Cx0K5IFl3dC~SxqyLg3h29DrmqwmCCKsfkCVLOuS64XtaWq0mXgF4suNOYzqddt~I0ax0vwQmgvZJKjrJzg1hGtFYPOUEVbiC5feQKRCskk5dcWe~oG9qU6RaHmOilFIiP14IjW1LoQwCAusCSXslhKmAwlZqcVpcc7rhS8hOmvDToECpiLoosJXkR7XiKKig__&Key-Pair-Id=K38HBHX5LX3X2H",
  split: "https://files2.heygen.ai/aws_pacific/avatar_tmp/33b80180eac74952b96912424e05f074/d98aa0206a6f438a90307b1a4bfc0dc4.mp4?download_id=485f2754-ea01-47d1-a9c7-2eb9617fea9a&Expires=1792031995&Signature=V~IDlP-aNfPEJxdXbRMh-EQV8De2yH4tnBJiK6TQ8Nri0j4xxetOrG7y0Cn~TNh8b2cKI1cz5tvjdI~NDgl1Q9BpPx9qiUXnupDtvDobRMhaq7GLwlqceaHbB06Boqvie8cTolxFr33kSk-2FR9JdHAzoINumxMnGIbzQILQ4a0op0lqQVKtesTGiMVPvyOkwxFWoy0vX8iteYOFxrjvF3iQWHb1kK5a9jTM98tqqDfQ~ndGkugeixgmzkYwoE9q~L2mjSQ~Mt3RZSx-Lnn4gcGl2dlY1T~j4EzqE3TfD~Ho0zRtF2-7YHP~Ce5A7sSoE46l60TE0Onx2tPSIoft6g__&Key-Pair-Id=K38HBHX5LX3X2H",
  promotion: "https://files2.heygen.ai/aws_pacific/avatar_tmp/33b80180eac74952b96912424e05f074/32ab478b43394bd4bb9db07b94834bba.mp4?download_id=b7970247-b216-4be9-b23a-257cdcc0e1a5&Expires=1792031995&Signature=XWp0Sj~-S7YL-wFEjMpRu3h4xa0yF5bVaLUdNXcbhqOsvmA1dN9zU~Wu0TfsB3iUJUFUA24KbNPIA4PMbAtLOgxtiOKDB5F1ohE-wrdP68eS69lA4uJNJvyOULvcF4gj0MsTOWtS9fLOF2W2~EFEy9OR4zbSBx5MtByofHo~Rzfgj~qb-0azVDax3Aott86y69QPv5aoODFQ0iSep8r-nBC7WCAjnbtdVtIrooJwxF6OjmbMnYeEOUuDA2g6W5tQbu~ofQsR-aVQMT-zAoQZOv74dgborPp8Pj79ll~nUZcBauZmfbsHWDytL1-qr~WDqkDFkS6~dmjTVAGfNSv~Hg__&Key-Pair-Id=K38HBHX5LX3X2H",
  miss_him: "https://files2.heygen.ai/aws_pacific/avatar_tmp/33b80180eac74952b96912424e05f074/6d6dd4259fa94f5fbf9cfb2fd3f8464f.mp4?download_id=16786488-578d-4810-b54a-2640ec90c8f3&Expires=1792032473&Signature=MjRuR6dgKEHP0fTzTun~kFpymHYGmbvVXNr7S0V31Lb1BYfoq7Uhai6wUgLG98XoHHCAHs1wASeey~HxoraCM36KNfEpzTmSO9EYA5M6r2TDz-Y4DoXJGQWnKjs6~gsfcxDLHWbM0lIjIW7-PUda9vXgQC5bzXdvZPnvVP67KEb~bbu5X85EGetb~n4gyZeNn1ITbbgbJMY6EJmSIN7ku4-0yTJI6EK5UbvMiiD7cwVlc6gvo-Iu94a~qQ-mEXHpZP37bW25OU6V5x8l59ZA47J4QhswFngSdDmItVbTtBn33oZarr45Mq3GF8MyYupf2xnzE9oT1LvfI~sY5r8yJA__&Key-Pair-Id=K38HBHX5LX3X2H",
};

interface ScriptedAnswer {
  keywords: string[];
  answer: string;
  videoKey: string;
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
      return { answer: item.answer, videoKey: item.videoKey };
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

function BethVideoModal({ videoUrl, onClose }: { videoUrl: string; onClose: () => void }) {
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = false;
    p.play();
  });

  return (
    <View style={styles.videoModalRoot}>
      <VideoView
        player={player}
        style={styles.videoPlayer}
        contentFit="cover"
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
    backgroundColor: '#0A0A0F',
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
