export interface OnboardingOption {
  id: string;
  emoji: string;
  label: string;
}

export interface OnboardingQuestion {
  id: string;
  title: string;
  subtitle: string;
  options: OnboardingOption[];
}

export const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: "advice_topic",
    title: "What do you most want advice on?",
    subtitle: "Beth will focus on what matters to you",
    options: [
      { id: "dating", emoji: "💕", label: "Dating & attraction" },
      { id: "relationship", emoji: "💑", label: "My relationship" },
      { id: "career", emoji: "💼", label: "Career & ambition" },
      { id: "money", emoji: "💰", label: "Money & finances" },
      { id: "confidence", emoji: "✨", label: "Confidence & self-worth" },
    ],
  },
  {
    id: "relationship_status",
    title: "What's your current situation?",
    subtitle: "No judgment — Beth has heard it all",
    options: [
      { id: "single", emoji: "🙋", label: "Single & looking" },
      { id: "dating", emoji: "🌹", label: "Dating someone" },
      { id: "committed", emoji: "💍", label: "In a committed relationship" },
      { id: "complicated", emoji: "🤔", label: "It's complicated" },
      { id: "focused", emoji: "🎯", label: "Focused on myself right now" },
    ],
  },
  {
    id: "biggest_challenge",
    title: "What's your biggest challenge?",
    subtitle: "Be honest — this helps Beth give real advice",
    options: [
      { id: "communication", emoji: "🗣️", label: "Communication with others" },
      { id: "boundaries", emoji: "🚧", label: "Setting boundaries" },
      { id: "decisions", emoji: "⚖️", label: "Making big decisions" },
      { id: "confidence", emoji: "💪", label: "Believing in myself" },
      { id: "patterns", emoji: "🔄", label: "Breaking old patterns" },
    ],
  },
  {
    id: "source",
    title: "How did you find Beth?",
    subtitle: "We'd love to know what brought you here",
    options: [
      { id: "social", emoji: "📱", label: "Social media" },
      { id: "friend", emoji: "👫", label: "Friend or family" },
      { id: "appstore", emoji: "🏠", label: "App Store" },
      { id: "search", emoji: "🔍", label: "Online search" },
    ],
  },
];
