import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Wand2, Brain, Skull, Zap, ArrowLeft, Infinity } from 'lucide-react';

export default function OtherEndlessPage() {
  const [, setLocation] = useLocation();

  const difficulties = [
    { 
      id: 'easy', 
      label: 'Easy Endless', 
      icon: Zap, 
      color: 'text-green-400', 
      bg: 'bg-green-400/10',
      desc: '3-5 letter words' 
    },
    { 
      id: 'medium', 
      label: 'Medium Endless', 
      icon: Brain, 
      color: 'text-blue-400', 
      bg: 'bg-blue-400/10',
      desc: 'Longer words' 
    },
    { 
      id: 'hard', 
      label: 'Hard Endless', 
      icon: Wand2, 
      color: 'text-purple-400', 
      bg: 'bg-purple-400/10',
      desc: 'Complex words' 
    },
    { 
      id: 'intermediate', 
      label: 'Intermediate Endless', 
      icon: Wand2, 
      color: 'text-orange-400', 
      bg: 'bg-orange-400/10',
      desc: '10-13 letter words' 
    },
  ];

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

      <div className="relative z-10 max-w-4xl w-full flex flex-col items-center gap-12">
        {/* Header */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2 text-primary mb-4">
            <Infinity className="w-6 h-6" />
            <span className="font-bold">ENDLESS MODE</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-primary to-purple-600 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
            PICK DIFFICULTY
          </h1>
        </motion.div>

        {/* Difficulty Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
          {difficulties.map((diff, i) => (
            <motion.div
              key={diff.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
            >
              <Card 
                className="h-full cursor-pointer border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                onClick={() => setLocation(`/play/${diff.id}-endless`)}
                data-testid={`card-endless-${diff.id}`}
              >
                <CardContent className="p-6 flex flex-col items-center text-center gap-4 h-full justify-between">
                  <div className={`p-4 rounded-full ${diff.bg} ${diff.color}`}>
                    <diff.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">{diff.label}</h3>
                    <p className="text-sm text-muted-foreground">{diff.desc}</p>
                  </div>
                  <Button className="w-full mt-4" variant="secondary">
                    Start <Play className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
