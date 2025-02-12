import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Job, Application } from "@shared/schema";
import { Input } from "@/components/ui/input";
import JobCard from "@/components/job-card";
import CompanyJobView from "@/components/company-job-view";
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
    },
    enabled: !!user
  });

  // Group applications by job for company users
  const applicationsByJob = applications?.reduce((acc, app) => {
    if (!acc[app.jobId]) {
      acc[app.jobId] = [];
    }
    acc[app.jobId].push(app);
    return acc;
  }, {} as Record<number, Application[]>);

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

        <div className="space-y-6">
          {jobs?.map((job) => {
            if (user?.role === "company" && job.companyId === user.id) {
              // For company users, show their jobs with all applications
              return (
                <CompanyJobView
                  key={job.id}
                  job={job}
                  applications={applicationsByJob?.[job.id] || []}
                />
              );
            } else if (user?.role === "sales") {
              // For sales users, show jobs they can apply to
              return (
                <JobCard
                  key={job.id}
                  job={job}
                  application={applications?.find(a => a.jobId === job.id)}
                  userRole={user.role}
                />
              );
            }
            return null;
          })}
        </div>
      </main>
    </div>
  );
}