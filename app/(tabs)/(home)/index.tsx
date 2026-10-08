import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Mic, Clock, Settings, ChevronRight } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';

const COLORS = {
  background: '#0A0A0F',
  card: '#13131A',
  border: '#2A2A3A',
  gold: '#C9A84C',
  goldLight: '#E8C97A',
  textPrimary: '#F5F0E8',
  textSecondary: '#8A8A9A',
  bethBubble: '#1A1A28',
};

const BETH_AVATAR = require('../../../assets/images/da99e73f-6f06-45b7-b465-fbc00b7f1169.jpeg');

const PRELOADED_QUESTIONS = [
  { question: "How do I know if he's serious?", category: "Dating" },
  { question: "How should a first date go?", category: "Dating" },
  { question: "How do I stop chasing him?", category: "Dating" },
  { question: "Do men actually need to make the first move?", category: "Dating" },
  { question: "Why is communication so indirect when something is wrong?", category: "Relationships" },
  { question: "What does 'romance' mean in day-to-day life?", category: "Relationships" },
  { question: "What does it mean when a guy says he's thinking about 'nothing'?", category: "Men" },
  { question: "How do men express vulnerability when overwhelmed?", category: "Men" },
  { question: "Does initiating intimacy matter to men as much as women?", category: "Men" },
  { question: "Should I focus on paying off debt or saving first?", category: "Finance" },
  { question: "How should I negotiate my salary for a new job offer?", category: "Career" },
  { question: "What's the best technique to avoid burnout and stay focused?", category: "Productivity" },
  { question: "How much water should I actually be drinking every day?", category: "Health" },
  { question: "When do I bring up money in a relationship?", category: "Dating" },
  { question: "How do I say no without starting a war?", category: "Relationships" },
  { question: "How should we split things when he earns far more?", category: "Finance" },
  { question: "Should I take the promotion if it means long evenings?", category: "Career" },
  { question: "How long am I allowed to miss him?", category: "Life" },
  { question: "Should I change my name when I marry?", category: "Life" },
  { question: "Do women actually like sports?", category: "Men" },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [question, setQuestion] = React.useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const avatarScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(avatarScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 12,
        bounciness: 6,
      }),
    ]).start();
  }, []);

  function handleAskBeth() {
    const q = question.trim();
    console.log('[Home] Ask Beth pressed, question:', q || '(empty)');
    router.push({ pathname: '/chat', params: { q } });
  }

  function handleQuestionPress(question: string) {
    console.log('[Home] Pre-loaded question pressed:', question);
    router.push({ pathname: '/chat', params: { q: question } });
  }

  function handleVoiceSession() {
    console.log('[Home] Voice Session pressed');
    router.push('/voice');
  }

  function handlePastSessions() {
    console.log('[Home] Past Sessions pressed');
    router.push('/history');
  }

  function handleSettings() {
    console.log('[Home] Settings pressed');
    router.push('/settings');
  }

  return (
    <View style={[styles.root, { backgroundColor: COLORS.background }]}>
      {/* Settings button */}
      <Animated.View
        style={[
          styles.settingsBtn,
          { top: insets.top + 12 },
          { opacity: fadeAnim },
        ]}
      >
        <AnimatedPressable onPress={handleSettings} style={styles.settingsPressable}>
          <Settings size={22} color={COLORS.textSecondary} />
        </AnimatedPressable>
      </Animated.View>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 32 },
        ]}
      >
        {/* Hero section */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: avatarScale }],
            },
          ]}
        >
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarRing}>
              <Image
                source={BETH_AVATAR}
                style={styles.avatar}
                contentFit="cover"
                accessibilityLabel="Beth, your AI executive counsel"
              />
            </View>
          </View>

          <Text style={styles.headline}>Ask Beth</Text>
          <Text style={styles.tagline}>She's heard it all. Ask her anything.</Text>
          <Text style={styles.subheadline}>Private counsel · Any hour you need her.</Text>

          <View style={styles.statusBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.statusText}>Available now</Text>
          </View>
        </Animated.View>

        {/* Input section */}
        <Animated.View
          style={[
            styles.inputSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.sectionLabel}>What's on your mind?</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask me anything — career, strategy, life..."
              placeholderTextColor={COLORS.textSecondary}
              value={question}
              onChangeText={setQuestion}
              multiline
              maxLength={500}
              textAlignVertical="top"
              returnKeyType="default"
            />
          </View>
          <AnimatedPressable onPress={handleAskBeth} style={styles.askButton}>
            <Text style={styles.askButtonText}>Ask Beth →</Text>
          </AnimatedPressable>
        </Animated.View>

        {/* Pre-loaded questions */}
        <Animated.View
          style={[
            styles.topicsSection,
            { opacity: fadeAnim },
          ]}
        >
          <Text style={styles.sectionLabel}>Ask Beth about...</Text>
          {PRELOADED_QUESTIONS.map((item) => (
            <AnimatedPressable
              key={item.question}
              onPress={() => handleQuestionPress(item.question)}
              style={styles.questionCard}
            >
              <View style={styles.questionCardInner}>
                <View style={styles.questionCardLeft}>
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryPillText}>{item.category}</Text>
                  </View>
                  <Text style={styles.questionText}>{item.question}</Text>
                </View>
                <ChevronRight size={16} color="#8A8A9A" />
              </View>
            </AnimatedPressable>
          ))}
        </Animated.View>

        {/* Bottom action row */}
        <Animated.View
          style={[
            styles.actionRow,
            { opacity: fadeAnim },
          ]}
        >
          <AnimatedPressable onPress={handleVoiceSession} style={styles.actionButton}>
            <Mic size={20} color={COLORS.gold} />
            <Text style={styles.actionButtonText}>Voice Session</Text>
          </AnimatedPressable>

          <AnimatedPressable onPress={handlePastSessions} style={styles.actionButton}>
            <Clock size={20} color={COLORS.gold} />
            <Text style={styles.actionButtonText}>Past Sessions</Text>
          </AnimatedPressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  settingsBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  settingsPressable: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarWrapper: {
    marginBottom: 20,
  },
  avatarRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 2,
    borderColor: '#C9A84C',
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F5F0E8',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 17,
    color: '#F5F0E8',
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '500',
  },
  subheadline: {
    fontSize: 14,
    color: '#C9A84C',
    textAlign: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  statusText: {
    fontSize: 12,
    color: '#8A8A9A',
  },
  inputSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 13,
    color: '#8A8A9A',
    marginBottom: 12,
    fontWeight: '500',
  },
  inputWrapper: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.6)',
    marginBottom: 12,
    minHeight: 80,
  },
  textInput: {
    color: '#F5F0E8',
    fontSize: 15,
    padding: 16,
    minHeight: 80,
    lineHeight: 22,
  },
  askButton: {
    backgroundColor: '#C9A84C',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  askButtonText: {
    color: '#0A0A0F',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  topicsSection: {
    marginBottom: 8,
  },
  questionCard: {
    backgroundColor: '#13131A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A2A3A',
    padding: 16,
    marginBottom: 10,
  },
  questionCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionCardLeft: {
    flex: 1,
    marginRight: 8,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201,168,76,0.12)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  categoryPillText: {
    color: '#C9A84C',
    fontSize: 11,
    fontWeight: '600',
  },
  questionText: {
    color: '#F5F0E8',
    fontSize: 15,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1A1A28',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.4)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#F5F0E8',
    fontSize: 14,
    fontWeight: '500',
  },
});
