import { Bone, Brain, Dumbbell, Activity, Heart } from "lucide-react";
import physioLogo from "@/assets/physio-logo.png";

interface WelcomeHeroProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  {
    icon: Bone,
    title: "OA Knee",
    query: "Explain OA knee with complete physiotherapy management",
  },
  {
    icon: Dumbbell,
    title: "Rotator Cuff",
    query: "Physiotherapy intervention for rotator cuff tear - phase wise",
  },
  {
    icon: Activity,
    title: "ACL Tear",
    query: "Post-operative rehabilitation protocol for ACL reconstruction",
  },
  {
    icon: Brain,
    title: "Stroke Rehab",
    query: "Upper and lower limb rehabilitation after stroke",
  },
  {
    icon: Heart,
    title: "Frozen Shoulder",
    query: "Explain adhesive capsulitis with radiological findings and treatment",
  },
];

export function WelcomeHero({ onSuggestionClick }: WelcomeHeroProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 animate-fade-in">
      <div className="relative mb-6">
        <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl animate-pulse-subtle" />
        <img 
          src={physioLogo} 
          alt="Physiotherapy AI App" 
          className="relative w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-lg"
        />
      </div>

      <h1 className="mb-3 text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Physio AI Assistant
      </h1>
      
      <p className="mb-2 text-center text-sm text-muted-foreground">
        By Physioankush
      </p>
      
      <p className="mb-8 max-w-md text-center text-muted-foreground">
        Your AI-powered physiotherapy companion for evidence-based clinical guidance, 
        rehabilitation protocols, and exam preparation.
      </p>

      <div className="w-full max-w-2xl">
        <p className="mb-4 text-center text-sm font-medium text-muted-foreground">
          Try asking about:
        </p>
        
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {suggestions.map((item) => (
            <button
              key={item.title}
              onClick={() => onSuggestionClick(item.query)}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-card transition-all hover:border-primary/30 hover:bg-accent hover:shadow-soft"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
