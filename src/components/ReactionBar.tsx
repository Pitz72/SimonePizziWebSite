import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';

export type ReactionKey = 'thumb' | 'heart' | 'fire' | 'think' | 'game';

export interface ReactionData {
    counts: Record<ReactionKey, number>;
    my_reactions: ReactionKey[];
}

interface ReactionBarProps {
    articleId: number;
    initialData: ReactionData;
}

const ReactionIcons: Record<ReactionKey, React.FC<{ active: boolean }>> = {
    thumb: ({ active }) => (
        <svg viewBox="0 0 24 24" width="20" height="20" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 10v12" /><path d="M15 5.88L14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3" />
            <path d="M7 10a5 5 0 0 0 5-5V3a1 1 0 0 1 1-1h.54a1 1 0 0 1 .95.68L15 5.88" />
        </svg>
    ),
    heart: ({ active }) => (
        <svg viewBox="0 0 24 24" width="20" height="20" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    ),
    fire: ({ active }) => (
        <svg viewBox="0 0 24 24" width="20" height="20" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
    ),
    think: ({ active }) => (
        <svg viewBox="0 0 24 24" width="20" height="20" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><circle cx="12" cy="12" r="10" /><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
        </svg>
    ),
    game: ({ active }) => (
        <svg viewBox="0 0 24 24" width="20" height="20" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="6" y1="12" x2="10" y2="12" /><line x1="8" y1="10" x2="8" y2="14" />
            <line x1="15" y1="13" x2="15.01" y2="13" strokeWidth="2.5" /><line x1="18" y1="11" x2="18.01" y2="11" strokeWidth="2.5" />
            <rect x="2" y="6" width="20" height="12" rx="2" />
        </svg>
    ),
};

const REACTION_LABELS: Record<ReactionKey, string> = {
    thumb: 'Utile', heart: 'Bello', fire: 'Interessante', think: 'Fa pensare', game: 'Game-related',
};

const REACTION_ORDER: ReactionKey[] = ['thumb', 'heart', 'fire', 'think', 'game'];

const ReactionBar: React.FC<ReactionBarProps> = ({ articleId, initialData }) => {
    const [counts, setCounts] = useState<Record<ReactionKey, number>>(initialData.counts as Record<ReactionKey, number>);
    const [myReactions, setMyReactions] = useState<ReactionKey[]>(initialData.my_reactions as ReactionKey[]);
    const [loading, setLoading] = useState<ReactionKey | null>(null);
    const [tooltip, setTooltip] = useState<ReactionKey | null>(null);

    const handleToggle = async (reaction: ReactionKey) => {
        if (loading) return;
        setLoading(reaction);

        const prevCounts = { ...counts };
        const prevMyReactions = [...myReactions];

        const wasActive = myReactions.includes(reaction);
        const newCount = wasActive ? Math.max(0, (counts[reaction] ?? 0) - 1) : (counts[reaction] ?? 0) + 1;

        setCounts(prev => ({ ...prev, [reaction]: newCount }));
        setMyReactions(prev => wasActive ? prev.filter(r => r !== reaction) : [...prev, reaction]);

        try {
            const result = await api.toggleReaction(articleId, reaction);
            setCounts(result.counts as Record<ReactionKey, number>);
            setMyReactions(result.my_reactions as ReactionKey[]);
        } catch {
            setCounts(prevCounts);
            setMyReactions(prevMyReactions);
        } finally {
            setLoading(null);
        }
    };

    const totalReactions = Object.values(counts).reduce((a, b) => a + b, 0);

    return (
        <div className="py-8" style={{ borderTop: '1px solid rgba(34,197,94,0.12)' }}>
            <div className="flex items-center gap-3 mb-5">
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: '#6a9070' }}>
                    Cosa ne pensi?
                </span>
                {totalReactions > 0 && (
                    <span className="font-mono text-[10px]" style={{ color: '#3a5540' }}>
                        {totalReactions} {totalReactions === 1 ? 'reazione' : 'reazioni'}
                    </span>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {REACTION_ORDER.map((reaction) => {
                    const isActive = myReactions.includes(reaction);
                    const isLoadingThis = loading === reaction;
                    const count = counts[reaction] ?? 0;
                    const Icon = ReactionIcons[reaction];

                    return (
                        <div key={reaction} className="relative">
                            {/* Tooltip */}
                            <AnimatePresence>
                                {tooltip === reaction && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 4 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 font-mono text-[9px] tracking-widest uppercase pointer-events-none z-10"
                                        style={{
                                            background: '#0c1410',
                                            border: '1px solid rgba(34,197,94,0.2)',
                                            color: '#d4e8d8',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {REACTION_LABELS[reaction]}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                whileTap={{ scale: 0.88 }}
                                onClick={() => handleToggle(reaction)}
                                onMouseEnter={e => {
                                    setTooltip(reaction);
                                    if (!isActive) {
                                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(34,197,94,0.35)';
                                        (e.currentTarget as HTMLButtonElement).style.color = '#d4e8d8';
                                    }
                                }}
                                onMouseLeave={e => {
                                    setTooltip(null);
                                    if (!isActive) {
                                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(34,197,94,0.12)';
                                        (e.currentTarget as HTMLButtonElement).style.color = '#6a9070';
                                    }
                                }}
                                disabled={isLoadingThis}
                                aria-label={`${REACTION_LABELS[reaction]}${count > 0 ? ` (${count})` : ''}`}
                                aria-pressed={isActive}
                                className="flex items-center gap-1.5 px-3 py-2 transition-all duration-200 min-w-[44px] min-h-[44px] justify-center"
                                style={{
                                    border: `1px solid ${isActive ? 'rgba(34,197,94,0.5)' : 'rgba(34,197,94,0.12)'}`,
                                    background: isActive ? 'rgba(34,197,94,0.1)' : 'rgba(12,20,16,0.6)',
                                    color: isActive ? '#22c55e' : '#6a9070',
                                    opacity: isLoadingThis ? 0.6 : 1,
                                }}
                            >
                                <motion.span
                                    animate={isActive && !isLoadingThis ? { rotate: [0, -10, 10, 0] } : {}}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Icon active={isActive} />
                                </motion.span>
                                <AnimatePresence mode="wait">
                                    {count > 0 && (
                                        <motion.span
                                            key={count}
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 6 }}
                                            transition={{ duration: 0.2 }}
                                            className="font-mono text-[11px] font-bold tabular-nums"
                                        >
                                            {count}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReactionBar;
