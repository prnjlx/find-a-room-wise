import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Flag } from "lucide-react";
import { toast } from "sonner";

const REPORT_REASONS = [
  "Fake or misleading listing",
  "Incorrect price",
  "Wrong location",
  "Inappropriate content",
  "Already rented out",
  "Scam / fraud",
  "Other",
];

export default function ReportListing({ roomId }: { roomId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please login to report a listing");
      return;
    }
    if (!reason) {
      toast.error("Please select a reason");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("room_reports").insert({
        room_id: roomId,
        reporter_id: user.id,
        reason,
        description: description || null,
      });
      if (error) throw error;
      toast.success("Report submitted. We'll review it shortly.");
      setOpen(false);
      setReason("");
      setDescription("");
    } catch {
      toast.error("Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Flag className="h-4 w-4 mr-1" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Suspicious Listing</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger>
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_REASONS.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Add more details (optional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            Submit Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
