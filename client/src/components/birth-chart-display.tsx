import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  // Get planet symbols with colors
  const getPlanetInfo = (planetName: string) => {
    const planetData: { [key: string]: { symbol: string; color: string; shortName: string } } = {
      'Sun': { symbol: '☉', color: 'text-orange-400', shortName: 'Su' },
      'Moon': { symbol: '☽', color: 'text-blue-200', shortName: 'Mo' },
      'Mercury': { symbol: '☿', color: 'text-green-400', shortName: 'Me' },
      'Venus': { symbol: '♀', color: 'text-pink-400', shortName: 'Ve' },
      'Mars': { symbol: '♂', color: 'text-red-400', shortName: 'Ma' },
      'Jupiter': { symbol: '♃', color: 'text-yellow-400', shortName: 'Ju' },
      'Saturn': { symbol: '♄', color: 'text-purple-400', shortName: 'Sa' }
    };
    return planetData[planetName] || { symbol: planetName, color: 'text-gray-400', shortName: planetName.substring(0, 2) };
  };

  // Get sign color
  const getSignColor = (signName: string) => {
    const colors: { [key: string]: string } = {
      'Aries': 'text-red-400', 'Taurus': 'text-green-400', 'Gemini': 'text-yellow-400',
      'Cancer': 'text-blue-400', 'Leo': 'text-orange-400', 'Virgo': 'text-green-300',
      'Libra': 'text-pink-400', 'Scorpio': 'text-red-300', 'Sagittarius': 'text-purple-400',
      'Capricorn': 'text-gray-400', 'Aquarius': 'text-cyan-400', 'Pisces': 'text-blue-300'
    };
    return colors[signName] || 'text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Main Birth Chart */}
      <Card className="cosmic-card border-yellow-500/50 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-serif text-yellow-400">Vedic Birth Chart</CardTitle>
          <p className="text-gray-300 text-sm">North Indian Style</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="aspect-square max-w-lg mx-auto relative">
            {/* Enhanced Vedic Chart Square Layout */}
            <div className="w-full h-full border-4 border-yellow-400 relative bg-gradient-to-br from-gray-900/40 to-purple-900/20 rounded-xl shadow-2xl">
              {/* Chart grid - Vedic style 12 houses */}
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 p-1">
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
                    return (
                      <div key={index} className="border border-yellow-400/30 bg-gradient-to-br from-purple-900/10 to-gray-900/20">
                        <div className="h-full flex items-center justify-center text-yellow-400/20 text-xs font-serif">
                          AstroMind
                        </div>
                      </div>
                    );
                  }

                  const house = houses[houseNumber.toString()];
                  const planetsInHouse = Object.values(planets || {}).filter(
                    (planet: any) => planet.house_number === houseNumber
                  );

                  return (
                    <div key={index} className="border border-yellow-400/50 bg-gradient-to-br from-gray-800/30 to-gray-900/50 p-2 relative overflow-hidden">
                      {/* House number */}
                      <div className="absolute top-1 left-1 text-yellow-400 font-bold text-xs bg-gray-900/80 rounded px-1">
                        {houseNumber}
                      </div>
                      
                      {/* Sign symbol */}
                      {house && (
                        <div className={`absolute top-1 right-1 text-lg ${getSignColor(house.sign_name || house.sign)}`}>
                          {getSignSymbol(house.sign_name || house.sign)}
                        </div>
                      )}
                      
                      {/* Planets in house */}
                      <div className="flex flex-col items-center justify-center h-full space-y-1">
                        {planetsInHouse.map((planet: any, idx: number) => {
                          const planetInfo = getPlanetInfo(planet.name);
                          return (
                            <div 
                              key={idx} 
                              className={`${planetInfo.color} text-sm font-semibold flex items-center space-x-1`}
                              title={`${planet.name} in ${planet.sign_name || planet.sign}`}
                            >
                              <span className="text-lg">{planetInfo.symbol}</span>
                              <span className="text-xs">{planetInfo.shortName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Chart Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Birth Details Card */}
        <Card className="cosmic-card border-blue-500/50 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-blue-400 flex items-center">
              <span className="mr-2">📅</span>
              Birth Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {chartData && (
              <>
                <div className="flex justify-between items-center p-3 bg-blue-900/20 rounded-lg">
                  <span className="text-gray-300">Date:</span>
                  <span className="text-white font-medium">{new Date(chartData.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-900/20 rounded-lg">
                  <span className="text-gray-300">Time:</span>
                  <span className="text-white font-medium">{chartData.time}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-900/20 rounded-lg">
                  <span className="text-gray-300">Location:</span>
                  <span className="text-white font-medium text-sm">{chartData.location}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-900/20 rounded-lg">
                  <span className="text-gray-300">Coordinates:</span>
                  <span className="text-white font-medium text-xs">
                    {chartData.latitude?.toFixed(2)}°, {chartData.longitude?.toFixed(2)}°
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Key Placements Card */}
        <Card className="cosmic-card border-green-500/50 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-green-400 flex items-center">
              <span className="mr-2">⭐</span>
              Key Placements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {planets?.Sun && (
              <div className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-orange-400 text-lg">☉</span>
                  <span className="text-gray-300">Sun:</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{planets.Sun.sign_name || planets.Sun.sign}</div>
                  <div className="text-xs text-gray-400">{planets.Sun.house_number}th House</div>
                </div>
              </div>
            )}
            {planets?.Moon && (
              <div className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-200 text-lg">☽</span>
                  <span className="text-gray-300">Moon:</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{planets.Moon.sign_name || planets.Moon.sign}</div>
                  <div className="text-xs text-gray-400">{planets.Moon.house_number}th House</div>
                </div>
              </div>
            )}
            {houses?.['1'] && (
              <div className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-purple-400 text-lg">↗</span>
                  <span className="text-gray-300">Ascendant:</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{houses['1'].sign_name || houses['1'].sign}</div>
                  <div className="text-xs text-gray-400">1st House</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Planetary Positions Card */}
        <Card className="cosmic-card border-purple-500/50 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-purple-400 flex items-center">
              <span className="mr-2">🪐</span>
              Planetary Positions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-64 overflow-y-auto">
            {Object.entries(planets || {}).map(([planetName, planet]: [string, any]) => {
              const planetInfo = getPlanetInfo(planetName);
              return (
                <div key={planetName} className="flex items-center justify-between p-2 bg-purple-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className={`${planetInfo.color} text-sm`}>{planetInfo.symbol}</span>
                    <span className="text-gray-300 text-sm">{planetName}:</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium text-sm">{planet.sign_name || planet.sign}</div>
                    <div className="text-xs text-gray-400">House {planet.house_number}</div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
