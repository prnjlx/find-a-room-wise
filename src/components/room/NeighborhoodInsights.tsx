import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Hospital, Bus, ShoppingBag, UtensilsCrossed, Loader2 } from "lucide-react";

interface POI {
  name: string;
  type: string;
  distance: number;
}

interface CategoryData {
  icon: React.ReactNode;
  label: string;
  items: POI[];
  color: string;
}

export default function NeighborhoodInsights({ latitude, longitude }: { latitude: number; longitude: number }) {
  const [data, setData] = useState<Record<string, POI[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNearbyPOIs();
  }, [latitude, longitude]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const fetchNearbyPOIs = async () => {
    const radius = 2000; // 2km
    const query = `
      [out:json][timeout:10];
      (
        node["amenity"~"hospital|clinic"](around:${radius},${latitude},${longitude});
        node["amenity"~"school|college|university"](around:${radius},${latitude},${longitude});
        node["amenity"~"bus_station|taxi"](around:${radius},${latitude},${longitude});
        node["highway"="bus_stop"](around:${radius},${latitude},${longitude});
        node["shop"~"supermarket|mall|convenience"](around:${radius},${latitude},${longitude});
        node["amenity"~"restaurant|cafe|fast_food"](around:${radius},${latitude},${longitude});
      );
      out body 50;
    `;

    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: `data=${encodeURIComponent(query)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const json = await res.json();

      const categorized: Record<string, POI[]> = {
        hospital: [],
        education: [],
        transport: [],
        shopping: [],
        food: [],
      };

      for (const el of json.elements || []) {
        const tags = el.tags || {};
        const name = tags.name || tags.amenity || tags.shop || "Unnamed";
        const dist = calculateDistance(latitude, longitude, el.lat, el.lon);
        const poi = { name, type: tags.amenity || tags.shop || tags.highway || "", distance: Math.round(dist * 1000) };

        if (tags.amenity?.match(/hospital|clinic/)) categorized.hospital.push(poi);
        else if (tags.amenity?.match(/school|college|university/)) categorized.education.push(poi);
        else if (tags.amenity?.match(/bus_station|taxi/) || tags.highway === "bus_stop") categorized.transport.push(poi);
        else if (tags.shop?.match(/supermarket|mall|convenience/)) categorized.shopping.push(poi);
        else if (tags.amenity?.match(/restaurant|cafe|fast_food/)) categorized.food.push(poi);
      }

      // Sort by distance and limit
      Object.keys(categorized).forEach(key => {
        categorized[key] = categorized[key].sort((a, b) => a.distance - b.distance).slice(0, 3);
      });

      setData(categorized);
    } catch (err) {
      console.error("Failed to fetch POIs:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories: CategoryData[] = [
    { icon: <Hospital className="h-4 w-4" />, label: "Healthcare", items: data.hospital || [], color: "text-red-500" },
    { icon: <GraduationCap className="h-4 w-4" />, label: "Education", items: data.education || [], color: "text-blue-500" },
    { icon: <Bus className="h-4 w-4" />, label: "Transport", items: data.transport || [], color: "text-green-500" },
    { icon: <ShoppingBag className="h-4 w-4" />, label: "Shopping", items: data.shopping || [], color: "text-orange-500" },
    { icon: <UtensilsCrossed className="h-4 w-4" />, label: "Food & Dining", items: data.food || [], color: "text-purple-500" },
  ];

  const totalNearby = Object.values(data).flat().length;
  const livabilityScore = Math.min(100, Math.round((totalNearby / 15) * 100));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading neighborhood data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Neighborhood Insights</h2>
        <Badge variant="secondary" className="text-xs">
          Livability: {livabilityScore}/100
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((cat) => (
          <Card key={cat.label} className="overflow-hidden">
            <CardContent className="p-3">
              <div className={`flex items-center gap-2 mb-2 ${cat.color}`}>
                {cat.icon}
                <span className="font-medium text-sm">{cat.label}</span>
                <Badge variant="outline" className="ml-auto text-xs">{cat.items.length}</Badge>
              </div>
              {cat.items.length > 0 ? (
                <ul className="space-y-1">
                  {cat.items.map((item, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex justify-between">
                      <span className="truncate mr-2">{item.name}</span>
                      <span className="whitespace-nowrap">{item.distance}m</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">None found nearby</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
