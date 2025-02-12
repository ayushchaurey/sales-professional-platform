import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Job, Application } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import JobCard from "@/components/job-card";
import UserNav from "@/components/user-nav";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MapPin } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [location, setLocation] = useState("");
  
  const { data: jobs } = useQuery<Job[]>({
    queryKey: ["/api/jobs", location],
    queryFn: async () => {
      const url = location ? `/api/jobs?location=${encodeURIComponent(location)}` : "/api/jobs";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    }
  });

  const { data: applications } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
    queryFn: async () => {
      const res = await fetch("/api/applications");
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 container max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">Local Sales Marketplace</h1>
          <div className="ml-auto flex items-center space-x-4">
            {user?.role === "company" && (
              <Link href="/post-job">
                <Button>Post a Job</Button>
              </Link>
            )}
            <UserNav />
          </div>
        </div>
      </div>

      <main className="container max-w-7xl mx-auto py-8">
        <div className="flex items-center space-x-4 mb-8">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Filter by location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs?.map((job) => (
            <JobCard 
              key={job.id} 
              job={job}
              application={applications?.find(a => a.jobId === job.id)}
              userRole={user?.role}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
