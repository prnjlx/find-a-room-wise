import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import RoomCard from "./RoomCard";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

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

export default function SeekerDashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [furnishingFilter, setFurnishingFilter] = useState<string>("all");
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>("all");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [maxDistance, setMaxDistance] = useState(50);

  useEffect(() => {
    fetchRooms();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      toast.info("Getting your location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast.success("Location captured! Showing nearby rooms.");
        },
        (error) => {
          toast.error("Failed to get location");
        }
      );
    } else {
      toast.error("Geolocation not supported");
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRooms(data || []);
    } catch (error: any) {
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter((room: any) => {
    const matchesSearch = room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = room.price >= priceRange[0] && room.price <= priceRange[1];
    const matchesFurnishing = furnishingFilter === "all" || room.furnishing_status === furnishingFilter;
    const matchesRoomType = roomTypeFilter === "all" || room.room_type === roomTypeFilter;
    
    let matchesDistance = true;
    if (userLocation && room.latitude && room.longitude) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        room.latitude,
        room.longitude
      );
      matchesDistance = distance <= maxDistance;
    }
    
    return matchesSearch && matchesPrice && matchesFurnishing && matchesRoomType && matchesDistance;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Your Perfect Room</h1>
        <p className="text-muted-foreground">Browse available rooms and find your next home</p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by location or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={getUserLocation}
          >
            <MapPin className="h-4 w-4 mr-2" />
            My Location
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
        
        {userLocation && (
          <div className="bg-accent/50 px-4 py-2 rounded-lg flex items-center justify-between">
            <span className="text-sm">
              📍 Showing rooms within {maxDistance}km of your location
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUserLocation(null)}
            >
              Clear
            </Button>
          </div>
        )}

        {showFilters && (
          <div className="bg-card p-6 rounded-lg border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label>Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}</Label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={50000}
                  step={1000}
                  className="mt-2"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Furnishing</Label>
                <Select value={furnishingFilter} onValueChange={setFurnishingFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="furnished">Furnished</SelectItem>
                    <SelectItem value="semi-furnished">Semi-furnished</SelectItem>
                    <SelectItem value="unfurnished">Unfurnished</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Room Type</Label>
                <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {userLocation && (
                <div className="space-y-2">
                  <Label>Max Distance: {maxDistance}km</Label>
                  <Slider
                    value={[maxDistance]}
                    onValueChange={(value) => setMaxDistance(value[0])}
                    max={100}
                    min={1}
                    step={5}
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <h3 className="text-xl font-semibold mb-2">No rooms found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
