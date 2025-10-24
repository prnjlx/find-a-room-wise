import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import RoomListingForm from "./RoomListingForm";
import RoomCard from "./RoomCard";

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
  available_from: string;
}

export default function OwnerDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRooms(data || []);
    } catch (error: any) {
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setShowForm(true);
  };

  const handleDelete = async (roomId: string) => {
    try {
      const { error } = await supabase.from("rooms").delete().eq("id", roomId);
      if (error) throw error;
      toast.success("Room deleted successfully");
      fetchRooms();
    } catch (error: any) {
      toast.error("Failed to delete room");
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRoom(null);
    fetchRooms();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="text-muted-foreground">Manage your room listings</p>
        </div>
        <Button variant="hero" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Listing
        </Button>
      </div>

      {showForm && (
        <RoomListingForm
          room={editingRoom}
          onClose={handleFormClose}
        />
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
          <p className="text-muted-foreground mb-4">Create your first listing to get started</p>
          <Button variant="hero" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onEdit={handleEdit}
              onDelete={handleDelete}
              showActions
            />
          ))}
        </div>
      )}
    </div>
  );
}
