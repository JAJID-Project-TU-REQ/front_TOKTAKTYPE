"use client";
import React, { useState, useEffect, useRef, KeyboardEvent, ChangeEvent, use } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { generateWords } from './wordGenerator';
import { useSocket } from '../utils/socketContext';
import { useRouter } from 'next/navigation';
import {
    getStartTimestamp,
    getRoomIdByPlayerId,
    updatePlayerWpm,
    getPlayersWpm,
    leaveRoom
} from '../utils/socketClient';
import { get } from 'http';

// Type definitions
interface ResultsData {
    wpm: number;
    accuracy: number;
    mistakes: number;
    timeElapsed: number;
    seed: number;
}

interface CountdownTimerProps {
    timeLeft: number;
    isStarted: boolean;
    isFinished: boolean;
    onTimeExpired?: () => void;
}

// CountdownTimer Component
const CountdownTimer: React.FC<CountdownTimerProps> = ({
    timeLeft: initialTime,
    isStarted,
    isFinished,
    onTimeExpired
}) => {
    const [timeLeft, setTimeLeft] = useState<number>(initialTime);
    const timerRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {

        if (!isFinished) {
            setTimeLeft(initialTime);
        } else {
            setTimeLeft(0);
        }        if (isStarted && !isFinished && !startTimeRef.current) {
            startTimeRef.current = Math.floor(Date.now() / 1000);
        }

        if (timerRef.current) {
            cancelAnimationFrame(timerRef.current);
            timerRef.current = null;
        }

        if (isStarted && !isFinished && startTimeRef.current) {
            const updateCountdown = () => {
                const now = Math.floor(Date.now() / 1000);
                // Calculate time left based on startTime + total duration - current time
                const timeRemaining = startTimeRef.current + initialTime - now;

                if (timeRemaining <= 0) {
                    setTimeLeft(0);
                    if (onTimeExpired) {
                        onTimeExpired();
                    }
                    if (timerRef.current) {
                        cancelAnimationFrame(timerRef.current);
                        timerRef.current = null;
                    }
                    return;
                }

                setTimeLeft(timeRemaining);
                timerRef.current = requestAnimationFrame(updateCountdown);
            };

            timerRef.current = requestAnimationFrame(updateCountdown);
        }

        return () => {
            if (timerRef.current) {
                cancelAnimationFrame(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isStarted, isFinished, onTimeExpired, initialTime]);

    return (
        <div className="flex flex-col items-center justify-center h-40">
            <h2 className="text-2xl font-bold mb-4">เวลาที่เหลือ</h2>
            <div className="text-5xl font-bold">{timeLeft}</div>
        </div>
    );
};

// Pre-Game Countdown Component
const PreGameCountdown: React.FC<{
    startTimestamp: number | null;
    onCountdownComplete: () => void;
}> = ({ startTimestamp, onCountdownComplete }) => {
    const [countdown, setCountdown] = useState<number>(5);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (!startTimestamp) return;

        const updateCountdown = () => {
            const now = Math.floor(Date.now() / 1000);
            const timeUntilStart = startTimestamp + 5 - now; // 5 second countdown

            if (timeUntilStart <= 0) {
                setCountdown(0);
                onCountdownComplete();
                if (timerRef.current) {
                    cancelAnimationFrame(timerRef.current);
                    timerRef.current = null;
                }
                return;
            }

            setCountdown(timeUntilStart);
            timerRef.current = requestAnimationFrame(updateCountdown);
        };

        timerRef.current = requestAnimationFrame(updateCountdown);

        return () => {
            if (timerRef.current) {
                cancelAnimationFrame(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [startTimestamp, onCountdownComplete]);

    return (
        <div className="flex flex-col items-center justify-center h-40">
            <h2 className="text-2xl font-bold mb-4">เตรียมพร้อม!</h2>
            <div className="text-5xl font-bold">{countdown}</div>
        </div>
    );
};

// Main Type Component
const Type: React.FC = () => {
    // Router and params
    const searchParams = useSearchParams();
    const [roomCode, setRoomCode] = useState<string | null>(null);
    const [playerName, setPlayerName] = useState<string | null>(null);
    const [playersList, setPlayersList] = useState<{ name: string; wpm: number }[]>([]);
    const { socket } = useSocket();
    const router = useRouter();

    // Refs
    const inputRef = useRef<HTMLInputElement>(null);
    const textDisplayRef = useRef<HTMLDivElement>(null);

    // Game state
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isStarted, setIsStarted] = useState<boolean>(false);
    const [isPreGameCountdownComplete, setIsPreGameCountdownComplete] = useState<boolean>(false);
    const [isFinished, setIsFinished] = useState<boolean>(false);
    const [seed, setSeed] = useState<number>(Math.floor(Math.random() * 10000));
    const [timeLeft, setTimeLeft] = useState<number>(30);

    // Text and input state
    const [text, setText] = useState<string>('');
    const [formattedText, setFormattedText] = useState<string[][]>([]);
    const [userInput, setUserInput] = useState<string>('');
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
    const [visibleLines, setVisibleLines] = useState<number[]>([0, 1, 2, 3, 4]);
    const [longestLineWidth, setLongestLineWidth] = useState<number>(0);

    // Performance metrics
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [wpm, setWpm] = useState<number>(0);
    const [accuracy, setAccuracy] = useState<number>(100);
    const [mistakes, setMistakes] = useState<number>(0);
    const [startTimestamp, setStartTimestamp] = useState<number | null>(null);

    // Format text into lines with 8 words per line
    const formatTextIntoLines = (text: string): string[][] => {
        const words = text.split(' ');
        const lines: string[][] = [];

        for (let i = 0; i < words.length; i += 8) {
            const line = words.slice(i, i + 8);
            lines.push(line);
        }

        return lines;
    };

    // Find the longest line for layout purposes
    const calculateLongestLine = (lines: string[][]): void => {
        if (lines.length === 0) return;

        let maxLength = 0;
        for (const line of lines) {
            const lineLength = line.join(' ').length;
            if (lineLength > maxLength) {
                maxLength = lineLength;
            }
        }

        setLongestLineWidth(maxLength);
    };

    // Load words for the typing test
    useEffect(() => {
        async function loadWords() {
            setIsLoading(true);
            if (startTimestamp) {
                const seedValue = startTimestamp;
                setSeed(seedValue);
                const generatedText = await generateWords(seedValue, 300);
                setText(generatedText);
                const formatted = formatTextIntoLines(generatedText);
                setFormattedText(formatted);
                calculateLongestLine(formatted);
            }
            setIsLoading(false);
        }

        if (startTimestamp !== null) {
            loadWords();
        }
    }, [startTimestamp]);

    // Handle pre-game countdown completion
    const handlePreGameCountdownComplete = () => {
        setIsPreGameCountdownComplete(true);
        setIsStarted(true);
        setStartTime(Date.now());

        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Auto-focus input when loaded and countdown is complete
    useEffect(() => {
        if (!isLoading && isPreGameCountdownComplete && !isStarted) {
            if (inputRef.current) {
                inputRef.current.focus();
            }
            setIsStarted(true);
            setStartTime(Date.now());
        }
    }, [isLoading, isPreGameCountdownComplete, isStarted]);

    // Game started event listener
    useEffect(() => {
        const handleGameStarted = (event: CustomEvent) => {
            const data = event.detail;
            if (data && data.startTime) {
                setStartTime(data.startTime);
                setIsStarted(true);
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }
        };

        window.addEventListener('gameStarted', handleGameStarted as EventListener);
        return () => {
            window.removeEventListener('gameStarted', handleGameStarted as EventListener);
        };
    }, []);

    // Track current line for auto-scrolling
    useEffect(() => {
        if (formattedText.length > 0 && userInput.length > 0) {
            let charCount = 0;
            let foundLineIndex = 0;

            for (let i = 0; i < formattedText.length; i++) {
                const lineText = formattedText[i].join(' ');
                if (charCount + lineText.length + 1 > currentIndex) {
                    foundLineIndex = i;
                    break;
                }
                charCount += lineText.length + 1;
            }

            if (foundLineIndex !== currentLineIndex) {
                setCurrentLineIndex(foundLineIndex);

                // Show 5 lines centered around current line
                if (foundLineIndex > 2) {
                    setVisibleLines([
                        foundLineIndex - 2,
                        foundLineIndex - 1,
                        foundLineIndex,
                        foundLineIndex + 1,
                        foundLineIndex + 2
                    ]);
                }
            }
        }
    }, [currentIndex, formattedText, currentLineIndex]);

    // Socket connection and room info
    useEffect(() => {
        if (!socket) return;

        const playerId = localStorage.getItem("playerId");
        if (!playerId) return;
        setPlayerName(playerId);

        getRoomIdByPlayerId(socket, playerId, (roomId) => {
            if (roomId) {
                setRoomCode(roomId);
                getStartTimestamp(socket, roomId, (timestamp) => {
                    if (timestamp) {
                        setStartTimestamp(Math.floor(timestamp / 1000));
                    }
                });
            } else {
                router.push(`/`);
            }
        });

    }, [socket, router]);

    //รับและอัปเดต WPM ของผู้เล่น
    useEffect(() => {
        if (!socket) return;
        if (isFinished) return;

        const interval = setInterval(() => {
            updatePlayerWpm(socket, roomCode || '', playerName || '', wpm);

            getPlayersWpm(socket, roomCode || '', (playersWpm) => {
                if (playersWpm) {
                    setPlayersList(playersWpm);
                }
            });
        }, 100);


        return () => clearInterval(interval);
    }, [isFinished, playerName, roomCode, socket, wpm]);

    function leaveRoomButton() {
        const playerId = localStorage.getItem("playerId");
        if (!(socket && roomCode && playerId)) return;
        leaveRoom(socket, roomCode, playerId);
        getRoomIdByPlayerId(socket, playerId, (roomId) => {
            if (roomId) return;
            router.push(`/`);
            console.log("👤 Player left the room");
        });
    }

    // Game functions
    const handleTimeExpired = (): void => {
        setIsFinished(true);
        setEndTime(Date.now());

        if (roomCode) {
            sendGameResults(
                roomCode,
                wpm,
                accuracy,
                mistakes,
                60 // total time in seconds
            );
        }
    };

    const resetTest = (): void => {
        // Use current timestamp as new seed
        const newTimestamp = Math.floor(Date.now() / 1000);
        setStartTimestamp(newTimestamp);

        // Reset other states
        setUserInput('');
        setCurrentIndex(0);
        setCurrentLineIndex(0);
        setVisibleLines([0, 1, 2, 3, 4]);
        setStartTime(null);
        setEndTime(null);
        setWpm(0);
        setAccuracy(100);
        setMistakes(0);
        setIsFinished(false);
        setIsStarted(false);
        setIsPreGameCountdownComplete(false);
        setTimeLeft(0);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;

        if (!isFinished && isPreGameCountdownComplete) {
            setUserInput(value);

            let mistakeCount = 0;
            for (let i = 0; i < value.length; i++) {
                if (i < text.length && value[i] !== text[i]) {
                    mistakeCount++;
                }
            }
            setMistakes(mistakeCount);

            const calculatedAccuracy = value.length > 0
                ? ((value.length - mistakeCount) / value.length) * 100
                : 100;
            setAccuracy(Math.round(calculatedAccuracy));

            calculateWpm();

            if (value.length === text.length) {
                setEndTime(Date.now());
                setIsFinished(true);
            }

            setCurrentIndex(value.length);
        }
    };

    const calculateWpm = (): void => {
        if (startTime && userInput.length > 0) {
            const currentTime = Date.now();
            const timeInMinutes = (currentTime - startTime) / 60000;
            const words = userInput.trim().split(/\s+/).length;
            const calculatedWpm = Math.round(words / timeInMinutes);
            setWpm(calculatedWpm);

            if (roomCode) {
                updateWpm(roomCode, calculatedWpm);
            }
        } else {
            setWpm(0);
        }
    };

    const focusInput = (): void => {
        if (inputRef.current && !isFinished && isPreGameCountdownComplete) {
            inputRef.current.focus();
        }
    };

    const sendGameResults = (
        roomCode: string,
        wpm: number,
        accuracy: number,
        mistakes: number,
        timeElapsed: number
    ): void => {
        // TODO: Connect to Socket.IO to send results
        console.log('Sending game results to server:', {
            roomCode, wpm, accuracy, mistakes, timeElapsed
        });
    };

    const updateWpm = (socket: unknown, roomCode: string, p0: string, wpm: number): void => {
        // TODO: Connect to Socket.IO to update WPM
        console.log('Updating WPM on server:', { roomCode, wpm });
    };

    // Calculate character offset for text highlighting
    const calculateCharOffset = (lineIndex: number): number => {
        let offset = 0;
        for (let i = 0; i < lineIndex; i++) {
            offset += formattedText[i].join(' ').length + 1; // +1 for space between lines
        }
        return offset;
    };

    // Render the text display with correct/incorrect highlighting
    const renderText = (): React.ReactNode => {
        if (isLoading) {
            return <div className="text-gray-500">Loading words...</div>;
        }

        return (
            <div className="font-mono text-lg">
                <div className="flex flex-col">
                    {formattedText.map((line, lineIndex) => {
                        // Only render visible lines
                        if (!visibleLines.includes(lineIndex)) {
                            return null;
                        }

                        const lineText = line.join(' ');
                        const charOffset = calculateCharOffset(lineIndex);

                        return (
                            <div key={lineIndex} className="flex mb-2 flex-wrap">
                                {lineText.split('').map((char, charIndex) => {
                                    const globalIndex = charOffset + charIndex;
                                    let className = "relative";
                                    let content = char;

                                    if (globalIndex < userInput.length) {
                                        const isCorrect = userInput[globalIndex] === char;
                                        className += isCorrect ? " text-white-500" : " text-red-500 bg-red-100";
                                        content = userInput[globalIndex];
                                        if (userInput[globalIndex] === " " && char !== " ") {
                                            content = "_";
                                        }
                                    } else {
                                        className += " text-gray-400";
                                        if (globalIndex === currentIndex && !isFinished) {
                                            className += " border-l-2 border-gray-600 animate-pulse";
                                        }
                                    }

                                    return (
                                        <span
                                            key={charIndex}
                                            className={className}
                                            style={{ width: char === " " ? "0.5em" : "auto" }}
                                        >
                                            {content}
                                        </span>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Get final results data
    const getResults = (): ResultsData | null => {
        if (!startTime || !endTime) return null;

        return {
            wpm,
            accuracy,
            mistakes,
            timeElapsed: (endTime - startTime) / 1000,
            seed: startTimestamp || 0
        };
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[url('/try.svg')] bg-cover bg-center">
            <div
                className="w-full max-w-4xl mx-auto p-2 sm:p-4 rounded-lg shadow-lg bg-white"
                onClick={focusInput}
            >
                <div className="bg-gray-100 rounded-lg p-4 mb-4 text-black shadow">
                    <h2 className="text-lg font-bold mb-3 text-center">Player Rankings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
                        {playersList
                            .sort((a, b) => b.wpm - a.wpm) // Sort players by WPM in descending order
                            .map((player, index) => (
                                <div key={index} className="bg-white rounded-lg p-3 shadow">
                                    <div className="text-base font-semibold">
                                        <span className="text-xl mr-2">
                                            {index + 1 === 1 ? '1️⃣' : index + 1 === 2 ? '2️⃣' : index + 1 === 3 ? '3️⃣' : index + 1 === 4 ? '4️⃣' : `${index + 1}️⃣`}
                                        </span>
                                        {player.name}
                                    </div>
                                    <div className="text-sm text-gray-600">WPM: {player.wpm}</div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Logo */}
                <h1 className="text-xl sm:text-2xl font-bold text-center mb-2 flex justify-center">
                    <Image src="/logo.png" width={200} height={100} alt="Logo" />
                </h1>

                {/* Pre-game countdown or game timer */}
                {!isPreGameCountdownComplete && startTimestamp ? (
                    <PreGameCountdown
                        startTimestamp={startTimestamp}
                        onCountdownComplete={handlePreGameCountdownComplete}
                    />
                ) : (
                    <CountdownTimer
                        timeLeft={timeLeft}
                        isStarted={isStarted}
                        isFinished={isFinished}
                        onTimeExpired={handleTimeExpired}
                    />
                )}

                {/* Seed info */}
                <div className="mb-2 text-sm">
                    <span>Current Seed: {seed}</span>
                </div>

                {/* Text display area */}
                <div
                    className="mb-4 sm:mb-8"
                    onClick={focusInput}
                >
                    <div
                        ref={textDisplayRef}
                        className="p-4 sm:p-6 rounded-lg shadow mb-4 min-h-40 h-auto max-h-64 overflow-y-auto flex items-start cursor-text"
                        style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}
                    >
                        {!isPreGameCountdownComplete ? (
                            <div className="w-full text-center text-gray-400">
                                Get ready to start typing...
                            </div>
                        ) : (
                            renderText()
                        )}
                    </div>

                    {/* Hidden input field */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={handleChange}
                        disabled={isFinished || isLoading || !isPreGameCountdownComplete}
                        className="p-2 border-2 border-gray-300 rounded text-lg font-mono focus:outline-none focus:border-blue-500 opacity-0 absolute"
                        autoFocus
                    />
                </div>

                {/* Stats display */}
                <div className="flex justify-center gap-4 sm:gap-20 mb-4 mt-2 flex-wrap">
                    <div className="text-base sm:text-lg font-semibold rounded-lg p-2">
                        🎮 WPM: {wpm}
                    </div>
                    <div className="text-base sm:text-lg font-semibold rounded-lg p-2">
                        ♥️ Accuracy: {accuracy}%
                    </div>
                </div>

                {isFinished && (
                    <div className="mb-4 p-2 sm:p-4 rounded-lg bg-gray-100 text-black">
                        <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Results</h2>
                        <p className="text-sm sm:text-base">WPM: {wpm}</p>
                        <p className="text-sm sm:text-base">Accuracy: {accuracy}%</p>
                        <p className="text-sm sm:text-base">Mistakes: {mistakes}</p>
                        <p className="text-sm sm:text-base">Seed: {seed}</p>
                    </div>
                )}
                <button
                    onClick={leaveRoomButton}
                    className="mt-4 w-full bg-red-800 text-white p-2 rounded-lg hover:bg-red-600"
                >
                    Back to Main Menu
                </button>
            </div>
        </div>
    );
};

export default Type;