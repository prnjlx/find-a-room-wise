import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().trim().max(100, "Name too long").optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").max(255, "Email too long"),
  phone: z
    .string()
    .trim()
    .max(20, "Phone too long")
    .regex(/^[+\d\s\-()]*$/, "Invalid phone format")
    .optional()
    .or(z.literal("")),
});

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        toast.error("Failed to load profile");
      } else if (data) {
        setFullName(data.full_name ?? "");
        setEmail(data.email ?? user.email ?? "");
        setPhone(data.phone ?? "");
      }
      setLoading(false);
    };
    load();
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = profileSchema.safeParse({ full_name: fullName, email, phone });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName || null,
          email: email,
          phone: phone || null,
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>
              Add your contact details so room seekers can reach you easily.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">Loading...</div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (with country code)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    maxLength={20}
                  />
                  <p className="text-xs text-muted-foreground">
                    Include country code for WhatsApp to work (e.g. +91...).
                  </p>
                </div>
                <Button type="submit" variant="hero" disabled={saving} className="w-full">
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
