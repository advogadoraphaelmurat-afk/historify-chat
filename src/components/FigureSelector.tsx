import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Figure {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const figures: Figure[] = [
  {
    id: "jesus",
    name: "Jesus de Nazaré",
    description: "Ensinos do amor, perdão e compaixão",
    icon: "✝️"
  },
  {
    id: "socrates",
    name: "Sócrates",
    description: "Filosofia através do questionamento",
    icon: "🏛️"
  },
  {
    id: "cleopatra",
    name: "Cleópatra VII",
    description: "Sabedoria política e diplomática",
    icon: "👑"
  },
  {
    id: "buddha",
    name: "Buda",
    description: "Caminho para iluminação e paz interior",
    icon: "🧘"
  },
  {
    id: "leonardo",
    name: "Leonardo da Vinci",
    description: "Integração entre arte, ciência e inovação",
    icon: "🎨"
  }
];

interface FigureSelectorProps {
  onSelect: (figureId: string, figureName: string) => void;
}

const FigureSelector = ({ onSelect }: FigureSelectorProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-background to-secondary/30">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Sabedoria Ancestral
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Converse com figuras históricas e receba conselhos baseados em seus ensinamentos e escrituras
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {figures.map((figure) => (
            <Card
              key={figure.id}
              className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-primary overflow-hidden"
              onClick={() => onSelect(figure.id, figure.name)}
            >
              <div className="p-6 space-y-3">
                <div className="text-4xl mb-2">{figure.icon}</div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {figure.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {figure.description}
                </p>
                <Button 
                  variant="ghost" 
                  className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  Iniciar conversa
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FigureSelector;
