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
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import UserNav from "@/components/user-nav";
import { Briefcase, Building2, Users, Calendar } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const { data: profile } = useQuery<Profile>({
    queryKey: [`/api/profiles/${user?.id}`],
    enabled: !!user?.id,
  });

  const form = useForm({
    resolver: zodResolver(insertProfileSchema.partial()),
    defaultValues: {
      headline: profile?.headline ?? "",
      summary: profile?.summary ?? "",
      experience: profile?.experience ?? [],
      education: profile?.education ?? [],
      skills: profile?.skills ?? [],
      achievements: profile?.achievements ?? [],
      website: profile?.website ?? "",
      industry: profile?.industry ?? "",
      companySize: profile?.companySize ?? "",
      foundedYear: profile?.foundedYear ?? "",
      profilePicture: profile?.profilePicture ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const method = profile ? "PATCH" : "POST";
      const res = await fetch("/api/profiles", {
        method,
        body: data,
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/profiles/${user?.id}`] });
      setShowSuccessDialog(true);
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

    // Append profile picture if provided
    if (data.profilePicture instanceof File) {
      formData.append("profilePicture", data.profilePicture);
    }

    // Append other form data
    Object.entries(data).forEach(([key, value]) => {
      if (key !== "profilePicture") {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value.filter(Boolean)));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      }
    });

    mutation.mutate(formData);
  };

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
            <h2 className="text-2xl font-semibold">Professional Profile</h2>
            <CardDescription>
              {user?.role === "company"
                ? "Share information about your company with potential candidates"
                : "Share your professional experience and skills with potential employers"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Profile Picture Upload */}
                <FormField
                  control={form.control}
                  name="profilePicture"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Profile Picture</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          {profile?.profilePicture && (
                            <img
                              src={profile.profilePicture}
                              alt="Profile"
                              className="h-20 w-20 rounded-full object-cover"
                            />
                          )}
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                onChange(file);
                              }
                            }}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="headline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{user?.role === "company" ? "Company Tagline" : "Professional Headline"}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={user?.role === "company"
                          ? "e.g., Leading Innovation in Technology Solutions"
                          : "e.g., Senior Sales Professional with 5+ years in B2B sales"}
                        />
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
                      <FormLabel>{user?.role === "company" ? "Company Overview" : "Professional Summary"}</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder={user?.role === "company"
                          ? "Tell potential candidates about your company's mission, values, and culture"
                          : "Brief overview of your professional background and key achievements"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {user?.role === "company" ? (
                  // Company-specific fields
                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Website</FormLabel>
                          <FormControl>
                            <Input {...field} type="url" placeholder="https://www.example.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Technology, Healthcare, Finance" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companySize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Size</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 50-100 employees" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="foundedYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Founded Year</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 2010" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  // Sales professional fields
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field: { value = [], onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>Work Experience</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={value.join('\n')}
                              onChange={e => onChange(e.target.value.split('\n'))}
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
                      render={({ field: { value = [], onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>Education</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={value.join('\n')}
                              onChange={e => onChange(e.target.value.split('\n'))}
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
                      render={({ field: { value = [], onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>Skills</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={value.join('\n')}
                              onChange={e => onChange(e.target.value.split('\n'))}
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
                      render={({ field: { value = [], onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>Achievements</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={value.join('\n')}
                              onChange={e => onChange(e.target.value.split('\n'))}
                              placeholder="List your achievements (one per line)"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  Save Profile
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile Updated</DialogTitle>
            <DialogDescription>
              Your profile has been successfully updated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setLocation("/")}>Back to Home</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}