import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, HelpCircle, BarChart3 } from "lucide-react";

interface MainPageProps {
  userId: string;
}

export default function MainPage({ userId }: MainPageProps) {
  const [, setLocation] = useLocation();
  const userIdNum = parseInt(userId);

  const { data: botsData, isLoading } = useQuery({
    queryKey: ['/api/bots'],
    queryFn: api.getBots
  });

  const selectBot = (botId: string) => {
    setLocation(`/chat/${userId}/${botId}`);
  };

  const viewBirthChart = () => {
    setLocation(`/birth-chart/${userId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Skeleton className="h-10 w-48 mx-auto mb-2 bg-gray-700" />
            <Skeleton className="h-4 w-32 mx-auto bg-gray-700" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 bg-gray-700" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white font-serif mb-2">AstroMind</h1>
          <p className="text-gray-300">Choose your cosmic guide</p>
        </div>

        {/* User Profile Card */}
        <Card className="cosmic-card border-purple-800/30 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">U</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white">Welcome Back</h3>
                <p className="text-gray-400">Ready to explore the cosmos?</p>
              </div>
              <Button 
                onClick={viewBirthChart}
                variant="outline"
                size="sm"
                className="text-gray-300 border-purple-800/60 hover:border-purple-800 hover:text-white"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View Chart
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Astrology Bots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {botsData?.bots?.map((bot: any) => (
            <Card 
              key={bot.id}
              className="cosmic-card border-purple-800/30 hover:border-yellow-500/50 transition-all hover:transform hover:scale-[1.02] cursor-pointer relative overflow-hidden"
              onClick={() => selectBot(bot.id)}
            >
              <div className="star-field absolute inset-0 opacity-20"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${bot.color} rounded-full flex items-center justify-center`}>
                    <i className={`${bot.icon} text-white text-lg`}></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{bot.name}</h3>
                    <p className="text-xs text-gray-400">{bot.specialization}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  {bot.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-gray-400">Online</span>
                  </div>
                  <span className="text-xs text-yellow-500">★ {bot.rating}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-4 cosmic-card rounded-full px-8 py-4 border-purple-800/30">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={viewBirthChart}
              className="flex items-center space-x-2 text-gray-300 hover:text-white"
            >
              <BarChart3 className="h-4 w-4" />
              <span>View Birth Chart</span>
            </Button>
            <div className="w-px h-6 bg-purple-800/30"></div>
            <Button 
              variant="ghost" 
              size="sm"
              className="flex items-center space-x-2 text-gray-300 hover:text-white"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
            <div className="w-px h-6 bg-purple-800/30"></div>
            <Button 
              variant="ghost" 
              size="sm"
              className="flex items-center space-x-2 text-gray-300 hover:text-white"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Help</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
