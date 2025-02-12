import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertJobSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import UserNav from "@/components/user-nav";
import { useState } from "react";
import { Plus, X } from "lucide-react";

export default function PostJob() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [questions, setQuestions] = useState<string[]>([""]);

  const form = useForm({
    resolver: zodResolver(insertJobSchema),
    defaultValues: {
      location: user?.location || "",
      title: "",
      description: "",
      customQuestions: [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = {
        ...data,
        customQuestions: questions.filter(q => q.trim() !== ""),
      };
      const res = await apiRequest("POST", "/api/jobs", formData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Job Posted",
        description: "Your job has been successfully posted.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addQuestion = () => {
    setQuestions([...questions, ""]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 container max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">Post a New Job</h1>
          <div className="ml-auto">
            <UserNav />
          </div>
        </div>
      </div>

      <main className="container max-w-2xl mx-auto py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Custom Questions for Applicants</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addQuestion}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
              {questions.map((question, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={question}
                    onChange={(e) => updateQuestion(index, e.target.value)}
                    placeholder="Enter your question here"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              Post Job
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}