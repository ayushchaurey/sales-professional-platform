import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertApplicationSchema } from "@shared/schema";
import { Job } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

interface ApplicationFormProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplicationForm({ job, isOpen, onClose }: ApplicationFormProps) {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertApplicationSchema),
    defaultValues: {
      jobId: job.id,
      answers: [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/applications", {
        method: "POST",
        body: data,
      });
      if (!res.ok) throw new Error("Failed to submit application");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    formData.append("jobId", job.id.toString());
    formData.append("answers", JSON.stringify(data.answers));
    
    if (data.resume?.[0]) {
      formData.append("resume", data.resume[0]);
    }

    mutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply for {job.title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="resume"
              render={({ field: { onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Resume</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => onChange(e.target.files)}
                        {...field}
                      />
                      <Button type="button" variant="outline" onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {job.customQuestions?.map((question, index) => (
              <FormField
                key={index}
                control={form.control}
                name={`answers.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{question}</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              Submit Application
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
