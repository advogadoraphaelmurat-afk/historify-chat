import { useState } from "react";
import FigureSelector from "@/components/FigureSelector";
import ChatInterface from "@/components/ChatInterface";

const Index = () => {
  const [selectedFigure, setSelectedFigure] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleSelectFigure = (id: string, name: string) => {
    setSelectedFigure({ id, name });
  };

  const handleBack = () => {
    setSelectedFigure(null);
  };

  if (selectedFigure) {
    return (
      <ChatInterface
        figureId={selectedFigure.id}
        figureName={selectedFigure.name}
        onBack={handleBack}
      />
    );
  }

  return <FigureSelector onSelect={handleSelectFigure} />;
};

export default Index;
