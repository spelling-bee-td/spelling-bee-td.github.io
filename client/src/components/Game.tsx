import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { words, Difficulty, generateAdventureDeck } from '@/lib/words';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Volume2, Check, X, Trophy, ArrowRight, Timer, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useToast } from '@/hooks/use-toast';
import Cookies from 'js-cookie';

interface GameProps {
  difficulty: Difficulty;
  onExit: () => void;
}

export default function Game({ difficulty, onExit }: GameProps) {
  const [deck, setDeck] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [round, setRound] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const [bestScore, setBestScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentWordRef = useRef('');
  const timerStartedRef = useRef(false);
  const { toast } = useToast();

  // Game configuration
  const isAdventure = difficulty === 'adventure';
  const isEndless = difficulty.includes('-endless');
  const isSandbox = difficulty.includes('-sandbox-');
  const isHangman = difficulty.includes('-hangman');
  const isImpossible = difficulty === 'impossible' || isEndless || isSandbox || isHangman;
  
  // Parse difficulty, endless, sandbox, and hangman parameters
  let baseDifficulty: any = difficulty;
  let sandboxTimeLimit = 5;
  let sandboxWordCount = 10;
  
  if (isEndless) {
    baseDifficulty = difficulty.replace('-endless', '');
  } else if (isSandbox) {
    const parts = difficulty.split('-sandbox-');
    baseDifficulty = parts[0];
    sandboxTimeLimit = parts[1] === 'None' ? 0 : parseInt(parts[1]);
    sandboxWordCount = parseInt(parts[2]);
  } else if (isHangman) {
    baseDifficulty = difficulty.replace('-hangman', '');
  }
  
  const TOTAL_ROUNDS = isAdventure ? 20 : isSandbox ? sandboxWordCount : isImpossible ? 999 : 10; 
  const BASE_TIME_LIMIT = isAdventure ? (round > 15 ? 3 : 5) : 0; // 3s for Impossible stage in Adventure
  
  // Load best score
  useEffect(() => {
    let cookieKey = `best_score_${difficulty}`;
    if (isEndless) {
      cookieKey = `best_score_endless_${baseDifficulty}`;
    } else if (isSandbox) {
      cookieKey = `best_score_sandbox_${baseDifficulty}_${sandboxTimeLimit}_${sandboxWordCount}`;
    } else if (isHangman) {
      cookieKey = `best_score_hangman_${baseDifficulty}`;
    }
    const savedBest = Cookies.get(cookieKey);
    if (savedBest) setBestScore(parseInt(savedBest));
  }, [difficulty, baseDifficulty, isSandbox, isEndless, isHangman, sandboxTimeLimit, sandboxWordCount]);

  const updateBestScore = (newScore: number) => {
    if (newScore > bestScore) {
      setBestScore(newScore);
      let cookieKey = `best_score_${difficulty}`;
      if (isEndless) {
        cookieKey = `best_score_endless_${baseDifficulty}`;
      } else if (isSandbox) {
        cookieKey = `best_score_sandbox_${baseDifficulty}_${sandboxTimeLimit}_${sandboxWordCount}`;
      } else if (isHangman) {
        cookieKey = `best_score_hangman_${baseDifficulty}`;
      }
      Cookies.set(cookieKey, newScore.toString(), { expires: 365 });
    }
  };

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US'; // Prefer standard US English
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onstart = () => {
        setIsSpeaking(true);
        // Start timer when TTS begins (only if not already started)
        const shouldStartTimer = status === 'idle' && word === currentWordRef.current && !timerStartedRef.current;
        const isTimerMode = isAdventure || (isSandbox && sandboxTimeLimit > 0);
        
        if (isTimerMode && shouldStartTimer) {
          timerStartedRef.current = true;
          startTimer();
        }
      };
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "TTS Error",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive"
      });
      // Fallback to start timer if TTS fails
      const isTimerMode = isAdventure || (isSandbox && sandboxTimeLimit > 0);
      if (isTimerMode && !timerStartedRef.current) {
        timerStartedRef.current = true;
        startTimer();
      }
    }
  };

  // New helper function for feedback speech
  const speakFeedback = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // Prefer standard US English
      utterance.rate = 1.1; // Slightly faster for feedback
      utterance.pitch = 1.1; // Slightly higher pitch
      window.speechSynthesis.speak(utterance);
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Determine time limit based on mode
    let limit = 5;
    if (isAdventure && round > 15) {
      limit = 3;
    } else if (isSandbox && sandboxTimeLimit > 0) {
      limit = sandboxTimeLimit;
    } else if ((isEndless || isImpossible) && !isSandbox) {
      limit = 5; // Default for endless/impossible
    }
    
    setTimeLeft(limit);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleIncorrect(true); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Initialize Game
  useEffect(() => {
    let initialDeck: string[] = [];
    
    if (isAdventure) {
      initialDeck = generateAdventureDeck();
    } else if (isImpossible) {
       // Infinite/Sandbox/Hangman mode: start with random mix, we will regenerate as we go
       const wordListKey = (isEndless || isSandbox || isHangman) ? baseDifficulty : 'impossible';
       const wordList = words[wordListKey as Exclude<Difficulty, 'adventure'>];
       initialDeck = Array.from({ length: 50 }, () => wordList[Math.floor(Math.random() * wordList.length)]);
    } else {
      const wordList = words[difficulty as Exclude<Difficulty, 'adventure'>];
      initialDeck = Array.from({ length: TOTAL_ROUNDS }, () => 
        wordList[Math.floor(Math.random() * wordList.length)]
      );
    }
    
    setDeck(initialDeck);
    
    if (initialDeck.length > 0) {
      // Start first word
      startRound(initialDeck[0]);
    }
    
    return () => {
      window.speechSynthesis.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [difficulty]);

  // Effect to handle Speaking and Input Focus whenever Current Word changes
  useEffect(() => {
    if (currentWord) {
       // Speak and Focus
       // Small timeout to allow UI to settle/transition
       const timer = setTimeout(() => {
          speakWord(currentWord);
          inputRef.current?.focus();
       }, 500);
       return () => clearTimeout(timer);
    }
  }, [currentWord]); // Only runs when currentWord changes

  const startRound = (word: string) => {
    setCurrentWord(word);
    currentWordRef.current = word; // Keep ref in sync
    setUserInput('');
    setStatus('idle');
    setGameStarted(true);
    timerStartedRef.current = false; // Reset timer flag for new round
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Set initial time display before timer starts
    if (isAdventure) {
       setTimeLeft(round > 15 ? 3 : 5);
    }

    // NOTE: speakWord is now handled by useEffect
  };

  const nextWord = () => {
    // Determine if we should continue
    const shouldContinue = isImpossible || round < TOTAL_ROUNDS;

    if (shouldContinue) {
      setRound(prev => prev + 1);
      
      let nextWordStr = '';
      
      if (isImpossible) {
         // Pick random word for next round
         const wordList = words['impossible'];
         nextWordStr = wordList[Math.floor(Math.random() * wordList.length)];
         // Ensure unique from current if possible (simple check)
         if (nextWordStr === currentWord) {
            nextWordStr = wordList[Math.floor(Math.random() * wordList.length)];
         }
      } else if (isImpossible && (isEndless || isSandbox || isHangman)) {
         // Endless/Sandbox/Hangman mode: pick random from baseDifficulty words
         const wordList = words[baseDifficulty as Exclude<Difficulty, 'adventure'>];
         nextWordStr = wordList[Math.floor(Math.random() * wordList.length)];
         if (nextWordStr === currentWord) {
            nextWordStr = wordList[Math.floor(Math.random() * wordList.length)];
         }
      } else {
         // Standard/Adventure progression
         const nextIndex = round; // round is 1-based, array 0-based. Next index is current round value.
         if (nextIndex < deck.length) {
            nextWordStr = deck[nextIndex];
         }
      }
      
      if (nextWordStr) {
        startRound(nextWordStr);
      } else {
        finishGame();
      }

    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('idle');
    updateBestScore(score);
    
    toast({
      title: isAdventure ? "Adventure Complete!" : "Level Complete!",
      description: `Final Score: ${score + (10 * (streak + 1))}`,
    });
    
    setRound(1);
    setScore(0);
    setStreak(0);
    
    // Regenerate deck logic similar to init
    let newDeck: string[] = [];
    if (isAdventure) {
      newDeck = generateAdventureDeck();
    } else if (!isImpossible) {
      const wordList = words[difficulty as Exclude<Difficulty, 'adventure' | 'impossible'>];
      newDeck = Array.from({ length: TOTAL_ROUNDS }, () => 
        wordList[Math.floor(Math.random() * wordList.length)]
      );
    }
    setDeck(newDeck);
    
    // Restart
    if (isImpossible) {
        const wordList = words['impossible'];
        startRound(wordList[Math.floor(Math.random() * wordList.length)]);
    } else if (newDeck.length > 0) {
        startRound(newDeck[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    if (userInput.toLowerCase().trim() === currentWord.toLowerCase()) {
      handleCorrect();
    } else {
      handleIncorrect();
    }
  };

  const handleCorrect = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setStatus('correct');
    speakFeedback("Correct!"); // Auditory feedback
    
    // Score Calculation
    // Base: 10
    // Streak Bonus: 10 * (streak + 1)
    // Time Bonus (Adventure): timeLeft * 10 (increased value)
    // Impossible Mode Bonus: Flat 50 points extra per word
    
    let points = 10 + (10 * (streak + 1));
    if (isAdventure) points += timeLeft * 10;
    if (isImpossible) points += 50;
    
    const newScore = score + points;
    setScore(newScore);
    updateBestScore(newScore);
    
    setStreak(prev => prev + 1);
    
    if (streak > 2) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#60A5FA', '#A855F7', '#F472B6']
      });
    }

    setTimeout(() => {
      nextWord();
    }, 1500);
  };

  const handleIncorrect = (isTimeout = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setStatus('incorrect');
    setStreak(0);
    
    // Update hangman wrong guesses
    let newWrongs = wrongGuesses;
    if (isHangman && !isTimeout) {
      newWrongs = wrongGuesses + 1;
      setWrongGuesses(newWrongs);
      
      // Check if game over (6 wrong guesses in hangman)
      if (newWrongs >= 6) {
        speakFeedback(`Game Over! You've been hanged!`);
        toast({
          title: "Hangman - Game Over!",
          description: `You made 6 wrong guesses. Final Score: ${score}`,
          variant: "destructive"
        });
        
        setTimeout(() => {
          setStatus('idle');
          onExit();
        }, 2500);
        return;
      }
    }
    
    // Auditory feedback
    if (isTimeout) {
      speakFeedback(`Time's up! The word was ${currentWord}`);
    } else {
      if (isHangman) {
        speakFeedback(`Wrong! ${6 - newWrongs} guesses left. The word was ${currentWord}`);
      } else {
        speakFeedback(`Incorrect. The word was ${currentWord}`);
      }
    }
    
    if (isTimeout) {
      toast({
        title: "Time's up!",
        description: `The word was: ${currentWord}`,
        variant: "destructive"
      });
    }

    setTimeout(() => {
      setStatus('idle');
      if (!isHangman || isTimeout) {
        // Redirect to menu (Sudden Death behavior for non-hangman or timeout)
        onExit();
      } else {
        // Continue to next word in hangman mode
        nextWord();
      }
    }, 2500);
  };

  const getStageLabel = () => {
    if (isHangman) return `Hangman - ${baseDifficulty.toUpperCase()}`;
    if (isEndless) return `${baseDifficulty.toUpperCase()} Endless`;
    if (isSandbox) return `Sandbox - ${baseDifficulty.toUpperCase()}`;
    if (isImpossible) return "Endless Mode";
    if (isAdventure) {
      if (round <= 5) return "Easy Stage";
      if (round <= 10) return "Medium Stage";
      if (round <= 15) return "Hard Stage";
      return "Impossible Stage (3s!)";
    }
    return 'Level';
  };

  return (
    <div className="max-w-2xl mx-auto w-full p-4 flex flex-col items-center justify-center min-h-[80vh]">
      {/* Header Stats */}
      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 glass-panel p-4 rounded-xl">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs uppercase tracking-wider truncate">
            {getStageLabel()}
          </span>
          <span className="font-bold text-primary capitalize truncate">
            {isImpossible ? `Word ${round}` : isAdventure ? `Word ${round}/${TOTAL_ROUNDS}` : difficulty}
          </span>
        </div>
        
        <div className="flex flex-col items-center md:items-start">
           <span className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1">
             Best <Star className="w-3 h-3 text-yellow-500" />
           </span>
           <span className="font-mono font-bold text-xl text-yellow-500">{bestScore}</span>
        </div>

        <div className="flex flex-col items-center md:items-end">
          <span className="text-muted-foreground text-xs uppercase tracking-wider">Streak</span>
          <div className="flex items-center gap-1 text-accent font-mono font-bold text-xl">
            <Trophy className="w-4 h-4" />
            {streak}
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-muted-foreground text-xs uppercase tracking-wider">Score</span>
          <span className="font-mono font-bold text-xl">{score}</span>
        </div>
      </div>

      {/* Timer Bar for Adventure Mode */}
      {isAdventure && (
        <div className="w-full mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> Time Limit</span>
            <span className={`${timeLeft <= 2 ? 'text-red-500 font-bold' : ''}`}>{timeLeft}s</span>
          </div>
          <Progress value={(timeLeft / (round > 15 ? 3 : 5)) * 100} className={`h-3 transition-all ${timeLeft <= 2 ? 'bg-red-900' : ''}`} />
        </div>
      )}

      {/* Timer Bar for Sandbox Mode (if time limit set) */}
      {isSandbox && sandboxTimeLimit > 0 && (
        <div className="w-full mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> Time Limit</span>
            <span className={`${timeLeft <= 2 ? 'text-red-500 font-bold' : ''}`}>{timeLeft}s</span>
          </div>
          <Progress value={(timeLeft / sandboxTimeLimit) * 100} className={`h-3 transition-all ${timeLeft <= 2 ? 'bg-red-900' : ''}`} />
        </div>
      )}

      {/* Hangman Visual */}
      {isHangman && (
        <div className="w-full mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">Lives: {6 - wrongGuesses}/6</span>
            <span className="text-red-400 font-bold">{wrongGuesses} Wrong</span>
          </div>
          <svg width="100%" height="140" viewBox="0 0 200 140" className="border border-white/10 rounded bg-black/20 p-2">
            {/* Gallows */}
            <line x1="20" y1="120" x2="180" y2="120" stroke="white" strokeWidth="2" />
            <line x1="40" y1="120" x2="40" y2="20" stroke="white" strokeWidth="2" />
            <line x1="40" y1="20" x2="120" y2="20" stroke="white" strokeWidth="2" />
            <line x1="120" y1="20" x2="120" y2="40" stroke="white" strokeWidth="2" />
            
            {/* Head */}
            {wrongGuesses >= 1 && <circle cx="120" cy="50" r="10" fill="none" stroke="#ff6b6b" strokeWidth="2" />}
            
            {/* Body */}
            {wrongGuesses >= 2 && <line x1="120" y1="60" x2="120" y2="85" stroke="#ff6b6b" strokeWidth="2" />}
            
            {/* Left Arm */}
            {wrongGuesses >= 3 && <line x1="120" y1="70" x2="100" y2="65" stroke="#ff6b6b" strokeWidth="2" />}
            
            {/* Right Arm */}
            {wrongGuesses >= 4 && <line x1="120" y1="70" x2="140" y2="65" stroke="#ff6b6b" strokeWidth="2" />}
            
            {/* Left Leg */}
            {wrongGuesses >= 5 && <line x1="120" y1="85" x2="105" y2="105" stroke="#ff6b6b" strokeWidth="2" />}
            
            {/* Right Leg */}
            {wrongGuesses >= 6 && <line x1="120" y1="85" x2="135" y2="105" stroke="#ff6b6b" strokeWidth="2" />}
          </svg>
        </div>
      )}

      {/* Progress Bar (Overall - Hide for Impossible) */}
      {!isImpossible && !isAdventure && (
         <Progress value={(round / TOTAL_ROUNDS) * 100} className="w-full h-2 mb-12 bg-secondary/30" />
      )}
      
      {isAdventure && (
         <Progress value={(round / TOTAL_ROUNDS) * 100} className="w-full h-2 mb-12 bg-secondary/30" />
      )}

      {/* Main Game Area */}
      <Card className="w-full glass-panel border-0 bg-black/20 p-8 flex flex-col items-center gap-8 relative overflow-hidden">
        <AnimatePresence>
          {status === 'correct' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-green-500 z-0"
            />
          )}
          {status === 'incorrect' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-destructive z-0"
            />
          )}
        </AnimatePresence>

        {/* Speaker Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            variant="outline" 
            size="icon" 
            className={`h-32 w-32 rounded-full border-4 transition-all duration-300 relative z-10
              ${isSpeaking ? 'border-primary shadow-[0_0_30px_hsl(var(--primary))]' : 'border-white/10'}
              ${status === 'correct' ? 'border-green-500 text-green-500' : ''}
              ${status === 'incorrect' ? 'border-destructive text-destructive' : ''}
            `}
            onClick={() => speakWord(currentWord)}
            data-testid="button-speak"
          >
            {status === 'correct' ? (
              <Check className="w-16 h-16" />
            ) : status === 'incorrect' ? (
              <X className="w-16 h-16" />
            ) : (
              <Volume2 className={`w-16 h-16 ${isSpeaking ? 'animate-pulse' : ''}`} />
            )}
          </Button>
        </motion.div>

        <div className="text-center space-y-2 z-10">
          <p className="text-muted-foreground text-sm">
            {isSpeaking ? "Listening..." : "Tap icon to hear again"}
          </p>
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="w-full max-w-md relative z-10 space-y-4">
          <motion.div
            animate={status === 'incorrect' ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <Input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type what you hear..."
              className="text-center text-3xl font-mono h-20 bg-black/30 border-white/10 focus:border-primary focus:ring-primary/50 tracking-widest"
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              disabled={status !== 'idle'}
              data-testid="input-spelling"
            />
          </motion.div>

          {/* Feedback Text Display */}
          <div className="h-8 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {status === 'incorrect' && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-destructive font-mono font-bold text-lg tracking-widest uppercase"
                >
                  {currentWord}
                </motion.p>
              )}
              {status === 'correct' && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-green-500 font-mono font-bold text-lg tracking-widest uppercase"
                >
                  {currentWord}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-4 justify-center">
             <Button 
              type="button" 
              variant="ghost" 
              onClick={onExit}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-exit"
            >
              Exit
            </Button>
            <Button 
              type="submit" 
              size="lg"
              className="px-8 font-bold bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity"
              disabled={!userInput || status !== 'idle'}
              data-testid="button-submit"
            >
              Check <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
           
          </div>
        </form>
      </Card>
    </div>
  );
}
