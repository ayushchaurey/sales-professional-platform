import { Job, Application } from "@shared/schema";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Calendar, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import ProfileViewer from "./profile-viewer";
import ApplicationForm from "./application-form";

interface JobCardProps {
  job: Job;
  application?: Application;
  userRole?: string;
}

export default function JobCard({ job, application, userRole }: JobCardProps) {
  const { toast } = useToast();
  const [showProfile, setShowProfile] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

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
    <Card>
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
            {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{job.description}</p>
      </CardContent>
      <CardFooter>
        {userRole === "sales" && !application && (
          <Button 
            onClick={() => setShowApplicationForm(true)} 
            className="w-full"
          >
            Apply Now
          </Button>
        )}
        {application && (
          <div className="w-full">
            {userRole === "company" ? (
              <div className="space-y-2 w-full">
                <div className="flex gap-2">
                  <Button
                    onClick={() => updateStatusMutation.mutate("approved")}
                    variant={application.status === "approved" ? "default" : "outline"}
                    className="flex-1"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => updateStatusMutation.mutate("rejected")}
                    variant={application.status === "rejected" ? "destructive" : "outline"}
                    className="flex-1"
                  >
                    Reject
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowProfile(true)}
                >
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                Status: <span className="font-medium capitalize">{application.status}</span>
              </div>
            )}
          </div>
        )}
      </CardFooter>
      {application && showProfile && (
        <ProfileViewer
          userId={application.salesId}
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
        />
      )}
      <ApplicationForm
        job={job}
        isOpen={showApplicationForm}
        onClose={() => setShowApplicationForm(false)}
      />
    </Card>
  );
}