"use client";
import React, { useState, useEffect, useRef, KeyboardEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { generateWords } from './wordGenerator';
import { useSocket } from '../utils/socketContext';
import { useRouter } from 'next/router';
import { getStartTimestamp, getRoomIdByPlayerId } from '../utils/socketClient';
import { get } from 'http';

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

const CountdownTimer: React.FC<CountdownTimerProps> = ({
    timeLeft: initialTime,
    isStarted,
    isFinished,
    onTimeExpired
}) => {
    const [timeLeft, setTimeLeft] = useState<number>(initialTime);
    const timerRef = useRef<number | null>(null);
    const lastUpdateTimeRef = useRef<number>(Date.now());

    useEffect(() => {
        // Update local timeLeft when the prop changes
        setTimeLeft(initialTime);
    }, [initialTime]);

    useEffect(() => {
        // Clear any existing animation frame
        if (timerRef.current) {
            cancelAnimationFrame(timerRef.current);
            timerRef.current = null;
        }

        // Start the timer when the game starts
        if (isStarted && !isFinished && timeLeft > 0) {
            // Use requestAnimationFrame for smoother updates
            const updateTimer = () => {
                const now = Date.now();
                const deltaTime = now - lastUpdateTimeRef.current;

                // Update every second (1000ms)
                if (deltaTime >= 1000) {
                    lastUpdateTimeRef.current = now - (deltaTime % 1000); // Adjust for drift

                    setTimeLeft((prevTime) => {
                        const newTime = prevTime - 1;

                        if (newTime <= 0) {
                            // Stop the animation when time is up
                            if (onTimeExpired) {
                                onTimeExpired();
                            }
                            return 0;
                        }

                        return newTime;
                    });
                }

                timerRef.current = requestAnimationFrame(updateTimer);
            };

            // Start the animation loop
            timerRef.current = requestAnimationFrame(updateTimer);
        }

        // Cleanup function
        return () => {
            if (timerRef.current) {
                cancelAnimationFrame(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isStarted, isFinished, onTimeExpired, timeLeft]);

    return (
        <div style={{ textAlign: 'center', fontSize: '2rem' }}>
            <p>นับถอยหลัง: {timeLeft} วินาที</p>
        </div>
    );
};

const Type: React.FC = () => {
    const searchParams = useSearchParams();
    const roomCode = searchParams.get("roomCode");
    const playerName = searchParams.get("playerName");
    const { socket } = useSocket();
    const router = useRouter();

    const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
    const [text, setText] = useState<string>('');
    const [formattedText, setFormattedText] = useState<string[][]>([]);
    const [userInput, setUserInput] = useState<string>('');
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
    const [visibleLines, setVisibleLines] = useState<number[]>([0, 1, 2, 3, 4]);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [wpm, setWpm] = useState<number>(0);
    const [accuracy, setAccuracy] = useState<number>(100);
    const [mistakes, setMistakes] = useState<number>(0);
    const [isFinished, setIsFinished] = useState<boolean>(false);
    const [isStarted, setIsStarted] = useState<boolean>(false);
    const [delayTime] = useState<number>(5);
    const [timeLeft, setTimeLeft] = useState<number>(60);
    const [seed, setSeed] = useState<number>(Math.floor(Math.random() * 10000));
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [longestLineWidth, setLongestLineWidth] = useState<number>(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const textDisplayRef = useRef<HTMLDivElement>(null);

    // ทำให้โชว์8คำต่อบบรทัด
    const formatTextIntoLines = (text: string): string[][] => {
        const words = text.split(' ');
        const lines: string[][] = [];

        for (let i = 0; i < words.length; i += 8) {
            const line = words.slice(i, i + 8);
            lines.push(line);
        }

        return lines;
    };

    useEffect(() => {
        async function loadWords() {
            setIsLoading(true);
            const generatedText = await generateWords(seed, 300);
            setText(generatedText);
            const formatted = formatTextIntoLines(generatedText);
            setFormattedText(formatted);

            calculateLongestLine(formatted);

            setIsLoading(false);
        }
        loadWords();
    }, [seed]);

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

    useEffect(() => {
        if (!isLoading && !isStarted) {
            if (inputRef.current) {
                inputRef.current.focus();
            }

            setIsStarted(true);
            setStartTime(Date.now());
        }
    }, [isLoading, isStarted]);

    useEffect(() => {
        const handleGameStarted = (event: CustomEvent) => {
            const data = event.detail;
            console.log('Game started with data:', data);

            if (data && data.startTime) {
                setStartTime(data.startTime);
                setIsStarted(true);
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }
        };

        // เพิ่ม event listener เริ่ม
        window.addEventListener('gameStarted', handleGameStarted as EventListener);

        return () => {
            window.removeEventListener('gameStarted', handleGameStarted as EventListener);
        };
    }, []);

    // เลื่อนบรรทัดให้อยู่กับอันที่ทำอยู่
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

                // ให้เห็นแค่ 5 บรรทัดล่าสุด
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

    useEffect(() => {
        if (!socket) return;

        const playerId = localStorage.getItem("playerId");
        if (!playerId) return;
        getRoomIdByPlayerId(socket, playerId, (roomId) => {
            if (roomId) {
                console.log("📦 Room ID:", roomId);
                getStartTimestamp(socket, roomId, (timestamp) => {
                    if (timestamp) {
                        setStartTimestamp(timestamp / 1000);
                    }
                });

            } else {
                router.push(`/`);
                console.log("👤 Player not in a room");
            }
        });


    }, [socket]);

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
        const nextSeed = Math.floor(Math.random() * 10000);
        setSeed(nextSeed);

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
        setTimeLeft(60);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;

        if (!isFinished) {
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

            // ส่ง WPM ไป server ด้วย Socket.IO
            if (roomCode) {
                updateWpm(roomCode, calculatedWpm);
            }
        } else {
            setWpm(0);
        }
    };

    const focusInput = (): void => {
        if (inputRef.current && !isFinished) {
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
        console.log('Sending game results to server:', {
            roomCode, wpm, accuracy, mistakes, timeElapsed
        });
    };

    const updateWpm = (roomCode: string, wpm: number): void => {
        //ต้องเอาไปเชื่อมต่อกับ Socket.IO ก่อน
        console.log('Updating WPM on server:', { roomCode, wpm });
    };

    const renderText = (): React.ReactNode => {
        if (isLoading) {
            return <div className="text-gray-500">Loading words...</div>;
        }

        // Determine character offset for highlighting
        const calculateCharOffset = (lineIndex: number): number => {
            let offset = 0;
            for (let i = 0; i < lineIndex; i++) {
                offset += formattedText[i].join(' ').length + 1; // +1 for space between lines
            }
            return offset;
        };

        return (
            <div className="font-mono text-lg">
                <div className="flex flex-col">
                    {formattedText.map((line, lineIndex) => {
                        // Only render the line if it's in the visible lines array
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
                                        <span key={charIndex} className={className} style={{ width: char === " " ? "0.5em" : "auto" }}>
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

    const getResults = (): ResultsData | null => {
        if (!startTime || !endTime) return null;

        return {
            wpm,
            accuracy,
            mistakes,
            timeElapsed: (endTime - startTime) / 1000,
            seed
        };
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[url('/try.svg')] bg-cover bg-center">
            <div className="w-full max-w-4xl mx-auto p-2 sm:p-4 rounded-lg shadow-lg bg-white"
                onClick={focusInput}
            >
                <div className="flex justify-center gap-4 sm:gap-72 mb-4 mt-2 flex-wrap">
                    <div className="text-base sm:text-lg font-semibold rounded-lg p-2">🎮 NAME : {playerName || 'Player'}</div>
                    <div className="text-base sm:text-lg font-semibold rounded-lg p-2"> 🏆 RANKING : </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-center mb-2 sm:mb-2 flex justify-center">
                    <Image
                        src="/logo.png"
                        width={200}
                        height={100}
                        alt="Picture of the author"
                    />
                </h1>

                {/* Updated Countdown Timer Component */}
                <CountdownTimer
                    timeLeft={timeLeft}
                    isStarted={isStarted}
                    isFinished={isFinished}
                    onTimeExpired={handleTimeExpired}
                />

                <div className="mb-2 text-sm">
                    <span>Current Seed: {seed}</span>
                </div>

                <div className="mb-4 sm:mb-8"
                    onClick={focusInput}
                >
                    <div
                        ref={textDisplayRef}
                        className="p-4 sm:p-6 rounded-lg shadow mb-4 min-h-40 h-auto max-h-64 overflow-y-auto flex items-start cursor-text"
                        style={{
                            width: "100%",
                            overflowX: "auto",
                            overflowY: "auto",
                            wordWrap: "break-word",
                            whiteSpace: "pre-wrap"
                        }}
                    >
                        {renderText()}
                    </div>

                    <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={handleChange}
                        disabled={isFinished || isLoading}
                        className="p-2 border-2 border-gray-300 rounded text-lg font-mono focus:outline-none focus:border-blue-500 opacity-0 absolute"
                        autoFocus
                    />
                </div>

                <div className="flex justify-center gap-4 sm:gap-20 mb-4 mt-2 flex-wrap">
                    <div className="text-base sm:text-lg font-semibold rounded-lg p-2">🎮 WPM: {wpm}</div>
                    <div className="text-base sm:text-lg font-semibold rounded-lg p-2">♥️ Accuracy: {accuracy}%</div>
                </div>

                {isFinished && (
                    <div className="mb-4 p-2 sm:p-4 rounded-lg bg-gray-100 text-black">
                        <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Results</h2>
                        <p className="text-sm sm:text-base">WPM: {wpm}</p>
                        <p className="text-sm sm:text-base">Accuracy: {accuracy}%</p>
                        <p className="text-sm sm:text-base">Mistakes: {mistakes}</p>
                        <p className="text-sm sm:text-base">Time: {endTime && startTime ? ((endTime - startTime) / 1000).toFixed(2) : "0"} seconds</p>
                        <p className="text-sm sm:text-base">Seed: {seed}</p>


                    </div>
                )}
            </div>
        </div>
    );
};

export default Type;