import { Job, Application } from "@shared/schema";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Calendar, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import JobDetails from "./job-details";
import ProfileViewer from "./profile-viewer";

interface JobCardProps {
  job: Job;
  application?: Application;
  userRole?: string;
}

export default function JobCard({ job, application, userRole }: JobCardProps) {
  const { toast } = useToast();
  const [showProfile, setShowProfile] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await apiRequest("PATCH", `/api/applications/${application?.id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Status Updated",
        description: "The application status has been updated.",
      });
    },
  });

  return (
    <>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setShowJobDetails(true)}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{job.title}</h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {job.location}
              </div>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDistanceToNow(new Date(job.createdAt!), { addSuffix: true })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
        </CardContent>
        {application && (
          <CardFooter>
            <div className="w-full">
              {userRole === "company" ? (
                <div className="space-y-2 w-full">
                  <div className="flex gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStatusMutation.mutate("approved");
                      }}
                      variant={application.status === "approved" ? "default" : "outline"}
                      className="flex-1"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStatusMutation.mutate("rejected");
                      }}
                      variant={application.status === "rejected" ? "destructive" : "outline"}
                      className="flex-1"
                    >
                      Reject
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowProfile(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Applicant Profile
                  </Button>
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  Status: <span className="font-medium capitalize">{application.status}</span>
                </div>
              )}
            </div>
          </CardFooter>
        )}
      </Card>

      <JobDetails
        job={job}
        isOpen={showJobDetails}
        onClose={() => setShowJobDetails(false)}
      />

      {application && showProfile && (
        <ProfileViewer
          userId={application.salesId}
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          role="sales"
        />
      )}
    </>
  );
}