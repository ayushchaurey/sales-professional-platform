import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Job, Application, Profile } from "@shared/schema";
import { Input } from "@/components/ui/input";
import JobCard from "@/components/job-card";
import CompanyJobView from "@/components/company-job-view";
import UserNav from "@/components/user-nav";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MapPin, Building2, User } from "lucide-react";
import ProfileViewer from "@/components/profile-viewer";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  const { user } = useAuth();
  const [location, setLocation] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null);

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

  const { data: salesProfiles } = useQuery<Profile[]>({
    queryKey: ["/api/profiles/sales"],
    queryFn: async () => {
      const res = await fetch("/api/profiles/sales");
      if (!res.ok) throw new Error("Failed to fetch sales profiles");
      return res.json();
    },
    enabled: user?.role === "company"
  });

  // Group applications by job for company users
  const applicationsByJob = applications?.reduce((acc, app) => {
    if (!acc[app.jobId]) {
      acc[app.jobId] = [];
    }
    acc[app.jobId].push(app);
    return acc;
  }, {} as Record<number, Application[]>);

  const companyJobs = jobs?.filter(job => job.companyId === user?.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 container max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">Local Sales Marketplace</h1>
          <div className="ml-auto flex items-center space-x-4">
            {user?.role === "company" && (
              <Link href="/profile">
                <Button variant="outline">Edit Company Profile</Button>
              </Link>
            )}
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
        {user?.role === "company" ? (
          <div className="space-y-8">
            {/* Company's Job Listings */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">My Job Listings</h2>
              <div className="space-y-6">
                {companyJobs?.map((job) => (
                  <CompanyJobView
                    key={job.id}
                    job={job}
                    applications={applicationsByJob?.[job.id] || []}
                  />
                ))}
                {(!companyJobs || companyJobs.length === 0) && (
                  <Card className="p-6">
                    <p className="text-center text-muted-foreground">
                      You haven't posted any jobs yet.{" "}
                      <Link href="/post-job" className="text-primary hover:underline">
                        Post your first job
                      </Link>
                    </p>
                  </Card>
                )}
              </div>
            </div>

            {/* Sales Professionals */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Available Sales Professionals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {salesProfiles?.map((profile) => (
                  <Card key={profile.userId} className="p-6 cursor-pointer hover:bg-muted/50" onClick={() => setSelectedProfile(profile.userId)}>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{profile.headline || "Sales Professional"}</h3>
                          {profile.location && (
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {profile.location}
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="icon">
                          <User className="h-4 w-4" />
                        </Button>
                      </div>
                      {profile.skills && profile.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.slice(0, 3).map((skill, i) => (
                            <span key={i} className="bg-muted px-2 py-1 rounded-md text-xs">
                              {skill}
                            </span>
                          ))}
                          {profile.skills.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{profile.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Sales Professional View
          <>
            <div className="flex items-center space-x-4 mb-8">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Filter by location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="max-w-sm"
              />
              <Link href="/profile">
                <Button variant="outline">Edit Profile</Button>
              </Link>
            </div>

            <div className="space-y-6">
              {jobs?.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  application={applications?.find(a => a.jobId === job.id)}
                  userRole={user.role}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {selectedProfile && (
        <ProfileViewer
          userId={selectedProfile}
          isOpen={true}
          onClose={() => setSelectedProfile(null)}
          role="sales"
        />
      )}
    </div>
  );
}