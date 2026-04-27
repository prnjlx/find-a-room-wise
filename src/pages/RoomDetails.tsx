import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { ArrowLeft, MapPin, Heart, Share2, Mail, Phone, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import LocationMap from "@/components/LocationMap";
import RoomReviews from "@/components/room/RoomReviews";
import ReportListing from "@/components/room/ReportListing";
import NeighborhoodInsights from "@/components/room/NeighborhoodInsights";
import ListingCompletenessScore from "@/components/room/ListingCompletenessScore";
import VerifiedBadge from "@/components/room/VerifiedBadge";

interface Room {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  furnishing_status: string;
  room_type: string;
  amenities: string[];
  images: string[];
  is_available: boolean;
  latitude?: number;
  longitude?: number;
  created_at: string;
  owner_id: string;
}

interface OwnerProfile {
  is_phone_verified: boolean;
  is_document_verified: boolean;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

export default function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    fetchRoomDetails();
    checkIfFavorite();
  }, [id]);

  const fetchRoomDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error("Room not found");
        navigate("/dashboard");
        return;
      }

      setRoom(data);

      // Fetch owner profile (verification + contact info)
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_phone_verified, is_document_verified, full_name, email, phone")
        .eq("id", data.owner_id)
        .maybeSingle();
      setOwnerProfile(profile);
    } catch (error) {
      console.error("Error fetching room:", error);
      toast.error("Failed to load room details");
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .eq("room_id", id)
        .maybeSingle();

      setIsFavorite(!!data);
    } catch (error) {
      console.error("Error checking favorite:", error);
    }
  };

  const handleFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to save favorites");
        return;
      }

      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("room_id", id);
        
        if (error) throw error;
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, room_id: id });
        
        if (error) throw error;
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (error: any) {
      toast.error("Failed to update favorites");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: room?.title,
          text: room?.description,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch (error: any) {
      // User cancelled share or clipboard failed
      if (error.name !== 'AbortError') {
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(url);
          toast.success("Link copied to clipboard");
        } catch (clipboardError) {
          toast.error("Failed to share");
        }
      }
    }
  };

  const requireAuth = async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please login to contact the owner");
      navigate("/auth");
      return false;
    }
    return true;
  };

  const handleEmail = async () => {
    if (!(await requireAuth())) return;
    if (!ownerProfile?.email) {
      toast.error("Owner has not added an email yet");
      return;
    }
    const subject = encodeURIComponent(`Inquiry about: ${room?.title ?? "your room"}`);
    const body = encodeURIComponent(
      `Hi ${ownerProfile.full_name ?? "there"},\n\nI'm interested in your room "${room?.title}" listed on RoomEase. Could you share more details?\n\nThanks!`
    );
    window.location.href = `mailto:${ownerProfile.email}?subject=${subject}&body=${body}`;
  };

  const handleCall = async () => {
    if (!(await requireAuth())) return;
    if (!ownerProfile?.phone) {
      toast.error("Owner has not added a phone number yet");
      return;
    }
    window.location.href = `tel:${ownerProfile.phone.replace(/\s+/g, "")}`;
  };

  const handleWhatsApp = async () => {
    if (!(await requireAuth())) return;
    if (!ownerProfile?.phone) {
      toast.error("Owner has not added a phone number yet");
      return;
    }
    const digits = ownerProfile.phone.replace(/[^\d]/g, "");
    if (!digits) {
      toast.error("Invalid phone number");
      return;
    }
    const message = encodeURIComponent(
      `Hi ${ownerProfile.full_name ?? "there"}, I'm interested in your room "${room?.title}" on RoomEase.`
    );
    window.open(`https://wa.me/${digits}?text=${message}`, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-muted rounded-lg" />
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Rooms
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative h-96 bg-muted">
                {room.images && room.images.length > 0 ? (
                  <>
                    <img
                      src={room.images[currentImageIndex]}
                      alt={room.title}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => { setLightboxIndex(currentImageIndex); setLightboxOpen(true); }}
                    />
                    {room.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {room.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentImageIndex
                                ? "bg-primary"
                                : "bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                    <MapPin className="h-24 w-24 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              {room.images && room.images.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-2">
                  {room.images.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${room.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Location Map */}
            {room.latitude && room.longitude && (
              <Card>
                <CardContent className="p-6">
                  <LocationMap 
                    latitude={room.latitude} 
                    longitude={room.longitude}
                    title={room.title}
                  />
                </CardContent>
              </Card>
            )}

            {/* Room Details */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{room.title}</h1>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{room.location}</span>
                  </div>
                </div>

                {/* Owner Verification Badges */}
                {ownerProfile && (
                  <VerifiedBadge
                    isDocumentVerified={ownerProfile.is_document_verified}
                    isPhoneVerified={ownerProfile.is_phone_verified}
                    isEmailVerified={true}
                  />
                )}

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{room.room_type}</Badge>
                  <Badge variant="outline">{room.furnishing_status}</Badge>
                  <Badge variant={room.is_available ? "default" : "destructive"}>
                    {room.is_available ? "Available" : "Not Available"}
                  </Badge>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-2">Description</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {room.description}
                  </p>
                </div>

                {room.amenities && room.amenities.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-3">Amenities</h2>
                    <div className="grid grid-cols-2 gap-2">
                      {room.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm p-2 rounded-lg bg-accent"
                        >
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Neighborhood Insights */}
            {room.latitude && room.longitude && (
              <Card>
                <CardContent className="p-6">
                  <NeighborhoodInsights latitude={room.latitude} longitude={room.longitude} />
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardContent className="p-6">
                <RoomReviews roomId={room.id} />
              </CardContent>
            </Card>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="text-3xl font-bold text-primary">₹{room.price}</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>

                <div className="space-y-2">
                  {/* Owner Contact Info */}
                  {(ownerProfile?.email || ownerProfile?.phone) ? (
                    <div className="rounded-lg border bg-accent/50 p-3 space-y-1 text-sm">
                      <div className="font-semibold text-foreground">
                        {ownerProfile.full_name ?? "Room Owner"}
                      </div>
                      {ownerProfile.email && (
                        <div className="flex items-center gap-2 text-muted-foreground break-all">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span>{ownerProfile.email}</span>
                        </div>
                      )}
                      {ownerProfile.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span>{ownerProfile.phone}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg border bg-muted p-3 text-xs text-muted-foreground">
                      Owner has not added contact details yet.
                    </div>
                  )}

                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!room.is_available || !ownerProfile?.phone}
                    onClick={handleWhatsApp}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {room.is_available ? "Contact on WhatsApp" : "Not Available"}
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={handleEmail}
                      disabled={!ownerProfile?.email}
                      className="w-full"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCall}
                      disabled={!ownerProfile?.phone}
                      className="w-full"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={handleFavorite}
                      className="w-full"
                    >
                      <Heart
                        className={`h-4 w-4 mr-2 ${
                          isFavorite ? "fill-destructive text-destructive" : ""
                        }`}
                      />
                      {isFavorite ? "Saved" : "Save"}
                    </Button>
                    <Button variant="outline" onClick={handleShare} className="w-full">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Listing Quality Score */}
                <ListingCompletenessScore room={room} />

                {/* Report */}
                <div className="flex justify-center pt-2 border-t">
                  <ReportListing roomId={room.id} />
                </div>

              </CardContent>
            </Card>
          </div>
        </div>

        {/* Fullscreen Image Lightbox */}
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
            {room.images && room.images.length > 0 && (
              <div className="relative flex items-center justify-center w-full h-[90vh]">
                <img
                  src={room.images[lightboxIndex]}
                  alt={`${room.title} ${lightboxIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
                {room.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setLightboxIndex((prev) => (prev - 1 + room.images.length) % room.images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white text-2xl"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setLightboxIndex((prev) => (prev + 1) % room.images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white text-2xl"
                    >
                      ›
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {room.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setLightboxIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${index === lightboxIndex ? "bg-white" : "bg-white/40"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
