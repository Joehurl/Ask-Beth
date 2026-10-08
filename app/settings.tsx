import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ChevronLeft, Trash2, Info, ChevronRight, Crown, Shield, Moon } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { clearSessions } from '@/utils/sessions';

const BETH_AVATAR = require('../assets/images/da99e73f-6f06-45b7-b465-fbc00b7f1169.jpeg');

interface SettingsRowProps {
  label: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

function SettingsRow({
  label,
  subtitle,
  leftIcon,
  rightElement,
  onPress,
  destructive,
  isFirst,
  isLast,
}: SettingsRowProps) {
  const labelColor = destructive ? '#FF3B30' : '#F5F0E8';

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.settingsRow,
        isFirst && styles.rowFirst,
        isLast && styles.rowLast,
        !isLast && styles.rowWithBorder,
      ]}
    >
      {leftIcon && <View style={styles.rowIcon}>{leftIcon}</View>}
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: labelColor }]}>{label}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {rightElement}
    </AnimatedPressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [privacyOn] = useState(true);
  const [darkModeOn] = useState(true);

  function handleBack() {
    console.log('[Settings] Back pressed');
    router.back();
  }

  function handleWipeAll() {
    console.log('[Settings] Wipe All Sessions pressed');
    Alert.alert(
      'Wipe all sessions?',
      'All conversations will be permanently deleted from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Wipe all',
          style: 'destructive',
          onPress: () => {
            console.log('[Settings] All sessions wiped');
            clearSessions();
          },
        },
      ]
    );
  }

  function handlePrivacyPolicy() {
    console.log('[Settings] Privacy Policy pressed');
  }

  function handleTerms() {
    console.log('[Settings] Terms of Service pressed');
  }

  function handleUpgrade() {
    console.log('[Settings] Upgrade to Unlimited pressed');
  }

  return (
    <View style={[styles.root, { backgroundColor: '#0A0A0F' }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <AnimatedPressable onPress={handleBack} style={styles.headerBtn}>
          <ChevronLeft size={24} color="#C9A84C" />
        </AnimatedPressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* Upgrade card */}
        <AnimatedPressable onPress={handleUpgrade} style={styles.upgradeCard}>
          <Crown size={22} color="#C9A84C" />
          <View style={styles.upgradeText}>
            <Text style={styles.upgradeTitle}>Upgrade to Unlimited</Text>
            <Text style={styles.upgradeSubtitle}>Unlimited sessions · Priority access</Text>
          </View>
          <ChevronRight size={18} color="#C9A84C" />
        </AnimatedPressable>

        {/* Privacy & Security */}
        <Text style={styles.sectionHeader}>Privacy & Security</Text>
        <View style={styles.sectionCard}>
          <SettingsRow
            label="Session Privacy"
            subtitle="All conversations are end-to-end private"
            leftIcon={<Shield size={18} color="#C9A84C" />}
            rightElement={
              <Switch
                value={privacyOn}
                disabled
                trackColor={{ false: '#2A2A3A', true: 'rgba(201,168,76,0.5)' }}
                thumbColor={privacyOn ? '#C9A84C' : '#8A8A9A'}
              />
            }
            isFirst
          />
          <SettingsRow
            label="Local Storage Only"
            subtitle="Your data never leaves your device"
            leftIcon={<Info size={18} color="#8A8A9A" />}
            rightElement={<Info size={16} color="#8A8A9A" />}
          />
          <SettingsRow
            label="Wipe All Sessions"
            leftIcon={<Trash2 size={18} color="#FF3B30" />}
            onPress={handleWipeAll}
            destructive
            isLast
          />
        </View>

        {/* Appearance */}
        <Text style={styles.sectionHeader}>Appearance</Text>
        <View style={styles.sectionCard}>
          <SettingsRow
            label="Dark Mode"
            subtitle="Always on for privacy"
            leftIcon={<Moon size={18} color="#C9A84C" />}
            rightElement={
              <Switch
                value={darkModeOn}
                disabled
                trackColor={{ false: '#2A2A3A', true: 'rgba(201,168,76,0.5)' }}
                thumbColor={darkModeOn ? '#C9A84C' : '#8A8A9A'}
              />
            }
            isFirst
            isLast
          />
        </View>

        {/* About Beth */}
        <Text style={styles.sectionHeader}>About Beth</Text>
        <View style={styles.aboutCard}>
          <Image source={BETH_AVATAR} style={styles.aboutAvatar} contentFit="cover" />
          <Text style={styles.aboutName}>Beth</Text>
          <Text style={styles.aboutSubtitle}>Executive Counsel · AI-Powered</Text>
        </View>

        <View style={styles.sectionCard}>
          <SettingsRow
            label="Version"
            rightElement={<Text style={styles.versionText}>1.0.0</Text>}
            isFirst
          />
          <SettingsRow
            label="Privacy Policy"
            rightElement={<ChevronRight size={18} color="#8A8A9A" />}
            onPress={handlePrivacyPolicy}
          />
          <SettingsRow
            label="Terms of Service"
            rightElement={<ChevronRight size={18} color="#8A8A9A" />}
            onPress={handleTerms}
            isLast
          />
        </View>
      </ScrollView>
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
  headerSpacer: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  upgradeCard: {
    backgroundColor: 'rgba(201, 168, 76, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.4)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  upgradeText: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#C9A84C',
  },
  upgradeSubtitle: {
    fontSize: 12,
    color: '#8A8A9A',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A8A9A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#2A2A3A',
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: '#13131A',
  },
  rowFirst: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  rowLast: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  rowWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3A',
  },
  rowIcon: {
    width: 28,
    alignItems: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#8A8A9A',
    marginTop: 2,
    lineHeight: 16,
  },
  versionText: {
    fontSize: 14,
    color: '#8A8A9A',
  },
  aboutCard: {
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  aboutAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 12,
  },
  aboutName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#F5F0E8',
    marginBottom: 4,
  },
  aboutSubtitle: {
    fontSize: 13,
    color: '#8A8A9A',
  },
});
