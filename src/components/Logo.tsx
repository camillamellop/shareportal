import { useState } from "react";

interface LogoProps {
  className?: string;
  alt?: string;
}

export const Logo = ({ className = "w-8 h-8 lg:w-10 lg:h-10", alt = "Share Brasil Logo" }: LogoProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
    console.error("Erro ao carregar logo");
  };

  if (imageError) {
    return (
      <div className={`${className} bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-xs`}>
        SB
      </div>
    );
  }

  return (
    <img 
      src="/lovable-uploads/10b3df85-4810-4ad8-b85e-b4a6a31530f1.png" 
      alt={alt}
      className={`${className} object-contain`}
      onError={handleImageError}
    />
  );
}; 