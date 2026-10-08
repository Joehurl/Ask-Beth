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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ChevronLeft, Trash2, Send, Mic } from 'lucide-react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  SharedValue,
} from 'react-native-reanimated';
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

interface ScriptedAnswer {
  keywords: string[];
  answer: string;
}

const SCRIPTED_ANSWERS: ScriptedAnswer[] = [
  {
    keywords: ["serious", "he serious", "is he serious"],
    answer: "Watch what he builds, not what he says — a serious man makes room in his calendar, his friends and his plans without being asked twice. If you have to keep explaining your own value to him, he's already given you the answer.",
  },
  {
    keywords: ["women like sports", "sports", "do women"],
    answer: "Some do, some don't — same as men. But the real question isn't whether women like sports. It's whether she likes them with you. If she doesn't care about the game and still curls up beside you to watch it, that isn't her tolerating your hobby. That's her choosing your company.",
  },
  {
    keywords: ["first date", "how should a first date", "date go"],
    answer: "Short, warm, and somewhere you can actually hear each other. Ninety minutes is plenty — long enough to know whether you'd see him again, short enough that nobody feels trapped. Let him plan it, and pay attention to whether he asks you anything real. Then watch how he treats the waiter. You'll learn more in an hour of watching than three hours of talking.",
  },
  {
    keywords: ["bring up money", "when do i bring up money", "money"],
    answer: "Earlier than feels romantic — somewhere around the third or fourth date, once you know you like each other but before you've merged any of your lives. Bring it up as a fact about yourself, not a test of him: what you save, what you owe, what you'd never split.",
  },
  {
    keywords: ["stop chasing", "chasing him", "chasing"],
    answer: "You stop by giving the ball back — one message, then silence, and the next move is his to make. Chasing isn't love with more effort; it's anxiety with a plan, and he can feel the difference.",
  },
  {
    keywords: ["change my name", "change name", "marry", "marriage name"],
    answer: "That's a question about paperwork pretending to be a question about love. Keep it, change it or take the hyphen — but decide it for your own reasons, and notice how he reacts when you say the true thing.",
  },
  {
    keywords: ["say no", "without a war", "no without"],
    answer: "Say it once, plainly, in your normal voice, and then stop explaining — the extra reasons are what turn a no into a negotiation. You're allowed to disappoint someone you love; that's a cost, not a crisis.",
  },
  {
    keywords: ["earns more", "earns far more", "split things", "he earns"],
    answer: "Split by proportion, not by pride — a percentage of what each of you earns keeps the shared life equal without making the lower earner a guest in it. And say out loud what you can't afford before you resent it quietly.",
  },
  {
    keywords: ["promotion", "take the promotion", "evenings"],
    answer: "Take it if it buys you something you actually want — money, skill, a door that opens later — and be honest about how long you'll pay that price. Nobody hands the evenings back afterwards, so put an end date on it before you say yes.",
  },
  {
    keywords: ["miss him", "still miss", "how long", "allowed to miss"],
    answer: "As long as it takes, and longer than the people around you would like, if he mattered to you. What you're not allowed to do is keep the missing private and let it quietly run your life — say it out loud to somebody who won't flinch.",
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

function getBethResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  for (const item of SCRIPTED_ANSWERS) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.answer;
    }
  }
  const response = FALLBACK_RESPONSES[fallbackIndex % FALLBACK_RESPONSES.length];
  fallbackIndex++;
  return response;
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
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const timeStr = formatTime(message.timestamp);

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

  return (
    <View style={styles.bethMsgWrapper}>
      <Image source={BETH_AVATAR} style={styles.msgAvatar} contentFit="cover" />
      <View style={styles.bethMsgContent}>
        <View style={styles.bethBubble}>
          <Text style={styles.bethBubbleText}>{message.content}</Text>
        </View>
        <Text style={styles.timestamp}>{timeStr}</Text>
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
      const response = getBethResponse(trimmed);
      console.log('[Chat] Beth responded:', response.substring(0, 50) + '...');
      const bethMsg: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, bethMsg]);
      setIsTyping(false);
    }, delay);
  }, []);

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
            return <MessageBubble message={item as Message} />;
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
});
