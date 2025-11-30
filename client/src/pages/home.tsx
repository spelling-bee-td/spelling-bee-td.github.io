import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Wand2, Brain, Skull, Zap, Swords, Infinity, Gamepad2, AlertTriangle, Wind } from 'lucide-react';
import heroBg from '@assets/generated_images/abstract_neon_geometric_shapes_on_dark_background.png';

export default function Home() {
  const [, setLocation] = useLocation();
  const [hoveredDifficulty, setHoveredDifficulty] = useState<string | null>(null);
  const [showOtherModes, setShowOtherModes] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'endless' | 'sandbox' | 'hangman' | 'chase' | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [sandboxSettings, setSandboxSettings] = useState({ difficulty: 'easy', timeLimit: '5', wordCount: '10' });

  const difficulties = [
    { 
      id: 'adventure', 
      label: 'Adventure', 
      icon: Swords, 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-400/10',
      desc: '20 Stages. Timer: 5s (3s at end!)',
      colSpan: 'md:col-span-2 lg:col-span-4'
    },
    { 
      id: 'easy', 
      label: 'Easy', 
      icon: Zap, 
      color: 'text-green-400', 
      bg: 'bg-green-400/10',
      desc: 'Simple everyday words' 
    },
    { 
      id: 'medium', 
      label: 'Medium', 
      icon: Brain, 
      color: 'text-blue-400', 
      bg: 'bg-blue-400/10',
      desc: 'Longer, trickier words' 
    },
    { 
      id: 'hard', 
      label: 'Hard', 
      icon: Wand2, 
      color: 'text-purple-400', 
      bg: 'bg-purple-400/10',
      desc: 'Complex patterns' 
    },
    { 
      id: 'intermediate', 
      label: 'Intermediate', 
      icon: Wand2, 
      color: 'text-orange-400', 
      bg: 'bg-orange-400/10',
      desc: '10-13 letter words' 
    },
    { 
      id: 'impossible', 
      label: 'Impossible', 
      icon: Skull, 
      color: 'text-red-400', 
      bg: 'bg-red-400/10',
      desc: 'Endless Mode (Infinite)',
      colSpan: 'md:col-span-2 lg:col-span-4'
    },
  ];

  const endlessDifficulties = ['easy', 'medium', 'hard', 'intermediate'];
  const sandboxDifficulties = ['easy', 'medium', 'hard', 'intermediate', 'impossible'];
  const timeLimits = ['3', '5', '10', '15', '30', 'None'];
  const wordCounts = ['5', '10', '20', '50', '100'];

  const handleStartEndless = () => {
    setLocation(`/play/${selectedDifficulty}-endless`);
  };

  const handleStartSandbox = () => {
    const params = `${sandboxSettings.difficulty}-sandbox-${sandboxSettings.timeLimit}-${sandboxSettings.wordCount}`;
    setLocation(`/play/${params}`);
  };

  const handleStartHangman = () => {
    setLocation(`/play/${selectedDifficulty}-hangman`);
  };

  const handleStartChase = () => {
    setLocation(`/chase/${selectedDifficulty}-chase`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden p-4">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-background/90 to-background/40" />

      <div className="relative z-10 max-w-4xl w-full flex flex-col items-center gap-12">
        {/* Header */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-4"
        >
          <Badge variant="outline" className="border-primary/50 text-primary mb-4 animate-pulse">
            AI Powered Learning
          </Badge>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-primary to-purple-600 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
            SPELLING<br/>BEE
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto font-light">
            by <span className="text-white font-medium">TagsDesign</span>
          </p>
        </motion.div>

        {/* Difficulty Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {difficulties.map((diff, i) => (
            <motion.div
              key={diff.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              onHoverStart={() => setHoveredDifficulty(diff.id)}
              onHoverEnd={() => setHoveredDifficulty(null)}
              className={diff.colSpan || ''}
            >
              <Card 
                className={`
                  h-full cursor-pointer border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300
                  ${hoveredDifficulty === diff.id ? 'border-primary/50 scale-105 shadow-[0_0_30px_rgba(59,130,246,0.2)]' : ''}
                  ${diff.id === 'adventure' ? 'border-yellow-400/30 bg-yellow-400/5' : ''}
                  ${diff.id === 'impossible' ? 'border-red-400/30 bg-red-400/5' : ''}
                `}
                onClick={() => setLocation(`/play/${diff.id}`)}
                data-testid={`card-difficulty-${diff.id}`}
              >
                <CardContent className="p-6 flex flex-col items-center text-center gap-4 h-full justify-between">
                  <div className={`p-4 rounded-full ${diff.bg} ${diff.color}`}>
                    <diff.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">{diff.label}</h3>
                    <p className="text-sm text-muted-foreground">{diff.desc}</p>
                  </div>
                  <Button className="w-full mt-4" variant={hoveredDifficulty === diff.id ? "default" : "secondary"}>
                    Start <Play className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Other Gamemode Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full"
        >
          <h2 className="text-center text-2xl font-bold text-primary mb-6 flex items-center justify-center gap-2">
            <Infinity className="w-6 h-6" />
            Other Gamemode
          </h2>

          {/* Other Modes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
            {/* Endless Mode */}
            <Card className="border-cyan-400/30 bg-cyan-400/5 glass-panel hover:bg-cyan-400/10 transition-all cursor-pointer" 
              onClick={() => {
                setShowOtherModes(true);
                setSelectedMode('endless');
                setSelectedDifficulty('easy');
              }}
              data-testid="card-other-endless"
            >
              <CardContent className="p-8 flex flex-col items-center text-center gap-6 h-full justify-between">
                <div className="p-6 rounded-full bg-cyan-400/10 text-cyan-400">
                  <Infinity className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl mb-2">Endless</h3>
                  <p className="text-sm text-muted-foreground">Pick difficulty, play forever</p>
                </div>
                <Button className="w-full mt-4" variant="secondary">
                  Pick Difficulty <Play className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Sandbox Mode */}
            <Card className="border-lime-400/30 bg-lime-400/5 glass-panel hover:bg-lime-400/10 transition-all cursor-pointer"
              onClick={() => {
                setShowOtherModes(true);
                setSelectedMode('sandbox');
              }}
              data-testid="card-other-sandbox"
            >
              <CardContent className="p-8 flex flex-col items-center text-center gap-6 h-full justify-between">
                <div className="p-6 rounded-full bg-lime-400/10 text-lime-400">
                  <Gamepad2 className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl mb-2">Sandbox</h3>
                  <p className="text-sm text-muted-foreground">Customize time, difficulty & rounds</p>
                </div>
                <Button className="w-full mt-4" variant="secondary">
                  Customize <Play className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Hangman Mode */}
            <Card className="border-red-400/30 bg-red-400/5 glass-panel hover:bg-red-400/10 transition-all cursor-pointer"
              onClick={() => {
                setShowOtherModes(true);
                setSelectedMode('hangman');
                setSelectedDifficulty('easy');
              }}
              data-testid="card-other-hangman"
            >
              <CardContent className="p-8 flex flex-col items-center text-center gap-6 h-full justify-between">
                <div className="p-6 rounded-full bg-red-400/10 text-red-400">
                  <AlertTriangle className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl mb-2">Hangman</h3>
                  <p className="text-sm text-muted-foreground">Pick difficulty, lose on wrong answers</p>
                </div>
                <Button className="w-full mt-4" variant="secondary">
                  Pick Difficulty <Play className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Chase Mode */}
            <Card className="border-orange-400/30 bg-orange-400/5 glass-panel hover:bg-orange-400/10 transition-all cursor-pointer"
              onClick={() => {
                setShowOtherModes(true);
                setSelectedMode('chase');
                setSelectedDifficulty('easy');
              }}
              data-testid="card-other-chase"
            >
              <CardContent className="p-8 flex flex-col items-center text-center gap-6 h-full justify-between">
                <div className="p-6 rounded-full bg-orange-400/10 text-orange-400">
                  <Wind className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl mb-2">Chase</h3>
                  <p className="text-sm text-muted-foreground">Outrun the chaser with perfect spelling</p>
                </div>
                <Button className="w-full mt-4" variant="secondary">
                  Pick Difficulty <Play className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Mode Selection Modal */}
      {showOtherModes && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowOtherModes(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-background/95 backdrop-blur-xl border border-white/10 rounded-xl p-8 max-w-2xl w-full"
          >
            {selectedMode === 'endless' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold flex items-center gap-2 text-cyan-400">
                  <Infinity className="w-6 h-6" /> Endless Mode
                </h3>
                <p className="text-muted-foreground">Pick a difficulty level to play endless words</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {endlessDifficulties.map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-3 px-4 rounded-lg font-semibold transition-all capitalize ${
                        selectedDifficulty === diff
                          ? 'bg-cyan-500 text-background'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                      data-testid={`button-endless-${diff}`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>

                <div className="flex gap-4 justify-end">
                  <Button variant="ghost" onClick={() => setShowOtherModes(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="bg-cyan-500 hover:bg-cyan-600"
                    onClick={handleStartEndless}
                    data-testid="button-start-endless"
                  >
                    Start <Play className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {selectedMode === 'sandbox' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold flex items-center gap-2 text-lime-400">
                  <Gamepad2 className="w-6 h-6" /> Sandbox Mode
                </h3>
                <p className="text-muted-foreground">Customize your perfect spelling challenge</p>
                
                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-semibold mb-3 uppercase">Difficulty</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {sandboxDifficulties.map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setSandboxSettings({...sandboxSettings, difficulty: diff})}
                        className={`py-2 px-3 rounded text-sm font-semibold capitalize transition-all ${
                          sandboxSettings.difficulty === diff
                            ? 'bg-lime-500 text-background'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                        data-testid={`button-sandbox-diff-${diff}`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Limit */}
                <div>
                  <label className="block text-sm font-semibold mb-3 uppercase">Time Limit Per Word</label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {timeLimits.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSandboxSettings({...sandboxSettings, timeLimit: time})}
                        className={`py-2 px-2 rounded text-sm font-semibold transition-all ${
                          sandboxSettings.timeLimit === time
                            ? 'bg-lime-500 text-background'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                        data-testid={`button-sandbox-time-${time}`}
                      >
                        {time === 'None' ? '∞' : `${time}s`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Word Count */}
                <div>
                  <label className="block text-sm font-semibold mb-3 uppercase">Words To Complete</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {wordCounts.map((count) => (
                      <button
                        key={count}
                        onClick={() => setSandboxSettings({...sandboxSettings, wordCount: count})}
                        className={`py-2 px-3 rounded text-sm font-semibold transition-all ${
                          sandboxSettings.wordCount === count
                            ? 'bg-lime-500 text-background'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                        data-testid={`button-sandbox-count-${count}`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 justify-end pt-4">
                  <Button variant="ghost" onClick={() => setShowOtherModes(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="bg-lime-500 hover:bg-lime-600"
                    onClick={handleStartSandbox}
                    data-testid="button-start-sandbox"
                  >
                    Start <Play className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {selectedMode === 'hangman' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-6 h-6" /> Hangman Mode
                </h3>
                <p className="text-muted-foreground">Pick a difficulty - 6 wrong answers = game over!</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {endlessDifficulties.map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-3 px-4 rounded-lg font-semibold transition-all capitalize ${
                        selectedDifficulty === diff
                          ? 'bg-red-500 text-background'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                      data-testid={`button-hangman-${diff}`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>

                <div className="flex gap-4 justify-end">
                  <Button variant="ghost" onClick={() => setShowOtherModes(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="bg-red-500 hover:bg-red-600"
                    onClick={handleStartHangman}
                    data-testid="button-start-hangman"
                  >
                    Start <Play className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {selectedMode === 'chase' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold flex items-center gap-2 text-orange-400">
                  <Wind className="w-6 h-6" /> Chase Mode
                </h3>
                <p className="text-muted-foreground">Spell correctly to stay ahead. Chaser moves every 5 seconds!</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {endlessDifficulties.map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-3 px-4 rounded-lg font-semibold transition-all capitalize ${
                        selectedDifficulty === diff
                          ? 'bg-orange-500 text-background'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                      data-testid={`button-chase-${diff}`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>

                <div className="flex gap-4 justify-end">
                  <Button variant="ghost" onClick={() => setShowOtherModes(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={handleStartChase}
                    data-testid="button-start-chase"
                  >
                    Start <Play className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
      
      {/* Footer */}
      <div className="absolute bottom-4 text-white/20 text-sm font-mono">
        v1.0.0 • TagsDesign
      </div>
    </div>
  );
}
