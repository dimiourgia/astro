import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import BirthChartDisplay from "@/components/birth-chart-display";
import { Skeleton } from "@/components/ui/skeleton";

interface BirthChartPageProps {
  userId: string;
}

export default function BirthChartPage({ userId }: BirthChartPageProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const userIdNum = parseInt(userId);

  const { data: chartData, isLoading: chartLoading, error: chartError } = useQuery({
    queryKey: ['/api/birth-chart', userIdNum],
    queryFn: () => api.getBirthChart(userIdNum)
  });

  const generateChartMutation = useMutation({
    mutationFn: () => api.generateBirthChart(userIdNum),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Birth chart generated successfully!"
      });
      // Refetch the chart data after successful generation
      window.location.reload();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate birth chart",
        variant: "destructive"
      });
    }
  });

  // Auto-generate chart if not found (run only once)
  useEffect(() => {
    if (chartError && !generateChartMutation.isPending && !chartData) {
      generateChartMutation.mutate();
    }
  }, [chartError]); // Removed generateChartMutation from dependencies to prevent infinite loop

  const startChat = () => {
    setLocation(`/main/${userId}`);
  };

  const goBack = () => {
    setLocation('/');
  };

  if (chartLoading || generateChartMutation.isPending) {
    return (
      <div className="min-h-screen flex flex-col p-4">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white font-serif">Generating Your Birth Chart</h2>
            <p className="text-gray-300 mt-2">Please wait while we calculate your cosmic blueprint...</p>
          </div>
          
          <Card className="cosmic-card border-purple-800/30 mb-8">
            <CardContent className="p-8">
              <div className="aspect-square max-w-md mx-auto">
                <Skeleton className="w-full h-full bg-gray-700" />
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-24 bg-gray-700" />
                <Skeleton className="h-24 bg-gray-700" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!chartData?.birthChart) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="cosmic-card border-purple-800/30">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold text-white mb-4">Chart Generation Failed</h3>
            <p className="text-gray-300 mb-6">We couldn't generate your birth chart. Please try again.</p>
            <Button onClick={() => generateChartMutation.mutate()} className="cosmic-button">
              Retry Generation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white font-serif">Your Birth Chart</h2>
          <p className="text-gray-300 mt-2">Here's your cosmic blueprint</p>
        </div>

        <BirthChartDisplay birthChart={chartData.birthChart} />

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button 
            onClick={startChat}
            className="flex-1 cosmic-button py-4 px-6 rounded-xl"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Start Astrology Chat
          </Button>
          <Button 
            onClick={goBack}
            variant="outline"
            className="px-6 py-4 text-gray-300 border-purple-800/60 hover:border-purple-800 hover:text-white rounded-xl"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
