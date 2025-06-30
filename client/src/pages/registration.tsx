import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Moon } from "lucide-react";

const phoneSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format")
});

type PhoneFormData = z.infer<typeof phoneSchema>;

export default function RegistrationPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: ""
    }
  });

  const onSubmit = async (data: PhoneFormData) => {
    setIsLoading(true);
    try {
      // In a real app, this would involve OTP verification
      // For now, just proceed to user details
      setLocation(`/user-details/${encodeURIComponent(data.phone)}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              <Moon className="text-2xl text-gray-900" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white font-serif">AstroMind</h1>
          <p className="text-gray-300 mt-2">Discover your cosmic blueprint</p>
        </div>

        <Card className="cosmic-card border-purple-800/30">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+1 (555) 123-4567"
                          {...field}
                          className="cosmic-input placeholder-gray-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full cosmic-button py-3 rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Continue Your Journey"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                By continuing, you agree to receive SMS messages for verification
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            ✨ Trusted by thousands of cosmic seekers
          </p>
        </div>
      </div>
    </div>
  );
}
