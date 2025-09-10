
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

type ConfettiShape = "circle" | "star" | "heart" | "ribbon" | "triangle" | "diamond";
type ConfettiPiece = {
    id: number;
    x: number;
    y: number;
    rotation: number;
    color: string;
    shape: ConfettiShape;
    size: number;
    delay: number;
};

export function ConfettiButton({
    children = "Celebrate 🎉",
    onClick,
}: {
    children?: React.ReactNode;
    onClick?: () => void;
}) {
    const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
    const confettiColors = useMemo(() => [
        "#FF5733", "#FFC300", "#DAF7A6", "#33FF57", "#33FFF6", "#5733FF", "#FF33A8", "#FF33F6"
        ], []);
    const confettiShapes: ConfettiShape[] = ["circle", "star", "heart", "ribbon", "triangle", "diamond"];

    function generateConfetti(): ConfettiPiece[] {
        return Array.from({ length: 28 }).map((_, i) => {
            const angle = Math.random() * Math.PI * 2;
            const distance = 80 + Math.random() * 120;
            return {
                id: Date.now() + i,
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance - 80,
                rotation: Math.random() * 360,
                color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                shape: confettiShapes[Math.floor(Math.random() * confettiShapes.length)],
                size: 10 + Math.random() * 10,
                delay: Math.random() * 0.2,
            };
        });
    }

    function handleClick() {
        setConfetti(generateConfetti());
        // Vibrate for 200ms if supported
        if (typeof window !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate(200);
        }
        // Clear confetti after animation
        setTimeout(() => setConfetti([]), 1200);
        if (onClick) onClick();
    }

    return (
        <div className="relative inline-block">
            <Button
                onClick={handleClick}
                className="relative overflow-hidden transition-transform hover:scale-105"
                aria-label="Celebrate"
            >
                {children}
            </Button>

            {/* Confetti Layer */}
            <div className="absolute inset-0 pointer-events-none overflow-visible z-10">
                <AnimatePresence>
                    {confetti.map((piece) => (
                        <motion.div
                            key={piece.id}
                            initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
                            animate={{
                                opacity: 0,
                                x: piece.x,
                                y: piece.y,
                                rotate: piece.rotation,
                                scale: 0.8 + Math.random() * 0.6,
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 1.3 + Math.random() * 0.3,
                                ease: "easeOut",
                                delay: piece.delay,
                            }}
                            className="absolute left-1/2 top-1/2 drop-shadow-lg"
                            style={{ pointerEvents: "none" }}
                        >
                            {piece.shape === "circle" && (
                                <svg width={piece.size} height={piece.size} style={{ display: "block" }}>
                                    <circle cx={piece.size / 2} cy={piece.size / 2} r={piece.size / 2} fill={piece.color} />
                                </svg>
                            )}
                            {piece.shape === "star" && (
                                <svg width={piece.size + 2} height={piece.size + 2} viewBox="0 0 24 24" style={{ display: "block" }}>
                                    <polygon points="12,2 15,9 22,9.5 17,14.5 18.5,22 12,18 5.5,22 7,14.5 2,9.5 9,9" fill={piece.color} />
                                </svg>
                            )}
                            {piece.shape === "heart" && (
                                <svg width={piece.size + 2} height={piece.size + 2} viewBox="0 0 24 24" style={{ display: "block" }}>
                                    <path d="M12 21s-6.7-5.2-9.3-8.2C-1.2 8.2 2.2 3.5 7 5.1c2.1.7 3.2 2.6 5 2.6s2.9-1.9 5-2.6c4.8-1.6 8.2 3.1 4.3 7.7C18.7 15.8 12 21 12 21z" fill={piece.color} />
                                </svg>
                            )}
                            {piece.shape === "ribbon" && (
                                <svg width={piece.size + 2} height={piece.size + 2} viewBox="0 0 24 24" style={{ display: "block" }}>
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill={piece.color} />
                                </svg>
                            )}
                            {piece.shape === "triangle" && (
                                <svg width={piece.size + 2} height={piece.size + 2} viewBox="0 0 24 24" style={{ display: "block" }}>
                                    <polygon points="12,4 22,20 2,20" fill={piece.color} />
                                </svg>
                            )}
                            {piece.shape === "diamond" && (
                                <svg width={piece.size + 2} height={piece.size + 2} viewBox="0 0 24 24" style={{ display: "block" }}>
                                    <polygon points="12,2 22,12 12,22 2,12" fill={piece.color} />
                                </svg>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
