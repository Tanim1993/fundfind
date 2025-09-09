import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSubscriptionSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { InsertSubscription } from "@shared/schema";

export default function SubscriptionForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertSubscription>({
    resolver: zodResolver(insertSubscriptionSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subjects: [],
      degreeLevel: "Both",
      keywords: "",
      isActive: true,
    },
  });

  const createSubscription = useMutation({
    mutationFn: async (data: InsertSubscription) => {
      const response = await apiRequest('POST', '/api/subscriptions', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Successful!",
        description: "You'll receive email notifications for new funding opportunities matching your preferences.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "There was an error creating your subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSubscription) => {
    createSubscription.mutate(data);
  };

  const subjects = [
    "Computer Science",
    "Engineering", 
    "Health & Medicine",
    "Social Sciences",
    "Humanities",
    "Business & Economics"
  ];

  return (
    <section id="subscribe" className="py-16 hero-gradient text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-6">Never Miss a Funding Opportunity</h2>
        <p className="text-xl text-blue-100 mb-8">
          Get personalized email notifications when new funding opportunities match your academic interests
        </p>
        
        <div className="bg-white rounded-2xl p-8 text-gray-900 max-w-2xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="subscription-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="First Name"
                          {...field}
                          data-testid="input-first-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Last Name"
                          {...field}
                          data-testid="input-last-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Email Address"
                        {...field}
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subjects"
                render={() => (
                  <FormItem className="text-left">
                    <FormLabel className="text-sm font-medium text-gray-700 mb-3 block">
                      Academic Interests (Select all that apply)
                    </FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {subjects.map((subject) => (
                        <FormField
                          key={subject}
                          control={form.control}
                          name="subjects"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(subject)}
                                  onCheckedChange={(checked) => {
                                    const updatedSubjects = checked
                                      ? [...(field.value || []), subject]
                                      : (field.value || []).filter((s) => s !== subject);
                                    field.onChange(updatedSubjects);
                                  }}
                                  data-testid={`checkbox-${subject.toLowerCase().replace(/\s+/g, '-')}`}
                                />
                              </FormControl>
                              <Label className="text-sm">{subject}</Label>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="degreeLevel"
                render={({ field }) => (
                  <FormItem className="text-left">
                    <FormLabel className="text-sm font-medium text-gray-700 mb-3 block">
                      Degree Level
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex space-x-4"
                        data-testid="radio-degree-level"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="PhD" id="phd" />
                          <Label htmlFor="phd" className="text-sm">PhD</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Master's" id="masters" />
                          <Label htmlFor="masters" className="text-sm">Master's</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Both" id="both" />
                          <Label htmlFor="both" className="text-sm">Both</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Keywords (optional)"
                        {...field}
                        value={field.value || ""}
                        data-testid="input-keywords"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={createSubscription.isPending}
                className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                data-testid="button-subscribe"
              >
                {createSubscription.isPending ? "Subscribing..." : "Subscribe to Notifications"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
