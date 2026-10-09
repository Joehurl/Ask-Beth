import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { X, Mic, MicOff, PhoneOff, Volume2 } from 'lucide-react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/AnimatedPressable';

const BETH_AVATAR = require('../assets/images/da99e73f-6f06-45b7-b465-fbc00b7f1169.jpeg');

function WaveBar({ delay }: { delay: number }) {
  const height = useSharedValue(8);

  useEffect(() => {
    height.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(8 + Math.random() * 32, { duration: 300 + Math.random() * 300 }),
          withTiming(8, { duration: 300 + Math.random() * 300 })
        ),
        -1,
        true
      )
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return <Reanimated.View style={[styles.waveBar, animStyle]} />;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const mm = m < 10 ? `0${m}` : `${m}`;
  const ss = s < 10 ? `0${s}` : `${s}`;
  return `${mm}:${ss}`;
}

export default function VoiceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [statusText, setStatusText] = useState('Connecting...');

  const ringOpacity = useSharedValue(0.3);
  const ringScale = useSharedValue(1.0);

  useEffect(() => {
    console.log('[Voice] Voice screen opened');

    // Pulsing ring animation
    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 })
      ),
      -1,
      false
    );
    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1500 }),
        withTiming(1.0, { duration: 1500 })
      ),
      -1,
      false
    );

    // Status transition
    const statusTimer = setTimeout(() => {
      setStatusText('Beth is listening...');
      console.log('[Voice] Status changed to: Beth is listening...');
    }, 2000);

    // Duration timer
    const durationTimer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(statusTimer);
      clearInterval(durationTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ringAnimStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  function handleMute() {
    const next = !isMuted;
    console.log('[Voice] Mute toggled:', next ? 'muted' : 'unmuted');
    setIsMuted(next);
  }

  function handleSpeaker() {
    const next = !isSpeaker;
    console.log('[Voice] Speaker toggled:', next ? 'on' : 'off');
    setIsSpeaker(next);
  }

  function handleEndCall() {
    console.log('[Voice] End call pressed, duration:', formatDuration(elapsed));
    router.back();
  }

  function handleClose() {
    console.log('[Voice] Close button pressed');
    router.back();
  }

  const elapsedDisplay = formatDuration(elapsed);

  return (
    <View style={[styles.root, { backgroundColor: '#0A0A0F' }]}>
      {/* Radial glow effect */}
      <View style={styles.glowOuter} />
      <View style={styles.glowInner} />

      {/* Close button */}
      <View style={[styles.closeBtn, { top: insets.top + 12 }]}>
        <AnimatedPressable onPress={handleClose} style={styles.closePressable}>
          <X size={22} color="#8A8A9A" />
        </AnimatedPressable>
      </View>

      {/* Center content */}
      <View style={styles.centerContent}>
        {/* Pulsing ring */}
        <View style={styles.avatarContainer}>
          <Reanimated.View style={[styles.pulseRing, ringAnimStyle]} />
          <View style={styles.avatarRing}>
            <Image
              source={BETH_AVATAR}
              style={styles.avatar}
              contentFit="cover"
              accessibilityLabel="Beth avatar"
            />
          </View>
        </View>

        <Text style={styles.name}>Beth</Text>
        <Text style={styles.subtitle}>Executive Counsel</Text>
        <Text style={styles.statusText}>{statusText}</Text>

        {/* Waveform */}
        <View style={styles.waveform}>
          <WaveBar delay={0} />
          <WaveBar delay={100} />
          <WaveBar delay={200} />
          <WaveBar delay={300} />
          <WaveBar delay={400} />
        </View>

        <Text style={styles.duration}>{elapsedDisplay}</Text>
      </View>

      {/* Controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 32 }]}>
        <AnimatedPressable onPress={handleMute} style={styles.controlBtn}>
          {isMuted ? (
            <Mic size={26} color="#F5F0E8" />
          ) : (
            <MicOff size={26} color="#F5F0E8" />
          )}
        </AnimatedPressable>

        <AnimatedPressable onPress={handleEndCall} style={styles.endCallBtn}>
          <PhoneOff size={28} color="#FFFFFF" />
        </AnimatedPressable>

        <AnimatedPressable
          onPress={handleSpeaker}
          style={[styles.controlBtn, isSpeaker && styles.controlBtnActive]}
        >
          <Volume2 size={26} color={isSpeaker ? '#C9A84C' : '#F5F0E8'} />
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  glowOuter: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(201, 168, 76, 0.04)',
    top: '15%',
    alignSelf: 'center',
  },
  glowInner: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(201, 168, 76, 0.06)',
    top: '20%',
    alignSelf: 'center',
  },
  closeBtn: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
  },
  closePressable: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pulseRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: '#C9A84C',
  },
  avatarRing: {
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 2,
    borderColor: '#C9A84C',
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F5F0E8',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#8A8A9A',
  },
  statusText: {
    fontSize: 15,
    color: '#C9A84C',
    fontWeight: '500',
    marginTop: 4,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 48,
    marginTop: 8,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: '#C9A84C',
    opacity: 0.8,
  },
  duration: {
    fontSize: 16,
    color: '#8A8A9A',
    fontWeight: '500',
    letterSpacing: 1,
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingHorizontal: 40,
  },
  controlBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1A1A28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnActive: {
    backgroundColor: 'rgba(201, 168, 76, 0.15)',
    borderWidth: 1,
    borderColor: '#C9A84C',
  },
  endCallBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
