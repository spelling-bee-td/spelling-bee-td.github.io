import { useParams, useLocation } from 'wouter';
import ChaseGame from '@/components/ChaseGame';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ChasePage() {
  const { difficulty } = useParams<{ difficulty: string }>();
  const [, setLocation] = useLocation();

  const validDifficulties = ['easy', 'medium', 'hard', 'intermediate'];
  const baseDifficulty = difficulty?.replace('-chase', '') || 'easy';
  const isValid = validDifficulties.includes(baseDifficulty);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-red-400/20 blur-[120px] rounded-full pointer-events-none" />

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

      <ChaseGame 
        difficulty={isValid ? `${baseDifficulty}-chase` : 'easy-chase'}
        onExit={() => setLocation('/')}
      />
    </div>
  );
}
