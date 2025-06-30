import { Card, CardContent } from "@/components/ui/card";

interface BirthChartDisplayProps {
  birthChart: any;
}

export default function BirthChartDisplay({ birthChart }: BirthChartDisplayProps) {
  if (!birthChart) {
    return (
      <Card className="cosmic-card border-purple-800/30">
        <CardContent className="p-8 text-center">
          <p className="text-gray-300">Birth chart data not available</p>
        </CardContent>
      </Card>
    );
  }

  const { planets, houses, chartData } = birthChart;

  // Get zodiac sign symbols
  const getSignSymbol = (signName: string) => {
    const symbols: { [key: string]: string } = {
      'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
      'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
      'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
    };
    return symbols[signName] || signName;
  };

  // Get planet symbols
  const getPlanetSymbol = (planetName: string) => {
    const symbols: { [key: string]: string } = {
      'Sun': '☉', 'Moon': '☽', 'Mercury': '☿', 'Venus': '♀',
      'Mars': '♂', 'Jupiter': '♃', 'Saturn': '♄'
    };
    return symbols[planetName] || planetName;
  };

  return (
    <Card className="cosmic-card border-purple-800/30 mb-8">
      <CardContent className="p-8">
        <div className="aspect-square max-w-md mx-auto relative">
          {/* Vedic Chart Square Layout */}
          <div className="w-full h-full border-2 border-yellow-500 relative bg-gray-900/30 rounded-lg">
            {/* Chart grid - Vedic style 12 houses */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
              {/* House layout in Vedic style */}
              {Array.from({ length: 16 }, (_, index) => {
                const houseNumbers = [
                  1, 2, 3, 4,    // Top row
                  12, 0, 0, 5,   // Second row (0 = empty center cells)
                  11, 0, 0, 6,   // Third row
                  10, 9, 8, 7    // Bottom row
                ];
                
                const houseNumber = houseNumbers[index];
                if (houseNumber === 0) {
                  return <div key={index} className="border border-yellow-500/30"></div>;
                }

                const house = houses[houseNumber.toString()];
                const planetsInHouse = Object.values(planets || {}).filter(
                  (planet: any) => planet.house_number === houseNumber
                );

                return (
                  <div key={index} className="border border-yellow-500/30 flex flex-col items-center justify-center text-xs p-1">
                    <div className="text-yellow-500 font-semibold">{houseNumber}</div>
                    {house && (
                      <div className="text-gray-300 text-[10px]">
                        {getSignSymbol(house.sign_name || house.sign)}
                      </div>
                    )}
                    {planetsInHouse.map((planet: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="text-purple-300 text-[10px]"
                        title={`${planet.name} in ${planet.sign_name || planet.sign}`}
                      >
                        {getPlanetSymbol(planet.name)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900/30 rounded-lg p-4">
            <h4 className="text-yellow-500 font-semibold mb-2">Birth Details</h4>
            <div className="space-y-1 text-sm text-gray-300">
              {chartData && (
                <>
                  <div>Date: <span>{chartData.date}</span></div>
                  <div>Time: <span>{chartData.time}</span></div>
                  <div>Location: <span>{chartData.location}</span></div>
                </>
              )}
            </div>
          </div>
          <div className="bg-gray-900/30 rounded-lg p-4">
            <h4 className="text-yellow-500 font-semibold mb-2">Key Placements</h4>
            <div className="space-y-1 text-sm text-gray-300">
              {planets?.Sun && (
                <div>Sun: {planets.Sun.sign_name || planets.Sun.sign} ({planets.Sun.house_number}th House)</div>
              )}
              {planets?.Moon && (
                <div>Moon: {planets.Moon.sign_name || planets.Moon.sign} ({planets.Moon.house_number}th House)</div>
              )}
              {houses?.['1'] && (
                <div>Ascendant: {houses['1'].sign_name || houses['1'].sign}</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
