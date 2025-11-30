import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { words } from '@/lib/words';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Volume2, Trophy, ArrowRight, Zap, Shield, Crosshair } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useToast } from '@/hooks/use-toast';
import Cookies from 'js-cookie';

interface ChaseGameProps {
  difficulty: string;
  onExit: () => void;
}

type ActionType = 'move' | 'stun' | 'shoot' | null;

export default function ChaseGame({ difficulty, onExit }: ChaseGameProps) {
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<'idle' | 'action_select' | 'spelling' | 'correct' | 'incorrect' | 'gameover'>('action_select');
  const [round, setRound] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Chase mechanics
  const [playerPosition, setPlayerPosition] = useState(0);
  const [chaserPosition, setChaserPosition] = useState(-5);
  const [distance, setDistance] = useState(5);
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [gameOverReason, setGameOverReason] = useState('');
  const [chaserHealth, setChaserHealth] = useState(10);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const currentWordRef = useRef('');
  const { toast } = useToast();
  const chaserIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Game configuration
  const baseDifficulty = difficulty.replace('-chase', '');
  const CHASER_SPEED = 5000; // Move every 5 seconds
  const CATCH_DISTANCE = 0;
  
  // Load best score
  useEffect(() => {
    const cookieKey = `best_score_chase_${baseDifficulty}`;
    const savedBest = Cookies.get(cookieKey);
    if (savedBest) setBestScore(parseInt(savedBest));
    if (!gameStarted) setGameStarted(true);
  }, [baseDifficulty, gameStarted]);

  const updateBestScore = (newScore: number) => {
    if (newScore > bestScore) {
      setBestScore(newScore);
      Cookies.set(`best_score_chase_${baseDifficulty}`, newScore.toString(), { expires: 365 });
    }
  };

  // Chaser AI - moves every 5 seconds
  useEffect(() => {
    if (!gameStarted || status === 'gameover') return;
    
    chaserIntervalRef.current = setInterval(() => {
      setChaserPosition((prev) => {
        const newChaserPos = prev + 1;
        setPlayerPosition((playerPos) => {
          const newDistance = playerPos - newChaserPos;
          setDistance(newDistance);
          
          // Check if caught
          if (newDistance <= CATCH_DISTANCE) {
            setStatus('gameover');
            setGameOverReason('CAUGHT BY CHASER!');
            clearInterval(chaserIntervalRef.current!);
            updateBestScore(score);
            return playerPos;
          }
          return playerPos;
        });
        return newChaserPos;
      });
    }, CHASER_SPEED);
    
    return () => {
      if (chaserIntervalRef.current) clearInterval(chaserIntervalRef.current);
    };
  }, [gameStarted, status, score]);

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const getWordForAction = (action: ActionType): string[] => {
    if (action === 'move') return words.medium;
    if (action === 'stun') return words.intermediate;
    if (action === 'shoot') return words.impossible;
    return words.easy;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput || status !== 'spelling') return;

    const isCorrect = userInput.toLowerCase().trim() === currentWord.toLowerCase();
    
    if (isCorrect) {
      setStatus('correct');
      setScore(score + 1);
      confetti({ particleCount: 50, spread: 60 });

      // Apply action
      if (selectedAction === 'move') {
        // Move +1 block
        setPlayerPosition((prev) => {
          const newPos = prev + 1;
          const newDistance = newPos - chaserPosition;
          setDistance(newDistance);
          return newPos;
        });
      } else if (selectedAction === 'stun') {
        // Stun +3 blocks
        setChaserPosition((prev) => prev - 3);
        setPlayerPosition((playerPos) => {
          const newDistance = playerPos - (chaserPosition - 3);
          setDistance(newDistance);
          return playerPos;
        });
      } else if (selectedAction === 'shoot') {
        // Shoot -1 health
        const newHealth = chaserHealth - 1;
        setChaserHealth(newHealth);
        
        if (newHealth <= 0) {
          setStatus('gameover');
          setGameOverReason('CHASER DEFEATED!');
          updateBestScore(score + 1);
          confetti({ particleCount: 100, spread: 120 });
          clearInterval(chaserIntervalRef.current!);
          return;
        }
      }

      // Back to action select after 1 second
      setTimeout(() => {
        setRound(round + 1);
        setStatus('action_select');
        setSelectedAction(null);
      }, 1000);
    } else {
      setStatus('incorrect');
      
      // Wrong answer: chaser moves 1 block
      setChaserPosition((prev) => {
        const newChaserPos = prev + 1;
        setPlayerPosition((playerPos) => {
          const newDistance = playerPos - newChaserPos;
          setDistance(newDistance);
          
          // Check if caught
          if (newDistance <= CATCH_DISTANCE) {
            setStatus('gameover');
            setGameOverReason('CAUGHT BY CHASER!');
            clearInterval(chaserIntervalRef.current!);
            updateBestScore(score);
            return playerPos;
          }
          return playerPos;
        });
        return newChaserPos;
      });

      // Back to action select after 1 second
      setTimeout(() => {
        setStatus('action_select');
        setSelectedAction(null);
      }, 1000);
    }
  };

  const handleActionSelect = (action: ActionType) => {
    if (status !== 'action_select') return;
    
    setSelectedAction(action);
    const wordArray = getWordForAction(action);
    const newWord = wordArray[Math.floor(Math.random() * wordArray.length)];
    setCurrentWord(newWord);
    currentWordRef.current = newWord;
    setUserInput('');
    setStatus('spelling');
    
    // Auto-play word
    setTimeout(() => speakWord(newWord), 300);
  };

  const getDistanceColor = () => {
    if (distance > 3) return 'text-green-400';
    if (distance > 1) return 'text-yellow-400';
    return 'text-red-500';
  };

  if (status === 'gameover') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-8 max-w-md"
        >
          <div className="space-y-4">
            <Trophy className={`w-24 h-24 mx-auto ${gameOverReason.includes('DEFEATED') ? 'text-yellow-400' : 'text-red-500'}`} />
            <h2 className={`text-5xl font-black ${gameOverReason.includes('DEFEATED') ? 'text-yellow-400' : 'text-red-500'}`}>
              {gameOverReason}
            </h2>
          </div>

          <Card className="p-8 space-y-4 bg-white/5 border-white/10">
            <div className="space-y-2">
              <p className="text-muted-foreground">Final Score</p>
              <p className="text-5xl font-bold text-primary">{score}</p>
            </div>
            {score > bestScore && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 flex items-center gap-2"
              >
                <span className="text-yellow-300 font-bold">New Personal Best!</span>
              </motion.div>
            )}
            <div className="text-sm text-muted-foreground">
              Best Score: <span className="text-primary font-bold">{bestScore}</span>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button onClick={() => window.location.reload()} size="lg" className="flex-1">
              Play Again
            </Button>
            <Button onClick={onExit} variant="outline" size="lg" className="flex-1">
              Menu
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-8 p-4">
      {/* Stats Bar */}
      <div className="w-full max-w-2xl flex justify-between items-center">
        <div className="text-center flex-1">
          <p className="text-xs text-muted-foreground">ROUND</p>
          <p className="text-3xl font-bold">{round}</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-xs text-muted-foreground">SCORE</p>
          <p className="text-3xl font-bold text-primary">{score}</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-xs text-muted-foreground">CHASER HEALTH</p>
          <p className="text-2xl font-bold text-red-500">{'❤️ '.repeat(chaserHealth)}</p>
        </div>
      </div>

      {/* Chase Visualization */}
      <div className="w-full max-w-2xl">
        <div className="relative h-32 bg-white/5 rounded-lg border border-white/10 overflow-hidden flex items-center">
          {/* Track line */}
          <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {/* Player - Runner in middle */}
          <motion.div
            animate={{ left: '50%', x: '-50%' }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="absolute"
          >
            <div className="text-6xl">🏃</div>
          </motion.div>

          {/* Chaser - Zombie adjusts based on distance */}
          <motion.div
            animate={{ left: `calc(50% + ${Math.max(0, distance) * 12}px)`, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            className="absolute"
          >
            <div className="text-6xl">🧟</div>
          </motion.div>
        </div>

        {/* Distance Bar */}
        <div className="mt-4">
          <Progress 
            value={Math.max(0, Math.min(100, (distance / 10) * 100))} 
            className="h-2"
          />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Distance: <span className={getDistanceColor()}>{Math.max(0, distance)} blocks</span>
          </p>
        </div>
      </div>

      {/* Game Card */}
      <Card className="w-full max-w-2xl bg-white/5 border-white/10 backdrop-blur-xl p-8 space-y-6">
        {status === 'action_select' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Choose your action:</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Button
                onClick={() => handleActionSelect('move')}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2 border-blue-400/50 hover:border-blue-400 hover:bg-blue-400/10"
                data-testid="button-action-move"
              >
                <Zap className="w-8 h-8 text-blue-400" />
                <span className="text-xs font-bold">MOVE</span>
                <span className="text-xs text-muted-foreground">Medium</span>
              </Button>

              <Button
                onClick={() => handleActionSelect('stun')}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2 border-orange-400/50 hover:border-orange-400 hover:bg-orange-400/10"
                data-testid="button-action-stun"
              >
                <Shield className="w-8 h-8 text-orange-400" />
                <span className="text-xs font-bold">STUN</span>
                <span className="text-xs text-muted-foreground">Intermediate</span>
              </Button>

              <Button
                onClick={() => handleActionSelect('shoot')}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2 border-red-400/50 hover:border-red-400 hover:bg-red-400/10"
                data-testid="button-action-shoot"
              >
                <Crosshair className="w-8 h-8 text-red-400" />
                <span className="text-xs font-bold">SHOOT</span>
                <span className="text-xs text-muted-foreground">Impossible</span>
              </Button>
            </div>

            <div className="flex gap-4 justify-center pt-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onExit}
                data-testid="button-exit-chase"
              >
                Exit
              </Button>
            </div>
          </div>
        )}

        {(status === 'spelling' || status === 'correct' || status === 'incorrect') && (
          <div className="space-y-6">
            {/* Speaker Button */}
            <div className="flex justify-center">
              <Button
                onClick={() => speakWord(currentWord)}
                size="lg"
                className="rounded-full w-24 h-24 p-0"
                disabled={isSpeaking || status !== 'spelling'}
                data-testid="button-speak-chase"
              >
                <Volume2 className={`w-10 h-10 ${isSpeaking ? 'animate-pulse' : ''}`} />
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">Tap speaker to hear the word</p>

            {/* Action Info */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
              <p className="text-xs text-muted-foreground mb-2">CURRENT ACTION</p>
              <p className="font-bold flex items-center justify-center gap-2 capitalize">
                {selectedAction === 'move' && <Zap className="w-4 h-4 text-blue-400" />}
                {selectedAction === 'stun' && <Shield className="w-4 h-4 text-orange-400" />}
                {selectedAction === 'shoot' && <Crosshair className="w-4 h-4 text-red-500" />}
                {selectedAction === 'move' && '+1 Block'}
                {selectedAction === 'stun' && '+3 Blocks Back'}
                {selectedAction === 'shoot' && '-1 Heart'}
              </p>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                animate={status === 'incorrect' ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <Input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type the word..."
                  className="text-center text-2xl font-mono h-16 bg-black/30 border-white/10"
                  autoFocus
                  autoComplete="off"
                  disabled={status !== 'spelling'}
                  data-testid="input-chase-spelling"
                />
              </motion.div>

              <AnimatePresence mode="wait">
                {status === 'incorrect' && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-destructive font-mono font-bold text-center"
                  >
                    Wrong! Chaser moves closer...
                  </motion.p>
                )}
                {status === 'correct' && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-green-500 font-mono font-bold text-center"
                  >
                    Correct! Action applied!
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex gap-4 justify-center pt-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onExit}
                  disabled={status !== 'spelling'}
                  data-testid="button-exit-chase-2"
                >
                  Exit
                </Button>
                <Button 
                  type="submit" 
                  size="lg"
                  className="px-8 font-bold bg-gradient-to-r from-primary to-purple-600"
                  disabled={!userInput || status !== 'spelling'}
                  data-testid="button-submit-chase"
                >
                  Submit <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
}
