/**
 * Paywall Screen — Ask Beth
 *
 * Dark-themed paywall matching the app's black/gold aesthetic.
 * Shows Beth's branding and subscription options.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
  ImageSourcePropType,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { PurchasesPackage } from "react-native-purchases";
import { LinearGradient } from "expo-linear-gradient";

import { useSubscription } from "@/contexts/SubscriptionContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function resolveImageSource(
  source: string | number | ImageSourcePropType | undefined
): ImageSourcePropType {
  if (!source) return { uri: "" };
  if (typeof source === "string") return { uri: source };
  return source as ImageSourcePropType;
}

const BETH_LOGO = require("../assets/images/f8290115-19d6-440b-b69a-ffb7d6ee90ef.jpeg");

const COLORS = {
  background: "#0A0A0F",
  card: "#13131A",
  border: "#2A2A3A",
  gold: "#C9A84C",
  goldLight: "#E0BC5A",
  goldDim: "rgba(201, 168, 76, 0.15)",
  goldBorder: "rgba(201, 168, 76, 0.3)",
  textPrimary: "#F5F0E8",
  textSecondary: "#8A8A9A",
  textDim: "rgba(245, 240, 232, 0.6)",
};

const FEATURES = [
  {
    icon: "✦",
    title: "Unlimited Beth Access",
    description: "Chat with Beth as much as you want, anytime",
  },
  {
    icon: "⚡",
    title: "Priority Responses",
    description: "Get faster, more detailed answers from Beth",
  },
  {
    icon: "📜",
    title: "Full Chat History",
    description: "Access your complete conversation history",
  },
  {
    icon: "🔒",
    title: "Private & Secure",
    description: "Your conversations stay private and encrypted",
  },
];

export default function PaywallScreen() {
  const router = useRouter();

  const {
    packages,
    loading,
    isSubscribed,
    isWeb,
    purchasePackage,
    restorePurchases,
    mockWebPurchase,
    mockNativePurchase,
  } = useSubscription();

  const [selectedPackage, setSelectedPackage] =
    useState<PurchasesPackage | null>(packages[0] || null);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [webMockState, setWebMockState] = useState<"idle" | "processing">("idle");
  const [webMockDialogState, setWebMockDialogState] = useState<
    "hidden" | "selecting" | "failed"
  >("hidden");

  React.useEffect(() => {
    if (packages.length > 0 && !selectedPackage) {
      setSelectedPackage(packages[0]);
    }
  }, [packages, selectedPackage]);

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    console.log("[Paywall] Subscribe button pressed, package:", selectedPackage.identifier);
    try {
      setPurchasing(true);
      const success = await purchasePackage(selectedPackage);
      if (success) {
        console.log("[Paywall] Purchase successful, navigating to home");
        Alert.alert("Welcome to Beth Pro!", "You now have unlimited access.", [
          { text: "Let's go", onPress: () => router.replace("/(tabs)/(home)") },
        ]);
      }
    } catch (error: any) {
      console.log("[Paywall] Purchase failed:", error.message);
      Alert.alert("Purchase Failed", error.message || "Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    console.log("[Paywall] Restore Purchases pressed");
    try {
      setRestoring(true);
      const restored = await restorePurchases();
      if (restored) {
        console.log("[Paywall] Restore successful");
        Alert.alert("Restored!", "Your subscription has been restored.", [
          { text: "OK", onPress: () => router.replace("/(tabs)/(home)") },
        ]);
      } else {
        console.log("[Paywall] No purchases found to restore");
        Alert.alert(
          "No Purchases Found",
          "We couldn't find any previous purchases."
        );
      }
    } catch (error: any) {
      console.log("[Paywall] Restore failed:", error.message);
      Alert.alert("Restore Failed", error.message || "Please try again.");
    } finally {
      setRestoring(false);
    }
  };

  const handleClose = () => {
    console.log("[Paywall] Close/continue pressed");
    router.replace("/(tabs)/(home)");
  };

  const handleWebMockPurchase = async () => {
    if (!selectedPackage) return;
    console.log("[Paywall] Web mock purchase initiated");
    setWebMockState("processing");
    await new Promise((resolve) => setTimeout(resolve, 400));
    setWebMockState("idle");
    setWebMockDialogState("selecting");
  };

  const handlePackageSelect = (pkg: PurchasesPackage) => {
    console.log("[Paywall] Package selected:", pkg.identifier);
    setSelectedPackage(pkg);
  };

  // Already subscribed
  if (isSubscribed) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.subscribedContent}>
            <View style={styles.logoRing}>
              <Image
                source={resolveImageSource(BETH_LOGO)}
                style={styles.logoImage}
                contentFit="cover"
              />
            </View>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO MEMBER</Text>
            </View>
            <Text style={styles.subscribedTitle}>You're All Set</Text>
            <Text style={styles.subscribedSubtitle}>
              You have unlimited access to Beth
            </Text>
            <View style={styles.featuresCard}>
              {FEATURES.slice(0, 3).map((feature, index) => {
                const featureKey = `feature-${index}`;
                return (
                  <View key={featureKey} style={styles.featureCheckRow}>
                    <View style={styles.checkCircle}>
                      <Text style={styles.checkMark}>✓</Text>
                    </View>
                    <Text style={styles.featureCheckText}>{feature.title}</Text>
                  </View>
                );
              })}
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={handleClose}>
              <Text style={styles.primaryButtonText}>Start Chatting</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
          <View style={styles.centeredContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const subscribeLabel = selectedPackage
    ? selectedPackage.product.priceString
      ? `Subscribe for ${selectedPackage.product.priceString}`
      : "Subscribe"
    : "Select a plan";

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
            {/* Subtle gold glow behind logo */}
            <View style={styles.logoGlow} />
            <View style={styles.logoRing}>
              <Image
                source={resolveImageSource(BETH_LOGO)}
                style={styles.logoImage}
                contentFit="cover"
              />
            </View>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>BETH PRO</Text>
            </View>
            <Text style={styles.title}>Unlock Unlimited Access</Text>
            <Text style={styles.subtitle}>
              Get unrestricted access to Beth — your personal executive counsel
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Features */}
          <View style={styles.featuresCard}>
            <Text style={styles.featuresCardTitle}>What You'll Get</Text>
            {FEATURES.map((feature, index) => {
              const featureKey = `feat-${index}`;
              return (
                <View key={featureKey} style={styles.featureRow}>
                  <View style={styles.featureIconWrap}>
                    <Text style={styles.featureIconText}>{feature.icon}</Text>
                  </View>
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Package Selection */}
          {packages.length > 0 && (
            <View style={styles.packagesContainer}>
              {packages.map((pkg) => {
                const isSelected =
                  selectedPackage?.identifier === pkg.identifier;
                return (
                  <TouchableOpacity
                    key={pkg.identifier}
                    style={[
                      styles.packageCard,
                      isSelected && styles.packageCardSelected,
                    ]}
                    onPress={() => handlePackageSelect(pkg)}
                    activeOpacity={0.8}
                  >
                    {isSelected && <View style={styles.selectedTopBar} />}
                    <View style={styles.packageHeader}>
                      <Text style={styles.packageTitle}>
                        {pkg.product.title}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkmarkCircle}>
                          <Text style={styles.checkmark}>✓</Text>
                        </View>
                      )}
                    </View>
                    {pkg.product.priceString ? (
                      <Text style={styles.packagePrice}>
                        {pkg.product.priceString}
                      </Text>
                    ) : null}
                    {pkg.product.description ? (
                      <Text style={styles.packageDescription}>
                        {pkg.product.description}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* No packages — Expo Go notice */}
          {!isWeb && packages.length === 0 && !loading && (
            <View style={styles.noPackagesContainer}>
              <Text style={styles.noPackagesText}>
                Purchases are not available in standard Expo Go.
              </Text>
              <Text style={[styles.noPackagesText, { marginTop: 8, opacity: 0.6 }]}>
                Use a development or production build to test purchases.
              </Text>
              {__DEV__ && (
                <TouchableOpacity
                  style={styles.devMockButton}
                  onPress={async () => {
                    console.log("[Paywall] Dev: Simulate Purchase pressed");
                    await mockNativePurchase();
                    router.replace("/(tabs)/(home)");
                  }}
                >
                  <Text style={styles.devMockButtonText}>
                    Dev: Simulate Purchase
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomActions}>
          {isWeb ? (
            <>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!selectedPackage || webMockState === "processing") &&
                    styles.buttonDisabled,
                ]}
                onPress={handleWebMockPurchase}
                disabled={!selectedPackage || webMockState === "processing"}
                activeOpacity={0.85}
              >
                {webMockState === "processing" ? (
                  <ActivityIndicator color={COLORS.background} />
                ) : (
                  <Text style={styles.primaryButtonText}>{subscribeLabel}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.restoreButton}
                onPress={handleRestore}
                disabled={restoring}
              >
                {restoring ? (
                  <ActivityIndicator size="small" color={COLORS.gold} />
                ) : (
                  <Text style={styles.restoreButtonText}>Restore Purchases</Text>
                )}
              </TouchableOpacity>
              <Text style={styles.legalText}>
                Preview mode — purchases available in the mobile app
              </Text>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!selectedPackage || purchasing) && styles.buttonDisabled,
                ]}
                onPress={handlePurchase}
                disabled={!selectedPackage || purchasing}
                activeOpacity={0.85}
              >
                {purchasing ? (
                  <ActivityIndicator color={COLORS.background} />
                ) : (
                  <Text style={styles.primaryButtonText}>{subscribeLabel}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.restoreButton}
                onPress={handleRestore}
                disabled={restoring}
              >
                {restoring ? (
                  <ActivityIndicator size="small" color={COLORS.gold} />
                ) : (
                  <Text style={styles.restoreButtonText}>Restore Purchases</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.legalText}>
                Payment will be charged to your{" "}
                {Platform.OS === "ios" ? "Apple ID" : "Google Play"} account.
                Subscription automatically renews unless canceled at least 24
                hours before the end of the current period.
              </Text>
            </>
          )}
        </View>
      </SafeAreaView>

      {/* Web mock dialog */}
      {isWeb && webMockDialogState !== "hidden" && (
        <View style={styles.webDialogOverlay}>
          <View style={styles.webDialogBox}>
            {webMockDialogState === "selecting" && (
              <>
                <Text style={styles.webDialogTitle}>Test Purchase</Text>
                <Text style={styles.webDialogBody}>
                  {`⚠️ This is a test purchase for development only.\n\nPackage: ${selectedPackage?.identifier}\nPrice: ${selectedPackage?.product.priceString || "N/A"}`}
                </Text>
                <View style={styles.webDialogDivider} />
                <TouchableOpacity
                  style={styles.webDialogButton}
                  onPress={() => setWebMockDialogState("failed")}
                >
                  <Text style={[styles.webDialogButtonText, { color: "#FF3B30" }]}>
                    Test Failed Purchase
                  </Text>
                </TouchableOpacity>
                <View style={styles.webDialogDivider} />
                <TouchableOpacity
                  style={styles.webDialogButton}
                  onPress={() => {
                    console.log("[Paywall] Web mock: valid purchase confirmed");
                    setWebMockDialogState("hidden");
                    mockWebPurchase();
                    router.replace("/(tabs)/(home)");
                  }}
                >
                  <Text style={[styles.webDialogButtonText, { color: COLORS.gold }]}>
                    Test Valid Purchase
                  </Text>
                </TouchableOpacity>
                <View style={styles.webDialogDivider} />
                <TouchableOpacity
                  style={styles.webDialogButton}
                  onPress={() => setWebMockDialogState("hidden")}
                >
                  <Text style={[styles.webDialogButtonText, { color: COLORS.textSecondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </>
            )}
            {webMockDialogState === "failed" && (
              <>
                <Text style={styles.webDialogTitle}>Purchase Failed</Text>
                <Text style={styles.webDialogBody}>
                  Test purchase failure — no real transaction occurred.
                </Text>
                <View style={styles.webDialogDivider} />
                <TouchableOpacity
                  style={styles.webDialogButton}
                  onPress={() => setWebMockDialogState("hidden")}
                >
                  <Text style={[styles.webDialogButtonText, { color: COLORS.gold }]}>
                    OK
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },

  // Hero
  hero: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(201, 168, 76, 0.12)",
    top: -10,
  },
  logoRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.gold,
    overflow: "hidden",
    marginBottom: 16,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  proBadge: {
    backgroundColor: COLORS.goldDim,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 14,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.gold,
    letterSpacing: 1.8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: SCREEN_WIDTH * 0.8,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 24,
  },

  // Features card
  featuresCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featuresCardTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.goldDim,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  featureIconText: {
    fontSize: 18,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  featureDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },

  // Packages
  packagesContainer: {
    gap: 10,
    marginBottom: 8,
  },
  packageCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    overflow: "hidden",
  },
  packageCardSelected: {
    borderColor: COLORS.gold,
    borderWidth: 1.5,
    backgroundColor: "rgba(201, 168, 76, 0.06)",
  },
  selectedTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.gold,
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  checkmarkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.gold,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    fontSize: 12,
    color: COLORS.background,
    fontWeight: "bold",
  },
  packagePrice: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.gold,
    marginTop: 6,
  },
  packageDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },

  // No packages
  noPackagesContainer: {
    padding: 20,
    alignItems: "center",
  },
  noPackagesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  devMockButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    borderStyle: "dashed",
    alignItems: "center",
  },
  devMockButtonText: {
    color: COLORS.gold,
    fontSize: 13,
  },

  // Bottom actions
  bottomActions: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  primaryButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    color: COLORS.background,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  restoreButton: {
    paddingVertical: 10,
    alignItems: "center",
  },
  restoreButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  legalText: {
    fontSize: 11,
    color: "rgba(138, 138, 154, 0.7)",
    textAlign: "center",
    lineHeight: 16,
  },

  // Subscribed state
  subscribedContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  subscribedTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  subscribedSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  featureCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    width: "100%",
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.goldDim,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkMark: {
    fontSize: 13,
    color: COLORS.gold,
    fontWeight: "bold",
  },
  featureCheckText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },

  // Web mock dialog
  webDialogOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  webDialogBox: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    width: "85%",
    maxWidth: 400,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  webDialogTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 4,
  },
  webDialogBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingHorizontal: 16,
    paddingBottom: 20,
    lineHeight: 18,
  },
  webDialogDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  webDialogButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  webDialogButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
