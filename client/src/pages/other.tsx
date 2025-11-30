import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, ArrowLeft, Infinity, Gamepad2 } from 'lucide-react';

export default function OtherPage() {
  const [, setLocation] = useLocation();

  const modes = [
    { 
      id: 'endless', 
      label: 'Endless', 
      icon: Infinity, 
      color: 'text-cyan-400', 
      bg: 'bg-cyan-400/10',
      desc: 'Pick difficulty, play forever' 
    },
    { 
      id: 'sandbox', 
      label: 'Sandbox', 
      icon: Gamepad2, 
      color: 'text-lime-400', 
      bg: 'bg-lime-400/10',
      desc: 'Customize time, difficulty & rounds' 
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
          onClick={() => setLocation('/')}
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
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-primary to-purple-600 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
            OTHER MODES
          </h1>
          <p className="text-lg text-muted-foreground">Choose your challenge</p>
        </motion.div>

        {/* Mode Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          {modes.map((mode, i) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className="md:col-span-1"
            >
              <Card 
                className="h-full cursor-pointer border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                onClick={() => setLocation(`/other/${mode.id}`)}
                data-testid={`card-other-mode-${mode.id}`}
              >
                <CardContent className="p-8 flex flex-col items-center text-center gap-6 h-full justify-between">
                  <div className={`p-6 rounded-full ${mode.bg} ${mode.color}`}>
                    <mode.icon className="w-12 h-12" />
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl mb-2">{mode.label}</h3>
                    <p className="text-sm text-muted-foreground">{mode.desc}</p>
                  </div>
                  <Button className="w-full mt-4" variant="secondary">
                    {mode.id === 'endless' ? 'Pick Difficulty' : 'Customize'} <Play className="w-4 h-4 ml-2" />
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
