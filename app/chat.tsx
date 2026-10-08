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

const BETH_AVATAR = {
  uri: 'https://prod-finalquest-user-projects-storage-bucket-aws.s3.amazonaws.com/user-projects/1175892c-54fd-41ce-9f30-f48071905fee/assets/images/dadf30b4-f21e-4232-8f1d-c727ca2b2ed8.jpg?AWSAccessKeyId=AKIAVRUVRKQJCONXPKGX&Signature=Bri39GWDqYThY9Uwja9l5Od1hXM%3D&Expires=1792026252',
};

const BETH_RESPONSES = [
  "That's a significant decision. Let me ask you this — what does your gut tell you when you imagine yourself 6 months down that path?",
  "I've seen this pattern before. The hesitation you're feeling isn't weakness — it's your instincts protecting you. What specifically feels off?",
  "Here's what the data tells me: the people who thrive in transitions like this share one trait. They act before they feel ready. What's the smallest step you could take today?",
  "Confidentiality is everything in situations like this. Before we go further — who else knows about this?",
  "Strategic clarity comes from eliminating options, not adding them. What are you willing to walk away from?",
  "The answer you're looking for isn't in the details. It's in the pattern. Tell me — has this happened before?",
  "I hear you. And I want you to know — this room is completely private. Nothing leaves here. So tell me the real version.",
  "Power moves quietly. The loudest person in the room rarely controls it. What's your read on the dynamics at play?",
];

let responseIndex = 0;

function getNextResponse(): string {
  const response = BETH_RESPONSES[responseIndex % BETH_RESPONSES.length];
  responseIndex++;
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
      const response = getNextResponse();
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
