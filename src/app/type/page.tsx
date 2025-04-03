"use client";
import React, { useState, useEffect, useRef, use } from 'react';
import Image from 'next/image'

const MonkeyType = () => {
    const [text, setText] = useState('');
    const [userInput, setUserInput] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [mistakes, setMistakes] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [hasClicked, setHasClicked] = useState(true); // NEW STAT
    const inputRef = useRef(null);
    const textDisplayRef = useRef(null);

    const sampleTexts = [
        "The quick brown fox jumps over the lazy dog.",
        "She sells seashells by the seashore.",
        "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
        "In the beginning, the universe was created. This has made a lot of people very angry and been widely regarded as a bad move.",
        "All that glitters is not gold. All that wander are not lost.",
    ];

    useEffect(() => {
        resetTest();
    }, []);

    useEffect(() => {
        // Focus input เมื่อ component โหลดเสร็จ
        if (inputRef.current) {
            inputRef.current.focus();
        }
    });

    const resetTest = () => {
        const randomIndex = Math.floor(Math.random() * sampleTexts.length);
        setText(sampleTexts[randomIndex]);
        setUserInput('');
        setCurrentIndex(0);
        setStartTime(null);
        setEndTime(null);
        setWpm(0);
        setAccuracy(100);
        setMistakes(0);
        setIsFinished(false);
        setIsStarted(false);
        setHasClicked(true);  // Reset the click state too
        if (inputRef.current) {
            inputRef.current.blur(); // Remove focus
        }
    };

    const handleChange = (e) => {
        const value = e.target.value;
        const key = e.key;


        if (!isStarted && value.length > 0) {
            setIsStarted(true);
            setStartTime(Date.now());
        }

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

    const calculateWpm = () => {
        if (startTime && userInput.length > 0) {
            const currentTime = Date.now();
            const timeInMinutes = (currentTime - startTime) / 60000;
            let numCorrectWords = 0;
            for (let i = 0; i < text.split(' ').length; i++) {
                    if (text.split(' ')[i] === userInput.split(' ')[i]) {
                        numCorrectWords++;
                    }
            }
            const calculatedWpm = Math.round(numCorrectWords / timeInMinutes);
            setWpm(calculatedWpm);
        } else {
            setWpm(0);
        }
    };

    const focusInput = () => {
        if (inputRef.current && !isFinished) {
            inputRef.current.focus();
        }
    };

    const renderText = () => {
        return (
            <div className="font-mono text-lg relative">
                <div className="flex flex-wrap">
                    {text.split('').map((char, index) => {
                        let className = "relative";
                        let content = char;
                        if (index < userInput.length) {
                            const isCorrect = userInput[index] === char;
                            className += isCorrect ? " text-white-500" : " text-red-500 bg-red-100";
                            content = userInput[index];
                            if (userInput[index] === " " && char !== " ") {
                                content = "_";
                            }
                        } else {
                            className += " text-gray-400";

                            if (index === currentIndex && !isFinished) {
                                className += " border-l-2 border-gray-600 animate-pulse";
                            }
                        }

                        return (
                            <span key={index} className={className} style={{ width: char === " " ? "0.5em" : "auto" }}>
                                {content}
                            </span>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="flex items-center justify-center 
        min-h-screen bg-[url('/try.svg')] bg-cover bg-center">
        <div className="w-full max-w-2xl mx-auto p-2 sm:p-4 rounded-lg shadow-lg"
            onClick={focusInput}
        >
            <h1 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 flex justify-center">
                 <Image
                        src="/logo.png"
                        width={80}
                        height={100}
                        alt="Picture of the author"
                 />
            </h1>

            <div className="mb-4 sm:mb-8"
                onClick={focusInput}
            >
                <div className="flex justify-between mb-2">
                    <div className="text-base sm:text-lg font-semibold">WPM: {wpm}</div>
                    <div className="text-base sm:text-lg font-semibold">Accuracy: {accuracy}%</div>
                </div>

                <div
                    ref={textDisplayRef}
                    className="p-2 sm:p-4 rounded-lg shadow mb-4 min-h-24 sm:h-32 flex items-center cursor-text overflow-x-auto"
                >
                    {renderText()}
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={handleChange}
                    disabled={isFinished} 
                    className="p-2 border-2 border-gray-300 rounded text-lg font-mono focus:outline-none focus:border-blue-500 opacity-0 absolute"
                    autoFocus
                />

            </div>

            {isFinished && (
                <div className="mb-4 p-2 sm:p-4 rounded-lg">
                    <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Results</h2>
                    <p className="text-sm sm:text-base">WPM: {wpm}</p>
                    <p className="text-sm sm:text-base">Accuracy: {accuracy}%</p>
                    <p className="text-sm sm:text-base">Mistakes: {mistakes}</p>
                    <p className="text-sm sm:text-base">Time: {((endTime - startTime) / 1000).toFixed(2)} seconds</p>
                </div>
            )}

            <button
                onClick={resetTest}
                className="w-full p-2 text-white rounded-lg hover:text-black hover:bg-gray-300 transition border-2 border-gray-300 "
            >
                {isFinished ? "Try Again" : "Reset"}
            </button>
        </div>
    </div>
    );
};

export default MonkeyType;