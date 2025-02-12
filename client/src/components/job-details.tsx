import { Job, Profile } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Globe, Building2, Users, Calendar } from "lucide-react";
import { useState } from "react";
import ApplicationForm from "./application-form";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import ProfileViewer from "./profile-viewer";

interface JobDetailsProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}

export default function JobDetails({ job, isOpen, onClose }: JobDetailsProps) {
  const { user } = useAuth();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showCompanyProfile, setShowCompanyProfile] = useState(false);

  const { data: companyProfile, isLoading } = useQuery<Profile>({
    queryKey: [`/api/profiles/${job.companyId}`],
    enabled: isOpen,
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{job.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {job.location}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[80vh] px-1">
            <div className="space-y-6">
              {/* Job Description */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Job Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
              </div>

              {/* Company Information */}
              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold">About the Company</h3>

                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : companyProfile ? (
                  <div className="space-y-4">
                    <p className="font-medium">{companyProfile.headline}</p>
                    <p className="text-muted-foreground">{companyProfile.summary}</p>

                    <div className="grid gap-3">
                      {companyProfile.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-muted-foreground" />
                          <a 
                            href={companyProfile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Company Website
                          </a>
                        </div>
                      )}

                      {companyProfile.industry && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                          <span>{companyProfile.industry}</span>
                        </div>
                      )}

                      {companyProfile.companySize && (
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-muted-foreground" />
                          <span>{companyProfile.companySize} employees</span>
                        </div>
                      )}

                      {companyProfile.foundedYear && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <span>Founded in {companyProfile.foundedYear}</span>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => setShowCompanyProfile(true)}
                    >
                      View Full Company Profile
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No company profile available.</p>
                )}
              </div>

              {/* Posted Time */}
              <div className="text-sm text-muted-foreground">
                Posted {formatDistanceToNow(new Date(job.createdAt!), { addSuffix: true })}
              </div>

              {/* Apply Button */}
              {user?.role === "sales" && (
                <Button 
                  className="w-full"
                  onClick={() => setShowApplicationForm(true)}
                >
                  Apply Now
                </Button>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <ApplicationForm
        job={job}
        isOpen={showApplicationForm}
        onClose={() => setShowApplicationForm(false)}
      />

      {showCompanyProfile && (
        <ProfileViewer
          userId={job.companyId}
          isOpen={showCompanyProfile}
          onClose={() => setShowCompanyProfile(false)}
          role="company"
        />
      )}
    </>
  );
}