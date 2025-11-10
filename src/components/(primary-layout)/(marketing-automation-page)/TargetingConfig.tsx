"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mediaAPI } from "@/services/marketing-automation.service";
import { Loader2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface City {
  key: string;
  name: string;
  country_code: string;
}

interface TargetingConfigProps {
  targeting: {
    age_min?: number;
    age_max?: number;
    geo_locations?: {
      countries?: string[];
      cities?: Array<{
        key: string;
        name?: string;
      }>;
    };
    advantage_audience?: boolean;
  };
  onTargetingChange: (targeting: {
    age_min: number;
    age_max: number;
    geo_locations: {
      countries: string[];
      cities: Array<{ key: string; name?: string }>;
    };
    advantage_audience: boolean;
  }) => void;
}

const TargetingConfig: React.FC<TargetingConfigProps> = ({
  targeting,
  onTargetingChange,
}) => {
  const [ageMin, setAgeMin] = useState(targeting.age_min || 18);
  const [ageMax, setAgeMax] = useState(targeting.age_max || 45);
  const [countries, setCountries] = useState<string[]>(
    targeting.geo_locations?.countries || ["BD"],
  );
  const [cities, setCities] = useState<Array<{ key: string; name: string }>>(
    (targeting.geo_locations?.cities || []).map((city) => ({
      key: city.key,
      name: city.name || city.key,
    })),
  );
  const [advantageAudience, setAdvantageAudience] = useState(
    targeting.advantage_audience ?? true,
  );

  // Update local state when props change
  useEffect(() => {
    setAgeMin(targeting.age_min || 18);
    setAgeMax(targeting.age_max || 45);
    setCountries(targeting.geo_locations?.countries || ["BD"]);
    setCities(
      (targeting.geo_locations?.cities || []).map((city) => ({
        key: city.key,
        name: city.name || city.key,
      })),
    );
    setAdvantageAudience(targeting.advantage_audience ?? true);
  }, [targeting]);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevTargetingDataRef = useRef<{
    age_min: number;
    age_max: number;
    geo_locations: {
      countries: string[];
      cities: Array<{ key: string; name: string }>;
    };
    advantage_audience: boolean;
  } | null>(null);

  // Update parent when targeting changes
  useEffect(() => {
    const targetingData = {
      age_min: ageMin,
      age_max: ageMax,
      geo_locations: {
        countries: countries,
        cities: cities,
      },
      advantage_audience: advantageAudience,
    };

    // Only update parent if targeting data has actually changed
    const hasChanged =
      !prevTargetingDataRef.current ||
      JSON.stringify(targetingData) !==
        JSON.stringify(prevTargetingDataRef.current);

    if (hasChanged) {
      console.log("🎯 TargetingConfig: Updating parent with:", targetingData);
      onTargetingChange(targetingData);
      prevTargetingDataRef.current = targetingData;
    }
  }, [ageMin, ageMax, countries, cities, advantageAudience]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Search cities
  const searchCities = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    console.log("🔍 Searching cities for query:", query);
    setIsSearching(true);
    try {
      const response = await mediaAPI.searchCities(query, "BD");
      console.log("🔍 City search response:", response);
      console.log("🔍 Cities array:", response.cities);
      setSearchResults(response.cities || []);
    } catch (error) {
      console.error("Error searching cities:", error);
      console.error("Error details:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle city search input change
  const handleCitySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setCitySearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      searchCities(query);
    }, 300);
  };

  // Add city to targeting
  const addCity = (city: City) => {
    console.log("🏙️ Adding city:", city);
    console.log("🏙️ Current cities before adding:", cities);
    if (!cities.find((c) => c.key === city.key)) {
      const newCities = [...cities, { key: city.key, name: city.name }];
      console.log("🏙️ Updated cities array:", newCities);
      setCities(newCities);
      console.log("🏙️ Cities state updated, triggering parent update");
    } else {
      console.log("🏙️ City already exists, not adding");
    }
    setCitySearchQuery("");
    setSearchResults([]);
  };

  // Remove city from targeting
  const removeCity = (cityKey: string) => {
    setCities(cities.filter((c) => c.key !== cityKey));
  };

  // Add country
  const addCountry = (countryCode: string) => {
    if (!countries.includes(countryCode)) {
      setCountries([...countries, countryCode]);
    }
  };

  // Remove country
  const removeCountry = (countryCode: string) => {
    setCountries(countries.filter((c) => c !== countryCode));
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          Targeting Configuration
        </h3>
        <p className="text-sm text-muted-foreground">
          Configure who will see your ads based on demographics and location
        </p>
      </div>

      {/* Age Targeting */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-foreground">Age Range</h4>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <Label
              htmlFor="age-min"
              className="min-w-[40px] text-sm font-medium text-muted-foreground"
            >
              Min:
            </Label>
            <Input
              id="age-min"
              title="Age Range"
              type="number"
              min={18}
              max={65}
              value={ageMin}
              onChange={(e) => setAgeMin(parseInt(e.target.value, 10) || 18)}
              className="w-24 text-center"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Label
              htmlFor="age-max"
              className="min-w-[40px] text-sm font-medium text-muted-foreground"
            >
              Max:
            </Label>
            <Input
              id="age-max"
              title="Age Range"
              type="number"
              min={18}
              max={65}
              value={ageMax}
              onChange={(e) => setAgeMax(parseInt(e.target.value, 10) || 65)}
              className="w-24 text-center"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Target people between {ageMin} and {ageMax} years old
        </p>
      </div>

      {/* Geographic Targeting */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-foreground">
          Geographic Targeting
        </h4>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">
            Countries
          </Label>
          <div className="flex flex-wrap items-center gap-2">
            {countries.map((country) => {
              const label = country === "BD" ? "Bangladesh" : country;
              return (
                <Badge
                  key={country}
                  variant="secondary"
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm"
                >
                  {label}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="-mr-1 h-5 w-5 rounded-full"
                    onClick={() => removeCountry(country)}
                  >
                    <span aria-hidden>×</span>
                    <span className="sr-only">Remove {label}</span>
                  </Button>
                </Badge>
              );
            })}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addCountry("BD")}
              className="flex items-center gap-2"
            >
              <span className="text-base leading-none">+</span>
              Add Bangladesh
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">
            Cities
          </Label>

          <div className="relative">
            <Input
              type="text"
              placeholder="Search cities (e.g., Dhaka, Chittagong)"
              value={citySearchQuery}
              onChange={handleCitySearchChange}
              className="w-full py-3"
            />

            {searchResults.length > 0 && (
              <div className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
                {searchResults.map((city) => (
                  <Button
                    key={city.key}
                    type="button"
                    variant="ghost"
                    onClick={() => addCity(city)}
                    className="flex w-full flex-col items-start gap-1 rounded-none border-b border-border/60 px-4 py-3 text-left last:border-b-0"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {city.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {city.country_code}
                    </span>
                  </Button>
                ))}
              </div>
            )}

            {isSearching && (
              <Loader2 className="absolute top-3.5 right-3.5 size-4 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <Badge
                key={city.key}
                variant="secondary"
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm"
              >
                {city.name}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="-mr-1 h-5 w-5 rounded-full"
                  onClick={() => removeCity(city.key)}
                >
                  <span aria-hidden>×</span>
                  <span className="sr-only">Remove {city.name}</span>
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Advantage+ Audience */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-foreground">Audience Options</h4>
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="advantage-audience"
              checked={advantageAudience}
              onCheckedChange={(checked) =>
                setAdvantageAudience(Boolean(checked))
              }
            />
            <div>
              <Label
                htmlFor="advantage-audience"
                className="text-sm font-medium text-foreground"
              >
                Use Advantage+ Audience (Recommended for Meta 2025)
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Let Meta&apos;s AI find the best audience based on your creative
                content. This is the recommended approach for modern Meta
                advertising.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Targeting Summary */}
      <div className="rounded-lg border border-border bg-muted p-6">
        <h5 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="h-2 w-2 rounded-full bg-primary"></span>
          Targeting Summary
        </h5>
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Age Range:</span>
              <span className="font-medium text-foreground">
                {ageMin} - {ageMax}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Countries:</span>
              <span className="font-medium text-foreground">
                {countries
                  .map((c) => (c === "BD" ? "Bangladesh" : c))
                  .join(", ")}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {cities.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cities:</span>
                <span className="font-medium text-foreground">
                  {cities.map((c) => c.name).join(", ")}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Advantage+ Audience:</span>
              <span
                className={`font-medium ${
                  advantageAudience
                    ? "text-secondary"
                    : "text-muted-foreground"
                }`}
              >
                {advantageAudience ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetingConfig;
