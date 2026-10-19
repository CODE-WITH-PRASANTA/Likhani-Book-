/**
 * Utility to fetch current browser GPS coordinates and reverse-geocode into
 * structured address fields (pincode, locality, street, city, state).
 */

export const getCurrentLocationAddress = async () => {
  if (typeof window === "undefined" || !navigator.geolocation) {
    throw new Error("Geolocation is not supported by your browser.");
  }

  // 1. Get Lat/Lng from Browser Geolocation
  const position = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      (err) => {
        let message = "Unable to fetch your location.";
        if (err.code === 1) {
          message =
            "Location access was denied. Please enable location permission in your browser to auto-fill.";
        } else if (err.code === 2) {
          message = "Location information is unavailable. Please enter address manually.";
        } else if (err.code === 3) {
          message = "Location request timed out. Please try again or enter address manually.";
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  });

  const { latitude, longitude } = position.coords;

  // 2. Reverse Geocoding with Fallback
  let parsedAddress = {
    pincode: "",
    locality: "",
    street: "",
    city: "",
    state: "",
    landmark: "",
    formattedAddress: "",
  };

  // Attempt 1: Nominatim OpenStreetMap
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      parsedAddress.pincode = addr.postcode ? String(addr.postcode).replace(/\D/g, "").slice(0, 6) : "";
      parsedAddress.locality =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.subdistrict ||
        addr.quarter ||
        addr.city_district ||
        "";
      parsedAddress.street = [
        addr.building,
        addr.house_number,
        addr.road || addr.pedestrian || addr.footway,
      ]
        .filter(Boolean)
        .join(", ");
      parsedAddress.city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.municipality ||
        addr.county ||
        "";
      parsedAddress.state = addr.state || "Odisha";
      parsedAddress.formattedAddress = data.display_name || "";

      if (parsedAddress.pincode || parsedAddress.city || parsedAddress.locality) {
        return parsedAddress;
      }
    }
  } catch (nomErr) {
    console.warn("Nominatim reverse geocode attempt failed, trying fallback:", nomErr);
  }

  // Attempt 2: BigDataCloud Client Reverse Geocode (free, high-uptime, no key required)
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      parsedAddress.pincode = data.postcode ? String(data.postcode).replace(/\D/g, "").slice(0, 6) : "";
      parsedAddress.locality = data.locality || "";
      parsedAddress.city =
        data.city ||
        (Array.isArray(data.localityInfo?.administrative)
          ? data.localityInfo.administrative.find((a) => a.adminLevel === 6)?.name
          : "") ||
        "";
      parsedAddress.state = data.principalSubdivision || "Odisha";

      return parsedAddress;
    }
  } catch (bdcErr) {
    console.warn("BigDataCloud reverse geocode attempt failed:", bdcErr);
  }

  // If both reverse geocoders didn't yield structured details but we have coords
  if (parsedAddress.pincode || parsedAddress.city) {
    return parsedAddress;
  }

  throw new Error("Could not determine address from coordinates. Please fill manually.");
};
