import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const roomSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000),
  price: z.number().min(1, "Price must be greater than 0").max(1000000),
  location: z.string().min(5, "Location must be at least 5 characters").max(200),
});

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
  available_from: string;
}

interface RoomListingFormProps {
  room?: Room | null;
  onClose: () => void;
}

export default function RoomListingForm({ room, onClose }: RoomListingFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: room?.title || "",
    description: room?.description || "",
    price: room?.price || 0,
    location: room?.location || "",
    furnishing_status: room?.furnishing_status || "unfurnished",
    room_type: room?.room_type || "single",
    amenities: room?.amenities || [],
    available_from: room?.available_from || "",
  });
  const [amenityInput, setAmenityInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      roomSchema.parse({
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        location: formData.location,
      });

      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const roomData = {
        ...formData,
        owner_id: user.id,
        price: Number(formData.price),
      };

      if (room?.id) {
        const { error } = await supabase
          .from("rooms")
          .update(roomData)
          .eq("id", room.id);
        
        if (error) throw error;
        toast.success("Room updated successfully!");
      } else {
        const { error } = await supabase
          .from("rooms")
          .insert(roomData);
        
        if (error) throw error;
        toast.success("Room listed successfully!");
      }

      onClose();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to save listing");
      }
    } finally {
      setLoading(false);
    }
  };

  const addAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityInput.trim()],
      });
      setAmenityInput("");
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((a) => a !== amenity),
    });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{room ? "Edit Listing" : "Create New Listing"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Spacious room in downtown"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (₹/month) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="10000"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="123 Main St, City"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your room..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room_type">Room Type</Label>
                <Select
                  value={formData.room_type}
                  onValueChange={(value) => setFormData({ ...formData, room_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="furnishing_status">Furnishing</Label>
                <Select
                  value={formData.furnishing_status}
                  onValueChange={(value) => setFormData({ ...formData, furnishing_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="furnished">Furnished</SelectItem>
                    <SelectItem value="semi-furnished">Semi-furnished</SelectItem>
                    <SelectItem value="unfurnished">Unfurnished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="available_from">Available From</Label>
              <Input
                id="available_from"
                type="date"
                value={formData.available_from}
                onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Amenities</Label>
              <div className="flex gap-2">
                <Input
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  placeholder="Add an amenity"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
                />
                <Button type="button" variant="secondary" onClick={addAmenity}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-accent rounded-full text-sm flex items-center gap-2"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeAmenity(amenity)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" variant="hero" disabled={loading} className="flex-1">
                {loading ? "Saving..." : room ? "Update Listing" : "Create Listing"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
