
"use client";

import { useState, useEffect } from 'react';
import { FileText, BrainCircuit, Lightbulb, Sparkles, Search } from 'lucide-react';

const icons = [
  { icon: Search, color: 'text-primary' },
  { icon: FileText, color: 'text-accent' },
  { icon: BrainCircuit, color: 'text-purple-500' },
  { icon: Lightbulb, color: 'text-yellow-500' },
  { icon: Sparkles, color: 'text-pink-500' },
];

const messages = [
  "Waking up the AI... it's not a morning person.",
  "Dusting off the AI's monocle...",
  "Consulting the digital oracle...",
  "Our AI hamsters are spinning the wheels!",
  "Analyzing your resume with digital gusto!",
  "Brewing some brilliant insights for you...",
  "Almost there, just adding extra sparkle!",
  "Teaching the AI some new resume tricks...",
  "Recalibrating the awesomeness meter...",
];

type FunnyLoaderProps = {
  analysisStep: string;
};

export function FunnyLoader({ analysisStep }: FunnyLoaderProps) {
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const iconInterval = setInterval(() => {
      setCurrentIconIndex((prevIndex) => (prevIndex + 1) % icons.length);
    }, 1800); // Change icon every 1.8 seconds

    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3500); // Change message every 3.5 seconds

    return () => {
      clearInterval(iconInterval);
      clearInterval(messageInterval);
    };
  }, []);

  const CurrentIcon = icons[currentIconIndex].icon;
  const iconColor = icons[currentIconIndex].color;

  return (
    <div className="fixed inset-0 bg-background/80 flex flex-col items-center justify-center z-[100] text-center px-4">
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-6">
        {icons.map((iconData, index) => {
          const IconComponent = iconData.icon;
          return (
            <IconComponent
              key={index}
              className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${iconData.color} ${
                index === currentIconIndex ? 'opacity-100 scale-110 rotate-0' : 'opacity-0 scale-90 rotate-[-15deg]'
              }`}
              strokeWidth={1.5}
            />
          );
        })}
      </div>
      <p className="text-lg sm:text-xl font-semibold text-foreground mb-2">
        {messages[currentMessageIndex]}
      </p>
      <p className="text-sm sm:text-md text-muted-foreground">
        Currently conjuring: {analysisStep}
      </p>
      <p className="text-xs sm:text-sm text-muted-foreground mt-1">Hold tight, the magic is brewing!</p>
    </div>
  );
}
