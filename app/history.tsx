import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ChevronLeft, Clock } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { getSessions, clearSessions, Session } from '@/utils/sessions';

const BETH_AVATAR = require('../assets/images/da99e73f-6f06-45b7-b465-fbc00b7f1169.jpeg');

function formatSessionDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    const h = date.getHours();
    const m = date.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    const min = m < 10 ? `0${m}` : `${m}`;
    return `Today, ${hour}:${min} ${ampm}`;
  } else if (diffHours < 48) {
    const h = date.getHours();
    const m = date.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    const min = m < 10 ? `0${m}` : `${m}`;
    return `Yesterday, ${hour}:${min} ${ampm}`;
  } else {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  if (m < 1) return '< 1 min';
  return `${m} min`;
}

interface SessionCardProps {
  session: Session;
  index: number;
  onPress: () => void;
}

function SessionCard({ session, index, onPress }: SessionCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay: index * 70,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        delay: index * 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const firstUserMsg = session.messages.find((m) => m.role === 'user');
  const preview = firstUserMsg ? firstUserMsg.content : session.topic;
  const dateStr = formatSessionDate(session.date);
  const durationStr = formatDuration(session.durationSeconds);
  const msgCount = session.messages.length;

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <AnimatedPressable onPress={onPress} style={styles.sessionCard}>
        <Image source={BETH_AVATAR} style={styles.sessionAvatar} contentFit="cover" />
        <View style={styles.sessionContent}>
          <View style={styles.sessionTopRow}>
            <Text style={styles.sessionDate}>{dateStr}</Text>
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{durationStr}</Text>
            </View>
          </View>
          <Text style={styles.sessionPreview} numberOfLines={1} ellipsizeMode="tail">
            {preview}
          </Text>
          <Text style={styles.sessionMsgCount}>
            {msgCount}
            {' messages'}
          </Text>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    console.log('[History] Screen opened, loading sessions');
    setSessions(getSessions());
  }, []);

  function handleBack() {
    console.log('[History] Back pressed');
    router.back();
  }

  function handleClearAll() {
    console.log('[History] Clear All pressed');
    Alert.alert(
      'Clear all sessions?',
      'This will permanently remove all past conversations.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear all',
          style: 'destructive',
          onPress: () => {
            console.log('[History] All sessions cleared');
            clearSessions();
            setSessions([]);
          },
        },
      ]
    );
  }

  function handleSessionPress(session: Session) {
    console.log('[History] Session pressed:', session.id, 'topic:', session.topic);
    router.push('/chat');
  }

  function handleStartNow() {
    console.log('[History] Start Now pressed from empty state');
    router.push('/chat');
  }

  return (
    <View style={[styles.root, { backgroundColor: '#0A0A0F' }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <AnimatedPressable onPress={handleBack} style={styles.headerBtn}>
          <ChevronLeft size={24} color="#C9A84C" />
        </AnimatedPressable>
        <Text style={styles.headerTitle}>Past Sessions</Text>
        <AnimatedPressable onPress={handleClearAll} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Clear All</Text>
        </AnimatedPressable>
      </View>

      {/* List */}
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        renderItem={({ item, index }) => (
          <SessionCard
            session={item}
            index={index}
            onPress={() => handleSessionPress(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Image source={BETH_AVATAR} style={styles.emptyAvatar} contentFit="cover" />
            <Text style={styles.emptyTitle}>No sessions yet</Text>
            <Text style={styles.emptySubtitle}>
              Start a conversation with Beth. Everything stays private.
            </Text>
            <AnimatedPressable onPress={handleStartNow} style={styles.startBtn}>
              <Text style={styles.startBtnText}>Start Now</Text>
            </AnimatedPressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3A',
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#F5F0E8',
    textAlign: 'center',
  },
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    minWidth: 44,
    alignItems: 'flex-end',
  },
  clearBtnText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
  },
  listContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  sessionCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  sessionAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    flexShrink: 0,
  },
  sessionContent: {
    flex: 1,
    gap: 4,
  },
  sessionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionDate: {
    fontSize: 12,
    color: '#8A8A9A',
  },
  durationBadge: {
    backgroundColor: 'rgba(201, 168, 76, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  durationText: {
    fontSize: 11,
    color: '#C9A84C',
    fontWeight: '600',
  },
  sessionPreview: {
    fontSize: 14,
    color: '#F5F0E8',
    lineHeight: 20,
  },
  sessionMsgCount: {
    fontSize: 12,
    color: '#8A8A9A',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F5F0E8',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8A8A9A',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  startBtn: {
    backgroundColor: '#C9A84C',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  startBtnText: {
    color: '#0A0A0F',
    fontSize: 15,
    fontWeight: '700',
  },
});
