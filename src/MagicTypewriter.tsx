import styled, { keyframes } from 'styled-components'
import { useEffect, useRef, useState } from 'react';
import GraphemeSplitter from 'grapheme-splitter';
import React from 'react';

interface ContainerProps {
  message: String;
  onComplete?: Function;
  splitLines?: Boolean;
  isLoading?: Boolean;
  splitString?: RegExp;
  lineDelay?: number | undefined;
  charDelay?: number | undefined;
}

const cursorAnimation = keyframes`
0% {opacity:0;}
50% {opacity:1;}
100% {opacity:0}
`
const Cursor = styled.div`
animation-name:${cursorAnimation};
animation-duration:1.2s;
animation-iteration-count:infinite;
animation-timing-function:ease;
`
export const  MagicTypewriter: React.FC<ContainerProps> = ({ message, onComplete, splitLines, splitString, isLoading, lineDelay, charDelay }) => {
  const [allLines, setAllLines] = useState([[[""]]])
  const [activeLine, setActiveLine] = useState(0)
  const [activeWord, setActiveWord] = useState(0)
  const [activeChar, setActiveChar] = useState(0)
  const [cursorPosition, setCursorPosition] = useState(50)
  const cursorRef = useRef(null)
  const defaultSplit : string = "\n"
  const toSplit = splitLines ? splitString ? splitString : defaultSplit : "!!!!"

  const getCursorPosition = () => {
    let assumedPosition = 0
    try {
      if (cursorRef.current !== null) {
        const viewportOffset = cursorRef.current["offsetTop"]
        const distanceFromTop = viewportOffset + 2 * parseFloat(getComputedStyle(document.documentElement).fontSize)
        assumedPosition = distanceFromTop
      }
    } catch (e) {
      assumedPosition = 0;
    }
    return assumedPosition
  }

  useEffect(() => { 
    const splitter = new GraphemeSplitter();
    // Split into relevant pieces
    const splitText : string[][][] = message.split(toSplit).map((line) => {
       return line.split(" ").map((word => {
          return splitter.splitGraphemes(word)
      }))
    })

    setAllLines(splitText)  
    const lineCharLength = splitText.map((line : string[][]) => {
      // Line length is made up of all words
      let currentLineLength = 0 
      line.map((word : string[]) => {
        return currentLineLength = currentLineLength + word.length
      })
      return currentLineLength;
    })
    
    const defaultChar : number = 30
    const defaultLine : number = 250

    const charDelayUse : number = charDelay || defaultChar
    const lineDelayUse = lineDelay || defaultLine
    const totalChars = lineCharLength.reduce((partialSum : number, a : number) => partialSum + a, 0)
    const totalLines = splitText.length
    const totalTime = (totalChars * charDelayUse) + (totalLines * lineDelayUse)

    const timeouts : {
      [key: string]: any
    } = {}
    // Reset all lines
    setActiveLine(-1)
    setActiveChar(-1)
    setActiveWord(-1)
    setCursorPosition(50)

    splitText.map((line : string[][], lineIndex : number) => {
      // Get previous line length
      const prevLineChars = splitText.map((thisLine : string[][], lineOrder : number) => {
        let currentLineLength = 0 
          if (lineIndex > lineOrder) {
            thisLine.map((word : string[]) => {
              return currentLineLength = currentLineLength + word.length
            })
          }
          return currentLineLength;
        }).reduce((partialSum : number, a : number) => partialSum + a, 0)
      // Start the line timeout
      return timeouts["lines"] = setTimeout(() => {
        // Get a list of the words in this line
        const thisLine = line
        // Set the active line
        setActiveLine(lineIndex)
        // Loop through all the words for this line
        thisLine.map((currentWord : string[], wordIndex : number) => {
          // Reset word index 
          setActiveWord(0)
          // Get length of previous words in this line 
          const prevWordChars = line.map((thisWord : string[], wordOrder : number) => {
            let currentLineLength = 0 
              if (wordIndex > wordOrder) {
                currentLineLength = currentLineLength + thisWord.length
              }
              return currentLineLength;
            }).reduce((partialSum : number, a : number) => partialSum + a, 0)

          return timeouts["words"] = setTimeout(() => {
            setActiveWord(wordIndex)
            setActiveChar(0)
            // Loop through all the chars in this word
            currentWord.map((currentChar, charIndex) => {
              return timeouts["chars"] = setTimeout(() => {
                setActiveChar(charIndex)
                // Set cursor position
                setCursorPosition(getCursorPosition())
              }, charIndex * charDelayUse)
            })
          }, prevWordChars * charDelayUse)
        })

      }, (prevLineChars * charDelayUse) + (lineIndex * lineDelayUse))
    })

    timeouts["complete"] = setTimeout(() => {
      if (onComplete) {
        onComplete()
      }
    }, totalTime)

    return () => {
      Object.keys(timeouts).forEach((key) => {
        clearTimeout(timeouts[key]);
      });
    }
    
    }, [onComplete, message, toSplit, charDelay, lineDelay])

    useEffect(() => {
      setTimeout(() => getCursorPosition() !== 0 && setCursorPosition(getCursorPosition()), 1)
    }, [])

  return (
    <>
      <div className="outerPromptContainer">
      <div className={"container"} style={{"height" : cursorPosition + "px", "WebkitUserSelect":"text","userSelect":"text","overflow":"hidden","position":"relative"}}>
        {
          !isLoading ?
          allLines.map((line : string[][], lineIndex : number) => {
            return (
              <div className="promptLine" key={lineIndex} style={{"display":"block"}}>
                {
                 allLines[lineIndex].map((word : string[], wordIndex : number) => {
                    return (
                      <div aria-hidden="true" className="promptWord" key={wordIndex} style={{"letterSpacing":"0","display":"inline-block","whiteSpace":"nowrap"}}>
                      {
                        allLines[lineIndex][wordIndex].map((character : string, characterIndex : number) => {
                          const isActive = (lineIndex < activeLine) || (activeLine === lineIndex && activeWord > wordIndex) || (activeLine === lineIndex && activeWord === wordIndex && activeChar >= characterIndex) ? true : false
                          const animatePrompt = isActive ? " opacity 0.25s" : ""
                          return(
                            <span key={characterIndex}>
                              <span className="promptCharacter" style={{letterSpacing : 0}} aria-hidden="true" >
                               <span style={{opacity : isActive ? 1 : 0, transition: animatePrompt}}>{character}</span>
                               {activeLine === lineIndex && activeWord === wordIndex && activeChar === characterIndex && 
                               <span id='promptCursor' ref={cursorRef} style={{"display" : "inline-block"}} className="promptCursor">
                                <Cursor>|</Cursor>
                                </span>}
                              </span>
                          </span>
                          )
                        })
                    }
                    &nbsp;
                    </div>
                    )
                  })
                }
              </div>
            )
          })
          : <span className="promptCursor">|</span>
        }
      </div>
    </div>
    </>
  );
};



