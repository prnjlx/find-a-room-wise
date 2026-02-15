import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Phone, Mail } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface VerifiedBadgeProps {
  isDocumentVerified?: boolean;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  compact?: boolean;
}

export default function VerifiedBadge({ 
  isDocumentVerified, 
  isPhoneVerified, 
  isEmailVerified,
  compact = false 
}: VerifiedBadgeProps) {
  if (!isDocumentVerified && !isPhoneVerified && !isEmailVerified) return null;

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className="gap-1 border-green-500/50 text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400">
            <ShieldCheck className="h-3 w-3" />
            Verified
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-xs">
            {isDocumentVerified && <p className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> ID Verified</p>}
            {isPhoneVerified && <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> Phone Verified</p>}
            {isEmailVerified && <p className="flex items-center gap-1"><Mail className="h-3 w-3" /> Email Verified</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {isDocumentVerified && (
        <Badge variant="outline" className="gap-1 border-green-500/50 text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400 text-xs">
          <ShieldCheck className="h-3 w-3" /> ID Verified
        </Badge>
      )}
      {isPhoneVerified && (
        <Badge variant="outline" className="gap-1 border-blue-500/50 text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400 text-xs">
          <Phone className="h-3 w-3" /> Phone
        </Badge>
      )}
      {isEmailVerified && (
        <Badge variant="outline" className="gap-1 border-purple-500/50 text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400 text-xs">
          <Mail className="h-3 w-3" /> Email
        </Badge>
      )}
    </div>
  );
}
