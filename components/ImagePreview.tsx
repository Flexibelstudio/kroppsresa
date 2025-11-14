import React, { useState, useEffect } from 'react';
import { ImageIcon } from './icons';

declare const confetti: any;

interface ImagePreviewProps {
  originalImage: string | null;
  generatedImage: string | null;
  isGenerating: boolean;
}

const ImagePlaceholder: React.FC<{ text: string }> = ({ text }) => (
  <div className="w-full aspect-[3/4] bg-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-500">
    <ImageIcon className="w-16 h-16 mb-4" />
    <span className="text-center px-4">{text}</span>
  </div>
);

const LoadingSpinner: React.FC = () => (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center rounded-lg z-30">
        <div className="w-16 h-16 border-4 border-t-primary border-white rounded-full animate-spin"></div>
        <p className="text-white mt-4 font-semibold">AI:n jobbar...</p>
    </div>
);


const ImagePreview: React.FC<ImagePreviewProps> = ({ originalImage, generatedImage, isGenerating }) => {
  const [sliderPos, setSliderPos] = useState(0);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [confettiFired, setConfettiFired] = useState(false);
  
  const triggerConfettiShower = () => {
    if (typeof confetti !== 'function' || confettiFired) return;

    setConfettiFired(true);
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    const interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
            return clearInterval(interval);
        }
        const particleCount = 200 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  useEffect(() => {
    if (generatedImage) {
      setSliderPos(0);
      setConfettiFired(false); // Reset confetti state for new image
    }
  }, [generatedImage]);

  if (!originalImage) {
    return <ImagePlaceholder text="Ladda upp en bild för att starta" />;
  }
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPos = Number(e.target.value);
    setSliderPos(newPos);
    if (newPos > 95 && !confettiFired) {
      triggerConfettiShower();
    }
  };

  const showControls = originalImage && generatedImage && !isGenerating;

  return (
    <div className="w-full max-w-lg mx-auto">
      {showControls && (
        <div className="flex justify-center mb-4">
            <div className="inline-flex rounded-lg shadow-sm" role="group">
                <button
                    type="button"
                    onClick={() => setViewMode('slider')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border border-gray-300 rounded-l-lg ${
                    viewMode === 'slider'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-pressed={viewMode === 'slider'}
                >
                    Jämför (Dra)
                </button>
                <button
                    type="button"
                    onClick={() => setViewMode('side-by-side')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-t border-b border-r border-gray-300 rounded-r-lg ${
                    viewMode === 'side-by-side'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                     aria-pressed={viewMode === 'side-by-side'}
                >
                    Sida vid sida
                </button>
            </div>
        </div>
      )}

      <div className="relative">
        {isGenerating && <LoadingSpinner />}
        
        {viewMode === 'slider' ? (
            <div className="w-full aspect-[3/4] rounded-lg overflow-hidden select-none group shadow-lg">
                <img
                src={originalImage}
                alt="Före"
                className="absolute inset-0 w-full h-full object-cover"
                />
                
                {generatedImage ? (
                <img
                    src={generatedImage}
                    alt="Efter"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                        clipPath: `inset(0 ${100 - sliderPos}% 0 0)`
                    }}
                    />
                ) : (
                    !isGenerating && <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500 z-10">Målbild visas här</div>
                )}
                
                {showControls && (
                <div className="absolute inset-0 z-20">
                    <div
                    className="absolute top-0 bottom-0 w-px bg-white/75 cursor-ew-resize group-hover:bg-white transition-colors"
                    style={{ left: `calc(${sliderPos}% - 0.5px)` }}
                    >
                    <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center transition-transform group-hover:scale-110">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
                    </div>
                    </div>
                    <div className="absolute top-2 left-2 px-3 py-1 bg-black bg-opacity-50 text-white text-sm rounded-full pointer-events-none">Före</div>
                    <div className="absolute top-2 right-2 px-3 py-1 bg-black bg-opacity-50 text-white text-sm rounded-full pointer-events-none">Efter</div>
                </div>
                )}
            </div>
        ) : (
            <div className="grid grid-cols-2 gap-2 md:gap-4">
                <div>
                    <p className="text-center font-semibold mb-2 text-gray-600">Före</p>
                    <img src={originalImage} alt="Före" className="w-full aspect-[3/4] object-cover rounded-lg shadow-md" />
                </div>
                <div>
                    <p className="text-center font-semibold mb-2 text-gray-600">Efter</p>
                    {generatedImage ? (
                        <img src={generatedImage} alt="Efter" className="w-full aspect-[3/4] object-cover rounded-lg shadow-md animate-fade-in-up" />
                    ) : (
                        <div className="w-full aspect-[3/4] bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-center text-sm p-2">
                            Målbild visas här
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>

       {viewMode === 'slider' && showControls && (
        <div className="mt-6 animate-fade-in-up" style={{ animationDelay: '200ms', opacity: 0 }}>
          <p className="text-center text-primary font-medium mb-2">
            Dra i reglaget för att avslöja din transformation!
          </p>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={handleSliderChange}
            className="w-full cursor-ew-resize accent-primary"
            aria-label="Jämför före och efter bild"
          />
        </div>
      )}
    </div>
  );
};

export default ImagePreview;