import { Job, Application } from "@shared/schema";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Calendar, User, ChevronDown, ChevronUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import ProfileViewer from "./profile-viewer";

interface CompanyJobViewProps {
  job: Job;
  applications: Application[];
}

export default function CompanyJobView({ job, applications }: CompanyJobViewProps) {
  const { toast } = useToast();
  const [expandedApplicationId, setExpandedApplicationId] = useState<number | null>(null);
  const [showProfile, setShowProfile] = useState<number | null>(null);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/applications/${id}`, { status });
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
            {formatDistanceToNow(new Date(job.createdAt!), { addSuffix: true })}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{job.description}</p>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <h4 className="font-semibold">Applications ({applications.length})</h4>
          {applications.map((application) => (
            <Card key={application.id} className="border-2">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setExpandedApplicationId(
                        expandedApplicationId === application.id ? null : application.id
                      )}
                    >
                      {expandedApplicationId === application.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Application #{application.id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                          application.status === 'approved' ? 'bg-green-100 text-green-800' :
                          application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {application.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Submitted {formatDistanceToNow(new Date(application.createdAt!), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateStatusMutation.mutate({ id: application.id, status: "approved" })}
                      variant={application.status === "approved" ? "default" : "outline"}
                      size="sm"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => updateStatusMutation.mutate({ id: application.id, status: "rejected" })}
                      variant={application.status === "rejected" ? "destructive" : "outline"}
                      size="sm"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedApplicationId === application.id && (
                <CardContent className="border-t pt-4">
                  <div className="space-y-4">
                    <div>
                      <Button
                        variant="outline"
                        onClick={() => setShowProfile(application.salesId)}
                        className="w-full"
                      >
                        <User className="h-4 w-4 mr-2" />
                        View Full Profile
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-semibold">Question Responses</h5>
                      {job.customQuestions?.map((question, index) => (
                        <div key={index} className="space-y-1">
                          <p className="text-sm font-medium">{question}</p>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                            {application.answers?.[index] || "No response"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {showProfile !== null && (
          <ProfileViewer
            userId={showProfile}
            isOpen={true}
            onClose={() => setShowProfile(null)}
          />
        )}
      </CardContent>
    </Card>
  );
}
