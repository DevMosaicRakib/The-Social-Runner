import { useState, useEffect, useRef } from "react";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { searchLocations, type LocationData } from "@shared/australianLocations";

interface LocationSearchProps {
  value?: string;
  onLocationSelect: (location: LocationData) => void;
  placeholder?: string;
  showCurrentLocation?: boolean;
  className?: string;
}

export default function LocationSearch({
  value = "",
  onLocationSelect,
  placeholder = "Search suburbs, cities... (e.g. Sydney, Bondi, Melbourne)",
  showCurrentLocation = false,
  className = ""
}: LocationSearchProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update search term when value prop changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Handle search input changes
  const handleSearchChange = (query: string) => {
    setSearchTerm(query);
    
    if (query.trim().length >= 1) { // Start searching with just 1 character
      const results = searchLocations(query.trim(), 8);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle location selection
  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
    setSearchTerm(location.label);
    setShowSuggestions(false);
    setSuggestions([]);
    onLocationSelect(location);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions]);


  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          onInput={(e) => handleSearchChange((e.target as HTMLInputElement).value)}
          className="pr-10"
          onFocus={() => {
            if (searchTerm.trim().length > 0) {
              handleSearchChange(searchTerm); // Re-trigger search to show suggestions
            }
          }}
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {/* Current Location Display */}
      {showCurrentLocation && selectedLocation && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-orange-500" />
          <span className="font-medium text-gray-700">Current: {selectedLocation.label}</span>
          <Badge variant="secondary" className="text-xs">
            {selectedLocation.state}
          </Badge>
        </div>
      )}

      {/* Location Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.length > 0 ? (
            suggestions.map((location) => (
              <button
                key={location.value}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
                onClick={() => handleLocationSelect(location)}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{location.label}</span>
                  <span className="text-xs text-gray-500">{location.postcode}</span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {location.state}
                </span>
              </button>
            ))
          ) : searchTerm.trim().length > 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No locations found for "{searchTerm}"
              <div className="text-xs mt-1 text-gray-400">Try: Sydney, Melbourne, Brisbane, Perth, Adelaide</div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}