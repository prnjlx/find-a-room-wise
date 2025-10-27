import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Edit, Trash2, Heart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
}

interface RoomCardProps {
  room: Room;
  onEdit?: (room: Room) => void;
  onDelete?: (roomId: string) => void;
  showActions?: boolean;
}

export default function RoomCard({ room, onEdit, onDelete, showActions }: RoomCardProps) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleCardClick = () => {
    navigate(`/room/${room.id}`);
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
          .eq("room_id", room.id);
        
        if (error) throw error;
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, room_id: room.id });
        
        if (error) throw error;
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (error: any) {
      toast.error("Failed to update favorites");
    }
  };

  return (
    <Card className="overflow-hidden card-hover group cursor-pointer" onClick={handleCardClick}>
      <div className="relative h-48 bg-muted overflow-hidden">
        {room.images && room.images.length > 0 ? (
          <img
            src={room.images[0]}
            alt={room.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
            <MapPin className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        {!showActions && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFavorite();
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-destructive text-destructive" : "text-foreground"}`} />
          </button>
        )}
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg line-clamp-1">{room.title}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="line-clamp-1">{room.location}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">₹{room.price}</div>
            <div className="text-xs text-muted-foreground">per month</div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {room.description}
        </p>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {room.room_type}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {room.furnishing_status}
          </Badge>
        </div>

        {room.amenities && room.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {room.amenities.slice(0, 3).map((amenity, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-accent rounded-full">
                {amenity}
              </span>
            ))}
            {room.amenities.length > 3 && (
              <span className="text-xs px-2 py-1 bg-accent rounded-full">
                +{room.amenities.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardContent>

      {showActions && onEdit && onDelete && (
        <CardFooter className="p-4 pt-0 gap-2">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(room);
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(room.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
