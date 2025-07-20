import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import logoOriginal from '@/assets/motorise-logo.jpg';
import logoTech from '@/assets/motorise-logo-tech.jpg';
import logoModern from '@/assets/motorise-logo-modern.jpg';
import logoClean from '@/assets/motorise-logo-clean.jpg';

interface LogoOption {
  id: string;
  name: string;
  src: string;
  style: 'image' | 'icon';
  description: string;
}

const logoOptions: LogoOption[] = [
  {
    id: 'original',
    name: 'Original Tech',
    src: logoOriginal,
    style: 'image',
    description: 'Code-focused design'
  },
  {
    id: 'tech',
    name: 'Colorful Tech',
    src: logoTech,
    style: 'image', 
    description: 'Vibrant code display'
  },
  {
    id: 'modern',
    name: 'Modern Laptop',
    src: logoModern,
    style: 'image',
    description: 'Clean laptop design'
  },
  {
    id: 'clean',
    name: 'Minimalist',
    src: logoClean,
    style: 'image',
    description: 'Simple glass design'
  },
  {
    id: 'icon',
    name: 'Electric Icon',
    src: '',
    style: 'icon',
    description: 'Lightning bolt icon'
  }
];

interface LogoSelectorProps {
  currentLogo: string;
  onLogoChange: (logoSrc: string, isIcon: boolean) => void;
}

export const LogoSelector: React.FC<LogoSelectorProps> = ({ currentLogo, onLogoChange }) => {
  const [selectedLogo, setSelectedLogo] = useState(currentLogo);

  const handleLogoSelect = (option: LogoOption) => {
    setSelectedLogo(option.src);
    onLogoChange(option.src, option.style === 'icon');
  };

  return (
    <div className="fixed top-20 right-4 z-50 bg-white/95 backdrop-blur-sm p-4 rounded-lg border shadow-lg max-w-sm">
      <h3 className="font-semibold text-lg mb-3">Choose Logo Style</h3>
      <div className="grid grid-cols-2 gap-3">
        {logoOptions.map((option) => (
          <Card 
            key={option.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedLogo === option.src ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleLogoSelect(option)}
          >
            <CardContent className="p-3">
              <div className="flex flex-col items-center space-y-2">
                {option.style === 'icon' ? (
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                ) : (
                  <img 
                    src={option.src} 
                    alt={option.name}
                    className="h-12 w-auto object-contain rounded"
                  />
                )}
                <div className="text-center">
                  <div className="text-xs font-medium">{option.name}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};