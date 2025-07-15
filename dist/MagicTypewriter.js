import styled, { keyframes } from "styled-components";
import { useEffect, useRef, useState } from "react";
import GraphemeSplitter from "grapheme-splitter";
import React from "react";
const cursorAnimation = keyframes `
0% {opacity:0;}
50% {opacity:1;}
100% {opacity:0}
`;
const Cursor = styled.div `
  animation-name: ${cursorAnimation};
  animation-duration: 1.2s;
  animation-iteration-count: infinite;
  animation-timing-function: ease;
`;
export const MagicTypewriter = ({ message, onComplete, splitLines, splitString, isLoading, lineDelay, charDelay, }) => {
    const [allLines, setAllLines] = useState([[[""]]]);
    const [activeLine, setActiveLine] = useState(0);
    const [activeWord, setActiveWord] = useState(0);
    const [activeChar, setActiveChar] = useState(0);
    const [cursorPosition, setCursorPosition] = useState(50);
    const totalTime = useRef(0);
    const cursorRef = useRef(null);
    const defaultSplit = "\n";
    const toSplit = splitLines
        ? splitString
            ? splitString
            : defaultSplit
        : "!!!!";
    const getCursorPosition = () => {
        let assumedPosition = 0;
        try {
            if (cursorRef.current !== null) {
                const viewportOffset = cursorRef.current["offsetTop"];
                const distanceFromTop = viewportOffset +
                    2 * parseFloat(getComputedStyle(document.documentElement).fontSize);
                assumedPosition = distanceFromTop;
            }
        }
        catch (e) {
            assumedPosition = 0;
        }
        return assumedPosition;
    };
    useEffect(() => {
        const splitter = new GraphemeSplitter();
        // Split into relevant pieces
        const splitText = message.split(toSplit).map((line) => {
            return line.split(" ").map((word) => {
                return splitter.splitGraphemes(word);
            });
        });
        setAllLines(splitText);
        const lineCharLength = splitText.map((line) => {
            // Line length is made up of all words
            let currentLineLength = 0;
            line.map((word) => {
                return (currentLineLength = currentLineLength + word.length);
            });
            return currentLineLength;
        });
        const defaultChar = 30;
        const defaultLine = 250;
        const charDelayUse = charDelay || defaultChar;
        const lineDelayUse = lineDelay || defaultLine;
        const totalChars = lineCharLength.reduce((partialSum, a) => partialSum + a, 0);
        const totalLines = splitText.length;
        totalTime.current = totalChars * charDelayUse + totalLines * lineDelayUse;
        const timeouts = [];
        // Reset all lines
        setActiveLine(-1);
        setActiveChar(-1);
        setActiveWord(-1);
        setCursorPosition(50);
        splitText.map((line, lineIndex) => {
            // Get previous line length
            const prevLineChars = splitText
                .map((thisLine, lineOrder) => {
                let currentLineLength = 0;
                if (lineIndex > lineOrder) {
                    thisLine.map((word) => {
                        return (currentLineLength = currentLineLength + word.length);
                    });
                }
                return currentLineLength;
            })
                .reduce((partialSum, a) => partialSum + a, 0);
            // Start the line timeout
            const lineTimeout = setTimeout(() => {
                // Get a list of the words in this line
                const thisLine = line;
                // Set the active line
                setActiveLine(lineIndex);
                // Loop through all the words for this line
                thisLine.map((currentWord, wordIndex) => {
                    // Reset word index
                    setActiveWord(0);
                    // Get length of previous words in this line
                    const prevWordChars = line
                        .map((thisWord, wordOrder) => {
                        let currentLineLength = 0;
                        if (wordIndex > wordOrder) {
                            currentLineLength = currentLineLength + thisWord.length;
                        }
                        return currentLineLength;
                    })
                        .reduce((partialSum, a) => partialSum + a, 0);
                    const wordTimeout = setTimeout(() => {
                        setActiveWord(wordIndex);
                        setActiveChar(0);
                        // Loop through all the chars in this word
                        currentWord.map((currentChar, charIndex) => {
                            const charTimeout = setTimeout(() => {
                                setActiveChar(charIndex);
                                // Set cursor position
                                setCursorPosition(getCursorPosition());
                            }, charIndex * charDelayUse);
                            timeouts.push(charTimeout);
                            return charTimeout;
                        });
                    }, prevWordChars * charDelayUse);
                    timeouts.push(wordTimeout);
                    return wordTimeout;
                });
            }, prevLineChars * charDelayUse + lineIndex * lineDelayUse);
            timeouts.push(lineTimeout);
            return lineTimeout;
        });
        return () => {
            timeouts.forEach((timeout) => {
                clearTimeout(timeout);
            });
        };
    }, [message, toSplit, charDelay, lineDelay]);
    useEffect(() => {
        if (totalTime.current > 0 && onComplete) {
            const completeTimeout = setTimeout(() => {
                onComplete();
            }, totalTime.current);
            return () => {
                clearTimeout(completeTimeout);
            };
        }
    }, [totalTime.current, onComplete]);
    useEffect(() => {
        const positionTimeout = setTimeout(() => getCursorPosition() !== 0 && setCursorPosition(getCursorPosition()), 1);
        return () => {
            clearTimeout(positionTimeout);
        };
    }, []);
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "outerPromptContainer" },
            React.createElement("div", { className: "container", style: {
                    height: cursorPosition + "px",
                    WebkitUserSelect: "text",
                    userSelect: "text",
                    overflow: "hidden",
                    position: "relative",
                } }, !isLoading ? (allLines.map((line, lineIndex) => {
                return (React.createElement("div", { className: "promptLine", key: lineIndex, style: { display: "block" } }, allLines[lineIndex].map((word, wordIndex) => {
                    return (React.createElement("div", { "aria-hidden": "true", className: "promptWord", key: wordIndex, style: {
                            letterSpacing: "0",
                            display: "inline-block",
                            whiteSpace: "nowrap",
                        } },
                        allLines[lineIndex][wordIndex].map((character, characterIndex) => {
                            const isActive = lineIndex < activeLine ||
                                (activeLine === lineIndex &&
                                    activeWord > wordIndex) ||
                                (activeLine === lineIndex &&
                                    activeWord === wordIndex &&
                                    activeChar >= characterIndex)
                                ? true
                                : false;
                            const animatePrompt = isActive
                                ? " opacity 0.25s"
                                : "";
                            return (React.createElement("span", { key: characterIndex },
                                React.createElement("span", { className: "promptCharacter", style: { letterSpacing: 0 }, "aria-hidden": "true" },
                                    React.createElement("span", { style: {
                                            opacity: isActive ? 1 : 0,
                                            transition: animatePrompt,
                                        } }, character),
                                    activeLine === lineIndex &&
                                        activeWord === wordIndex &&
                                        activeChar === characterIndex && (React.createElement("span", { id: "promptCursor", ref: cursorRef, style: { display: "inline-block" }, className: "promptCursor" },
                                        React.createElement(Cursor, null, "|"))))));
                        }),
                        "\u00A0"));
                })));
            })) : (React.createElement("span", { className: "promptCursor" }, "|"))))));
};
