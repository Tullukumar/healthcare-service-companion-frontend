import { useEffect, useState } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_LOCATION = {
  latitude: 28.4744,
  longitude: 77.5039,
};

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const patientIcon = L.divIcon({
  className: "patient-location-marker",
  html: `
    <div
      style="
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: #2563eb;
        border: 4px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <div
        style="
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: white;
        "
      ></div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const pickupIcon = L.divIcon({
  className: "pickup-location-marker",
  html: `
    <div
      style="
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        background: #dc2626;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.35);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <div
        style="
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: white;
        "
      ></div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const getAddressFromCoordinates = async (
  latitude,
  longitude
) => {
  try {
    const url =
      "https://nominatim.openstreetmap.org/reverse" +
      `?format=json&lat=${latitude}` +
      `&lon=${longitude}` +
      "&zoom=18&addressdetails=1";

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Unable to get address");
    }

    const data = await response.json();

    return data.display_name || "Address not found";
  } catch (error) {
    console.error(
      "Reverse geocoding error:",
      error
    );

    return "Unable to find address";
  }
};

const searchLocation = async (query) => {
  try {
    const url =
      "https://nominatim.openstreetmap.org/search" +
      `?format=json&q=${encodeURIComponent(query)}` +
      "&limit=1&addressdetails=1";

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Search failed");
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    return {
      latitude: Number(data[0].lat),
      longitude: Number(data[0].lon),
      address: data[0].display_name,
    };
  } catch (error) {
    console.error(
      "Location search error:",
      error
    );

    return null;
  }
};

function MapController({ location }) {
  const map = useMap();

  useEffect(() => {
    if (!location) {
      return;
    }

    const latitude = Number(
      location.latitude
    );

    const longitude = Number(
      location.longitude
    );

    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {
      map.setView(
        [latitude, longitude],
        17
      );
    }
  }, [location, map]);

  return null;
}

function MapClickHandler({
  onSelectLocation,
}) {
  useMapEvents({
    click(event) {
      const latitude =
        event.latlng.lat;

      const longitude =
        event.latlng.lng;

      onSelectLocation({
        latitude,
        longitude,
        source: "manual",
      });
    },
  });

  return null;
}

function LocationPicker({
  location,
  onLocationChange,
  onAddressChange = () => {},
}) {
  const [selectedLocation, setSelectedLocation] =
    useState(
      location || DEFAULT_LOCATION
    );

  const [gpsLocation, setGpsLocation] =
    useState(null);

  const [gpsAccuracy, setGpsAccuracy] =
    useState(null);

  const [address, setAddress] =
    useState("");

  const [addressLoading, setAddressLoading] =
    useState(false);

  const [gpsLoading, setGpsLoading] =
    useState(false);

  const [searchText, setSearchText] =
    useState("");

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [searchError, setSearchError] =
    useState("");

  const [error, setError] =
    useState("");

  const updateAddress = async (
    latitude,
    longitude
  ) => {
    try {
      setAddressLoading(true);

      const result =
        await getAddressFromCoordinates(
          latitude,
          longitude
        );

      setAddress(result);

      onAddressChange(result);
    } catch (error) {
      console.error(error);

      setAddress(
        "Unable to find address"
      );

      onAddressChange(
        "Unable to find address"
      );
    } finally {
      setAddressLoading(false);
    }
  };

  const selectLocation = async ({
    latitude,
    longitude,
    source = "manual",
    accuracy = null,
    selectedAddress = null,
  }) => {
    const newLocation = {
      latitude,
      longitude,
    };

    setSelectedLocation(
      newLocation
    );

    onLocationChange(
      newLocation
    );

    setError("");

    if (source === "gps") {
      setGpsLocation(
        newLocation
      );

      setGpsAccuracy(
        accuracy
      );
    }

    if (selectedAddress) {
      setAddress(
        selectedAddress
      );

      onAddressChange(
        selectedAddress
      );
    } else {
      await updateAddress(
        latitude,
        longitude
      );
    }
  };

  const detectCurrentLocation =
    () => {
      setGpsLoading(true);
      setError("");

      if (
        !window.navigator ||
        !window.navigator.geolocation
      ) {
        setError(
          "Geolocation is not supported by this browser."
        );

        setGpsLoading(false);

        return;
      }

      window.navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude =
            position.coords
              .latitude;

          const longitude =
            position.coords
              .longitude;

          const accuracy =
            position.coords
              .accuracy;

          await selectLocation({
            latitude,
            longitude,
            accuracy,
            source: "gps",
          });

          setGpsLoading(false);
        },

        (geoError) => {
          console.error(
            "GPS Error:",
            geoError
          );

          setGpsLoading(false);

          if (
            geoError.code === 1
          ) {
            setError(
              "Location permission denied. Please allow location access."
            );
          } else if (
            geoError.code === 2
          ) {
            setError(
              "Unable to determine your location."
            );
          } else if (
            geoError.code === 3
          ) {
            setError(
              "Location request timed out. Please try again."
            );
          } else {
            setError(
              "Unable to get your current location."
            );
          }
        },

        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        }
      );
    };

  const handleSearch = async (
    event
  ) => {
    event.preventDefault();

    if (!searchText.trim()) {
      setSearchError(
        "Please enter a location."
      );

      return;
    }

    try {
      setSearchLoading(true);
      setSearchError("");
      setError("");

      const result =
        await searchLocation(
          searchText.trim()
        );

      if (!result) {
        setSearchError(
          "Location not found."
        );

        return;
      }

      await selectLocation({
        latitude:
          result.latitude,
        longitude:
          result.longitude,
        source: "search",
        selectedAddress:
          result.address,
      });

      setSearchText("");
    } catch (error) {
      console.error(error);

      setSearchError(
        "Unable to search for this location."
      );
    } finally {
      setSearchLoading(false);
    }
  };

  const getAccuracyText = () => {
    if (!gpsAccuracy) {
      return "";
    }

    const accuracy =
      Math.round(gpsAccuracy);

    if (accuracy <= 10) {
      return `Very accurate - approximately ${accuracy} meters`;
    }

    if (accuracy <= 30) {
      return `Good accuracy - approximately ${accuracy} meters`;
    }

    if (accuracy <= 100) {
      return `Moderate accuracy - approximately ${accuracy} meters`;
    }

    return `Low accuracy - approximately ${accuracy} meters`;
  };

  const mapLocation =
    selectedLocation ||
    DEFAULT_LOCATION;

  return (
    <div className="w-full">

      <form
        onSubmit={handleSearch}
        className="mb-4 flex flex-col gap-2 sm:flex-row"
      >
        <input
          type="text"
          value={searchText}
          onChange={(event) => {
            setSearchText(
              event.target.value
            );

            setSearchError("");
          }}
          placeholder="Search your pickup location..."
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
        />

        <button
          type="submit"
          disabled={searchLoading}
          className="rounded-lg bg-gray-800 px-5 py-3 font-medium text-white hover:bg-gray-900 disabled:opacity-60"
        >
          {searchLoading
            ? "Searching..."
            : "Search"}
        </button>
      </form>

      {searchError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            {searchError}
          </p>
        </div>
      )}

      <div className="relative overflow-hidden rounded-xl border border-gray-200 shadow-sm">

        <MapContainer
          center={[
            mapLocation.latitude,
            mapLocation.longitude,
          ]}
          zoom={17}
          minZoom={3}
          maxZoom={20}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          zoomControl={true}
          className="h-96 w-full"
        >

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController
            location={
              selectedLocation
            }
          />

          <MapClickHandler
            onSelectLocation={
              selectLocation
            }
          />

          {gpsLocation && (
            <>
              <Marker
                position={[
                  gpsLocation.latitude,
                  gpsLocation.longitude,
                ]}
                icon={
                  patientIcon
                }
              >
                <Popup>
                  <strong>
                    Your Current Location
                  </strong>

                  {gpsAccuracy && (
                    <div className="mt-1 text-sm">
                      Accuracy: ±
                      {Math.round(
                        gpsAccuracy
                      )}{" "}
                      m
                    </div>
                  )}
                </Popup>
              </Marker>

              {gpsAccuracy && (
                <Circle
                  center={[
                    gpsLocation.latitude,
                    gpsLocation.longitude,
                  ]}
                  radius={
                    gpsAccuracy
                  }
                  pathOptions={{
                    color:
                      "#2563eb",
                    fillColor:
                      "#2563eb",
                    fillOpacity:
                      0.12,
                    weight: 2,
                  }}
                />
              )}
            </>
          )}

          {selectedLocation && (
            <Marker
              position={[
                selectedLocation.latitude,
                selectedLocation.longitude,
              ]}
              icon={
                gpsLocation &&
                selectedLocation.latitude ===
                  gpsLocation.latitude &&
                selectedLocation.longitude ===
                  gpsLocation.longitude
                  ? patientIcon
                  : pickupIcon
              }
            >
              <Popup>
                <div className="max-w-xs">

                  <strong>
                    Pickup Location
                  </strong>

                  <div className="mt-1 text-xs">
                    Latitude:{" "}
                    {selectedLocation.latitude.toFixed(
                      6
                    )}
                  </div>

                  <div className="text-xs">
                    Longitude:{" "}
                    {selectedLocation.longitude.toFixed(
                      6
                    )}
                  </div>

                </div>
              </Popup>
            </Marker>
          )}

        </MapContainer>

        <button
          type="button"
          onClick={
            detectCurrentLocation
          }
          disabled={gpsLoading}
          className="absolute bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-white px-4 py-3 font-semibold text-gray-800 shadow-lg hover:bg-gray-50 disabled:opacity-60"
        >
          <span className="text-lg">
            📍
          </span>

          {gpsLoading
            ? "Finding location..."
            : "Use my location"}
        </button>

        <div className="absolute left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-center text-xs font-medium text-gray-700 shadow-md">
          Tap anywhere on the map to select pickup
        </div>

      </div>

      {gpsAccuracy && (
        <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">

          <p className="text-sm font-semibold text-blue-800">
            GPS Location
          </p>

          <p className="mt-1 text-xs text-blue-700">
            {getAccuracyText()}
          </p>

        </div>
      )}

      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

          <p className="text-sm font-medium text-red-700">
            {error}
          </p>

        </div>
      )}

      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">

        <div className="mb-2 flex items-center gap-2">

          <span className="text-lg">
            📍
          </span>

          <h3 className="font-semibold text-gray-900">
            Pickup Address
          </h3>

        </div>

        {addressLoading ? (
          <p className="text-sm text-gray-500">
            Finding address...
          </p>
        ) : (
          <p className="text-sm leading-6 text-gray-700">
            {address ||
              "Use your current location or tap on the map."}
          </p>
        )}

      </div>

      {selectedLocation && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">

          <div className="rounded-lg bg-gray-50 p-3">

            <p className="text-xs font-medium text-gray-500">
              Latitude
            </p>

            <p className="mt-1 font-mono text-sm text-gray-800">
              {selectedLocation.latitude.toFixed(
                6
              )}
            </p>

          </div>

          <div className="rounded-lg bg-gray-50 p-3">

            <p className="text-xs font-medium text-gray-500">
              Longitude
            </p>

            <p className="mt-1 font-mono text-sm text-gray-800">
              {selectedLocation.longitude.toFixed(
                6
              )}
            </p>

          </div>

        </div>
      )}

      <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3">

        <p className="text-xs leading-5 text-gray-600">
          <strong>
            Tip:
          </strong>{" "}
          Press{" "}
          <strong>
            Use my location
          </strong>{" "}
          to automatically detect your
          current GPS location. You can
          also search or tap the map to
          select another pickup point.
        </p>

      </div>

    </div>
  );
}

export default LocationPicker;