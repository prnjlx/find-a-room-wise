import { Progress } from "@/components/ui/progress";

interface Room {
  title: string;
  description?: string | null;
  price: number;
  location: string;
  furnishing_status?: string | null;
  room_type?: string | null;
  amenities?: string[] | null;
  images?: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
}

export default function ListingCompletenessScore({ room }: { room: Room }) {
  const fields = [
    { label: "Title", filled: !!room.title },
    { label: "Description", filled: !!room.description },
    { label: "Price", filled: room.price > 0 },
    { label: "Location", filled: !!room.location },
    { label: "Room Type", filled: !!room.room_type },
    { label: "Furnishing", filled: !!room.furnishing_status },
    { label: "Amenities", filled: !!(room.amenities && room.amenities.length > 0) },
    { label: "Photos", filled: !!(room.images && room.images.length > 0) },
    { label: "Map Location", filled: !!(room.latitude && room.longitude) },
    { label: "Multiple Photos", filled: !!(room.images && room.images.length >= 3) },
  ];

  const score = Math.round((fields.filter(f => f.filled).length / fields.length) * 100);

  const getColor = () => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Listing Quality</span>
        <span className={`text-sm font-bold ${getColor()}`}>{score}%</span>
      </div>
      <Progress value={score} className="h-2" />
      {score < 100 && (
        <div className="text-xs text-muted-foreground">
          Missing: {fields.filter(f => !f.filled).map(f => f.label).join(", ")}
        </div>
      )}
    </div>
  );
}
