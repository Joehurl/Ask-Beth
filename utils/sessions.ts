export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Session {
  id: string;
  date: Date;
  messages: Message[];
  durationSeconds: number;
  topic: string;
}

let sessions: Session[] = [
  {
    id: '1',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
    topic: 'Career transition',
    durationSeconds: 720,
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: "I'm thinking about leaving my VP role to start my own firm. Is this the right move?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        id: 'm2',
        role: 'assistant',
        content: "That's a significant decision. Let me ask you this — what does your gut tell you when you imagine yourself 6 months down that path?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 3000),
      },
    ],
  },
  {
    id: '2',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    topic: 'Board presentation prep',
    durationSeconds: 1080,
    messages: [
      {
        id: 'm3',
        role: 'user',
        content: "I have a board presentation next week and I'm not sure how to frame the Q3 results.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
      {
        id: 'm4',
        role: 'assistant',
        content: "Power moves quietly. The loudest person in the room rarely controls it. What's your read on the dynamics at play?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 3000),
      },
    ],
  },
  {
    id: '3',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48),
    topic: 'Negotiation strategy',
    durationSeconds: 540,
    messages: [
      {
        id: 'm5',
        role: 'user',
        content: "I need to negotiate a better equity package. How do I approach this without damaging the relationship?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      },
      {
        id: 'm6',
        role: 'assistant',
        content: "Strategic clarity comes from eliminating options, not adding them. What are you willing to walk away from?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48 + 3000),
      },
    ],
  },
  {
    id: '4',
    date: new Date(Date.now() - 1000 * 60 * 60 * 72),
    topic: 'Personal clarity',
    durationSeconds: 900,
    messages: [
      {
        id: 'm7',
        role: 'user',
        content: "I feel like I've lost my sense of direction. Everything is going well on paper but something feels off.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
      },
      {
        id: 'm8',
        role: 'assistant',
        content: "I hear you. And I want you to know — this room is completely private. Nothing leaves here. So tell me the real version.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72 + 3000),
      },
    ],
  },
];

export function getSessions(): Session[] {
  return [...sessions];
}

export function addSession(session: Session): void {
  console.log('[Sessions] Adding session:', session.id, 'topic:', session.topic);
  sessions.unshift(session);
}

export function clearSessions(): void {
  console.log('[Sessions] Clearing all sessions');
  sessions = [];
}
