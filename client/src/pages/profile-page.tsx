import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProfileSchema, type Profile } from "@shared/schema";
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
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import UserNav from "@/components/user-nav";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: profile } = useQuery<Profile>({
    queryKey: [`/api/profiles/${user?.id}`],
    enabled: !!user?.id,
  });

  const form = useForm({
    resolver: zodResolver(insertProfileSchema.partial()),
    defaultValues: profile || {
      headline: "",
      summary: "",
      experience: [],
      education: [],
      skills: [],
      achievements: [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      const method = profile ? "PATCH" : "POST";
      const res = await apiRequest(method, "/api/profiles", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/profiles/${user?.id}`] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 container max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">My Profile</h1>
          <div className="ml-auto">
            <UserNav />
          </div>
        </div>
      </div>

      <main className="container max-w-3xl mx-auto py-8">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Professional Profile</h2>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
                <FormField
                  control={form.control}
                  name="headline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Headline</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Senior Sales Professional with 5+ years in B2B sales" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Summary</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Brief overview of your professional background and key achievements" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Experience</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          value={field.value?.join('\n')}
                          onChange={e => field.onChange(e.target.value.split('\n'))}
                          placeholder="List your work experience (one per line)" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          value={field.value?.join('\n')}
                          onChange={e => field.onChange(e.target.value.split('\n'))}
                          placeholder="List your education (one per line)" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          value={field.value?.join('\n')}
                          onChange={e => field.onChange(e.target.value.split('\n'))}
                          placeholder="List your skills (one per line)" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="achievements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Achievements</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          value={field.value?.join('\n')}
                          onChange={e => field.onChange(e.target.value.split('\n'))}
                          placeholder="List your achievements (one per line)" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  Save Profile
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
