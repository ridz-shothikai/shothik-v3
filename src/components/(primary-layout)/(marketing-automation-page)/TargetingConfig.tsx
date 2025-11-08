"use client";

import { mediaAPI } from "@/services/marketing-automation.service";
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
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Targeting Configuration
        </h3>
        <p className="text-sm text-gray-600">
          Configure who will see your ads based on demographics and location
        </p>
      </div>

      {/* Age Targeting */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-700">Age Range</h4>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <label className="min-w-[40px] text-sm font-medium text-gray-600">
              Min:
            </label>
            <input
              title="Age Range"
              type="number"
              min="18"
              max="65"
              value={ageMin}
              onChange={(e) => setAgeMin(parseInt(e.target.value) || 18)}
              className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-center transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center space-x-3">
            <label className="min-w-[40px] text-sm font-medium text-gray-600">
              Max:
            </label>
            <input
              title="Age Range"
              type="number"
              min="18"
              max="65"
              value={ageMax}
              onChange={(e) => setAgeMax(parseInt(e.target.value) || 65)}
              className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-center transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Target people between {ageMin} and {ageMax} years old
        </p>
      </div>

      {/* Geographic Targeting */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-gray-700">
          Geographic Targeting
        </h4>

        {/* Countries */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-600">Countries</label>
          <div className="flex flex-wrap gap-2">
            {countries.map((country) => (
              <span
                key={country}
                className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-100 px-3 py-2 text-sm text-blue-800"
              >
                {country === "BD" ? "Bangladesh" : country}
                <button
                  onClick={() => removeCountry(country)}
                  className="ml-2 rounded-full p-0.5 text-blue-600 transition-all hover:bg-blue-200 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              onClick={() => addCountry("BD")}
              className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all hover:bg-gray-50"
            >
              <span className="text-gray-500">+</span> Add Bangladesh
            </button>
          </div>
        </div>

        {/* Cities */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-600">Cities</label>

          {/* City Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search cities (e.g., Dhaka, Chittagong)"
              value={citySearchQuery}
              onChange={handleCitySearchChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {searchResults.map((city) => (
                  <button
                    key={city.key}
                    onClick={() => addCity(city)}
                    className="w-full border-b border-gray-100 px-4 py-3 text-left transition-all last:border-b-0 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  >
                    <div className="font-medium text-gray-900">{city.name}</div>
                    <div className="text-sm text-gray-500">
                      {city.country_code}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {isSearching && (
              <div className="absolute top-4 right-4">
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>

          {/* Selected Cities */}
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <span
                key={city.key}
                className="inline-flex items-center rounded-lg border border-green-200 bg-green-100 px-3 py-2 text-sm text-green-800"
              >
                {city.name}
                <button
                  onClick={() => removeCity(city.key)}
                  className="ml-2 rounded-full p-0.5 text-green-600 transition-all hover:bg-green-200 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Advantage+ Audience */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-700">Audience Options</h4>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <label className="flex cursor-pointer items-start space-x-3">
            <input
              type="checkbox"
              checked={advantageAudience}
              onChange={(e) => setAdvantageAudience(e.target.checked)}
              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                Use Advantage+ Audience (Recommended for Meta 2025)
              </span>
              <p className="mt-1 text-xs text-gray-600">
                Let Meta's AI find the best audience based on your creative
                content. This is the recommended approach for modern Meta
                advertising.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Targeting Summary */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h5 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
          Targeting Summary
        </h5>
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Age Range:</span>
              <span className="font-medium text-gray-900">
                {ageMin} - {ageMax}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Countries:</span>
              <span className="font-medium text-gray-900">
                {countries
                  .map((c) => (c === "BD" ? "Bangladesh" : c))
                  .join(", ")}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {cities.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Cities:</span>
                <span className="font-medium text-gray-900">
                  {cities.map((c) => c.name).join(", ")}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Advantage+ Audience:</span>
              <span
                className={`font-medium ${
                  advantageAudience ? "text-green-600" : "text-gray-500"
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
