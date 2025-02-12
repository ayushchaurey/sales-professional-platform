import { Profile } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Globe, Building2, Users, Calendar } from "lucide-react";

interface ExtendedProfile extends Profile {
  userLocation?: string;
}

interface ProfileViewerProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  role?: "company" | "sales";
}

export default function ProfileViewer({ userId, isOpen, onClose, role }: ProfileViewerProps) {
  const { data: profile, isLoading } = useQuery<ExtendedProfile>({
    queryKey: [`/api/profiles/${userId}`],
    queryFn: async () => {
      const res = await fetch(`/api/profiles/${userId}`);
      if (!res.ok) {
        if (res.status === 404) {
          return null;
        }
        throw new Error("Failed to fetch profile");
      }
      return res.json();
    },
    enabled: isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{role === "company" ? "Company Profile" : "Professional Profile"}</DialogTitle>
          <DialogDescription>
            {role === "company"
              ? "Learn more about this company"
              : "Review the applicant's professional background and experience"}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] px-1">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : profile ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">{role === "company" ? "Company Tagline" : "Professional Headline"}</h3>
                <p className="text-muted-foreground">{profile.headline}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">{role === "company" ? "Company Overview" : "Professional Summary"}</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{profile.summary}</p>
              </div>

              {role === "company" ? (
                // Company-specific information
                <div className="grid gap-6">
                  {profile.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Company Website
                      </a>
                    </div>
                  )}

                  {profile.industry && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <span>{profile.industry}</span>
                    </div>
                  )}

                  {profile.companySize && (
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <span>{profile.companySize} employees</span>
                    </div>
                  )}

                  {profile.foundedYear && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span>Founded in {profile.foundedYear}</span>
                    </div>
                  )}
                </div>
              ) : (
                // Sales professional information
                <>
                  <div>
                    <h3 className="font-semibold mb-2">Work Experience</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {profile.experience?.map((exp, i) => (
                        <li key={i} className="text-muted-foreground">{exp}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Education</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {profile.education?.map((edu, i) => (
                        <li key={i} className="text-muted-foreground">{edu}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Skills</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {profile.skills?.map((skill, i) => (
                        <li key={i} className="text-muted-foreground">{skill}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Achievements</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {profile.achievements?.map((achievement, i) => (
                        <li key={i} className="text-muted-foreground">{achievement}</li>
                      ))}
                    </ul>
                  </div>

                  {profile.resumeUrl && (
                    <div>
                      <h3 className="font-semibold mb-2">Resume</h3>
                      <a
                        href={profile.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View Resume
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground py-4">
              No profile information available. {role === "company"
                ? "The company has not created their profile yet."
                : "The applicant has not created their profile yet."}
            </p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}