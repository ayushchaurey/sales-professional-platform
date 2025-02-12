import { Profile, User } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";

interface ProfileViewerProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileViewer({ userId, isOpen, onClose }: ProfileViewerProps) {
  const { data: profile } = useQuery<Profile>({
    queryKey: [`/api/profiles/${userId}`],
    enabled: isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Applicant Profile</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] px-1">
          {profile ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Professional Headline</h3>
                <p className="text-muted-foreground">{profile.headline}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Professional Summary</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{profile.summary}</p>
              </div>

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
            </div>
          ) : (
            <p className="text-muted-foreground">No profile information available.</p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
