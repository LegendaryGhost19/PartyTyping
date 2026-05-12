import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const COMMON_WORDS = ["the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"];

const generateWords = () => {
  return [...COMMON_WORDS].sort(() => 0.5 - Math.random()).slice(0, 100);
};

const TEST_DURATION = 30;

export default function MonkeyTypeClone() {
  const [words, setWords] = useState(generateWords());
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [typedHistory, setTypedHistory] = useState([]);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  
  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);

  // NEW: Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);

  const inputRef = useRef(null);
  const displayRef = useRef(null);

  // NEW: Apply the theme to the entire HTML document body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  useEffect(() => {
    const activeWordElement = document.getElementById('active-word');
    if (activeWordElement && displayRef.current) {
      const container = displayRef.current;
      const activeWordTop = activeWordElement.offsetTop;

      if (activeWordTop > 50) {
        container.scrollTo({ top: activeWordTop - 45, behavior: 'smooth' });
      } else if (currentWordIndex === 0) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [currentWordIndex]);

  useEffect(() => {
    if (startTime && timeLeft > 0 && !isFinished) {
      const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else if (timeLeft === 0 && !isFinished) {
      setIsFinished(true);
      calculateFinalWpm();
    }
  }, [startTime, timeLeft, isFinished]);

  const calculateFinalWpm = () => {
    const timeElapsedInMinutes = TEST_DURATION / 60;
    const finalWpm = Math.round((correctKeystrokes / 5) / timeElapsedInMinutes);
    setWpm(finalWpm > 0 ? finalWpm : 0);
  };

  const handleInput = (e) => {
    if (isFinished) return;
    const value = e.target.value;
    
    if (!startTime) setStartTime(Date.now());

    if (value.endsWith(' ')) {
      const typedWord = value.trim();
      const targetWord = words[currentWordIndex];

      let correctChars = 0;
      for (let i = 0; i < Math.min(typedWord.length, targetWord.length); i++) {
         if (typedWord[i] === targetWord[i]) correctChars++;
      }
      if (typedWord === targetWord) correctChars++;

      setCorrectKeystrokes((prev) => prev + correctChars);
      setTypedHistory((prev) => [...prev, typedWord]); 
      setCurrentInput('');
      setCurrentWordIndex((prev) => prev + 1);
      return;
    }
    setCurrentInput(value);
  };

  const resetTest = () => {
    setWords(generateWords());
    setCurrentWordIndex(0);
    setCurrentInput('');
    setTypedHistory([]); 
    setStartTime(null);
    setTimeLeft(TEST_DURATION);
    setWpm(0);
    setCorrectKeystrokes(0);
    setIsFinished(false);
    inputRef.current.focus();
  };

  let currentCorrectInWord = 0;
  const currentTargetWord = words[currentWordIndex];
  for (let i = 0; i < Math.min(currentInput.length, currentTargetWord.length); i++) {
      if (currentInput[i] === currentTargetWord[i]) currentCorrectInWord++;
  }
  
  const totalTypedChars = typedHistory.join('').length + currentWordIndex + currentInput.length; 
  const totalCorrectChars = correctKeystrokes + currentCorrectInWord;
  const accuracy = totalTypedChars > 0 ? Math.round((totalCorrectChars / totalTypedChars) * 100) : 100;

  return (
    <div className="typing-container" onClick={() => inputRef.current.focus()}>
      
      {/* NEW: Theme Toggle Tab */}
      <div className="theme-toggle">
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Prevents the click from focusing the hidden input
            setIsDarkMode(!isDarkMode);
          }}
        >
          {isDarkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      <header className="app-header">
        <h1>PartyTyping 🎉</h1>
      </header>

      <div className="stats">
        <h2>{isFinished ? `Final WPM: ${wpm}` : `Time: ${timeLeft}s`}</h2>
        <h2>Acc: {accuracy}%</h2>
      </div>

      <div className="word-display" ref={displayRef}>
        {words.map((word, wIndex) => {
          const isActiveWord = wIndex === currentWordIndex;
          
          return (
            <span 
              key={wIndex} 
              id={isActiveWord ? 'active-word' : ''}
              className={`word ${isActiveWord ? 'active' : ''}`}
            >
              {word.split('').map((char, cIndex) => {
                let statusClass = ''; 
                
                if (isActiveWord && cIndex < currentInput.length) {
                  statusClass = currentInput[cIndex] === char ? 'correct' : 'incorrect';
                } else if (wIndex < currentWordIndex) {
                  const pastTypedWord = typedHistory[wIndex] || "";
                  if (cIndex < pastTypedWord.length) {
                     statusClass = pastTypedWord[cIndex] === char ? 'correct' : 'incorrect';
                  } else {
                     statusClass = 'incorrect'; 
                  }
                }

                return (
                  <span key={cIndex} className={`char ${statusClass}`}>
                    {char}
                  </span>
                );
              })}

              {isActiveWord && currentInput.length > word.length && (
                currentInput.slice(word.length).split('').map((char, index) => (
                  <span key={'extra-' + index} className="char incorrect extra">
                    {char}
                  </span>
                ))
              )}

              {wIndex < currentWordIndex && typedHistory[wIndex] && typedHistory[wIndex].length > word.length && (
                typedHistory[wIndex].slice(word.length).split('').map((char, index) => (
                  <span key={'past-extra-' + index} className="char incorrect extra">
                    {char}
                  </span>
                ))
              )}
            </span>
          );
        })}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={currentInput}
        onChange={handleInput}
        disabled={isFinished}
        style={{ opacity: 0, position: 'absolute', top: '-9999px' }}
      />

      {isFinished && (
        <div className="results">
          <h3>Test Complete!</h3>
          <button className="restart-btn" onClick={resetTest}>Restart Party 🔄</button>
        </div>
      )}
    </div>
  );
}