import { useParams, useLocation } from 'wouter';
import Game from '@/components/Game';
import { Difficulty } from '@/lib/words';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PlayPage() {
  const { difficulty } = useParams<{ difficulty: Difficulty }>();
  const [, setLocation] = useLocation();

  // Validate difficulty (allow -endless, -sandbox, and -hangman suffixes)
  const validDifficulties: Difficulty[] = ['easy', 'medium', 'hard', 'intermediate', 'impossible', 'adventure'];
  const isValidDifficulty = validDifficulties.includes(difficulty as Difficulty) || 
    (difficulty && (
      validDifficulties.some(d => difficulty.startsWith(d + '-endless')) ||
      validDifficulties.some(d => difficulty.startsWith(d + '-sandbox-')) ||
      validDifficulties.some(d => difficulty.startsWith(d + '-hangman'))
    ));
  const currentDifficulty = isValidDifficulty ? (difficulty as Difficulty) : 'easy';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Nav */}
      <div className="absolute top-4 left-4 z-50">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLocation('/')}
          className="gap-2 hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Menu
        </Button>
      </div>

      <Game 
        difficulty={currentDifficulty} 
        onExit={() => setLocation('/')}
      />
    </div>
  );
}
