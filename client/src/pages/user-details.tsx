import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

const userDetailsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  birthTime: z.string().optional(),
  birthLocation: z.string().min(2, "Birth location is required"),
  unknownBirthTime: z.boolean().default(false)
});

type UserDetailsFormData = z.infer<typeof userDetailsSchema>;

interface UserDetailsPageProps {
  phone: string;
}

export default function UserDetailsPage({ phone }: UserDetailsPageProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [unknownTime, setUnknownTime] = useState(false);

  const form = useForm<UserDetailsFormData>({
    resolver: zodResolver(userDetailsSchema),
    defaultValues: {
      name: "",
      dateOfBirth: "",
      birthTime: "11:00",
      birthLocation: "",
      unknownBirthTime: false
    }
  });

  const registerMutation = useMutation({
    mutationFn: api.registerUser,
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Profile created successfully!"
      });
      setLocation(`/birth-chart/${data.user.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: UserDetailsFormData) => {
    const userData = {
      ...data,
      phone: decodeURIComponent(phone),
      birthTime: unknownTime ? undefined : data.birthTime,
      unknownBirthTime: unknownTime
    };
    
    registerMutation.mutate(userData);
  };

  const goBack = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white font-serif">Tell Us About You</h2>
          <p className="text-gray-300 mt-2">We need these details to create your birth chart</p>
        </div>

        <Card className="cosmic-card border-purple-800/30">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          {...field}
                          className="cosmic-input placeholder-gray-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Date of Birth</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="cosmic-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Birth Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          disabled={unknownTime}
                          className="cosmic-input"
                        />
                      </FormControl>
                      <div className="mt-2">
                        <label className="flex items-center text-sm text-gray-300">
                          <Checkbox
                            checked={unknownTime}
                            onCheckedChange={(checked) => {
                              setUnknownTime(checked as boolean);
                              form.setValue('unknownBirthTime', checked as boolean);
                            }}
                            className="mr-2"
                          />
                          I don't know my exact birth time
                        </label>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Birth Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="City, Country"
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
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creating Profile..." : "Generate My Birth Chart"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Button
          onClick={goBack}
          variant="ghost"
          className="flex items-center justify-center w-full text-gray-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    </div>
  );
}
