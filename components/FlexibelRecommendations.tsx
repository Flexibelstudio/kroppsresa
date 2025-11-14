import React from 'react';

const FlexibelRecommendations: React.FC = () => {
  return (
    <div className="space-y-4 text-center">
      <h2 className="text-3xl font-bold text-gray-800">Redo att börja din resa?</h2>

      <div className="max-w-xl mx-auto">
        <p className="text-lg text-gray-700">
          Boka ett gratis introsamtal (No Sweat Intro) – vi tar fram din personliga plan tillsammans.
        </p>
      </div>

      <div className="pt-4">
        <a
          href="https://www.flexibelfriskvardhalsa.se/boka-introsamtal"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full sm:w-auto text-white bg-primary hover:bg-primary-light focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-lg px-10 py-4 text-center transition-colors shadow-lg hover:shadow-xl"
        >
          Boka gratis introsamtal
        </a>
        <p className="text-sm text-gray-500 mt-3">
            Samtalet är helt kostnadsfritt och utan förpliktelser.
        </p>
      </div>
    </div>
  );
};

export default FlexibelRecommendations;
