import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, ArrowLeft, Gamepad2 } from 'lucide-react';

export default function OtherSandboxPage() {
  const [, setLocation] = useLocation();
  const [difficulty, setDifficulty] = useState('easy');
  const [timeLimit, setTimeLimit] = useState('5');
  const [wordCount, setWordCount] = useState('10');

  const difficulties = ['easy', 'medium', 'hard', 'intermediate', 'impossible'];
  const timeLimits = ['3', '5', '10', '15', '30', 'None'];
  const wordCounts = ['5', '10', '20', '50', '100'];

  const handleStart = () => {
    if (wordCount === '0') return;
    const params = `${difficulty}-sandbox-${timeLimit}-${wordCount}`;
    setLocation(`/play/${params}`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden p-4">
      {/* Ambient Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Nav */}
      <div className="absolute top-4 left-4 z-50">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLocation('/other')}
          className="gap-2 hover:bg-white/5"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>

      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center gap-12">
        {/* Header */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2 text-lime-400 mb-4">
            <Gamepad2 className="w-6 h-6" />
            <span className="font-bold">SANDBOX MODE</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-primary to-purple-600 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
            CUSTOMIZE YOUR GAME
          </h1>
        </motion.div>

        {/* Settings Card */}
        <Card className="w-full glass-panel border-white/10 bg-white/5 backdrop-blur-sm p-8">
          <CardContent className="space-y-8">
            
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
                Difficulty
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`py-3 px-4 rounded-lg font-semibold transition-all capitalize ${
                      difficulty === diff
                        ? 'bg-primary text-background border-primary/50'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                    data-testid={`button-difficulty-${diff}`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Limit */}
            <div>
              <label className="block text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
                Time Limit Per Word
              </label>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                {timeLimits.map((time) => (
                  <button
                    key={time}
                    onClick={() => setTimeLimit(time)}
                    className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                      timeLimit === time
                        ? 'bg-primary text-background border-primary/50'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                    data-testid={`button-time-${time}`}
                  >
                    {time === 'None' ? '∞' : `${time}s`}
                  </button>
                ))}
              </div>
            </div>

            {/* Word Count */}
            <div>
              <label className="block text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
                Words To Complete
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {wordCounts.map((count) => (
                  <button
                    key={count}
                    onClick={() => setWordCount(count)}
                    className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                      wordCount === count
                        ? 'bg-primary text-background border-primary/50'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                    data-testid={`button-count-${count}`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="pt-6 border-t border-white/10">
              <p className="text-center text-muted-foreground mb-6">
                Play <span className="font-bold text-primary">{wordCount} words</span> in <span className="font-bold text-primary">{difficulty}</span> mode{' '}
                {timeLimit !== 'None' ? (
                  <>with <span className="font-bold text-primary">{timeLimit}s</span> per word</>
                ) : (
                  <>with <span className="font-bold text-primary">no time limit</span></>
                )}
              </p>
            </div>

            {/* Start Button */}
            <Button
              onClick={handleStart}
              size="lg"
              className="w-full bg-gradient-to-r from-lime-500 to-green-600 hover:opacity-90 transition-opacity text-background font-bold"
              data-testid="button-start-sandbox"
            >
              Start Sandbox <Play className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
