import { AdLocation } from "@/types/AdLocation";

// Cities with coordinates
const cities = [
  { city: "Tehran", lat: 35.6892, lng: 51.389 },
  { city: "Shiraz", lat: 29.5918, lng: 52.5837 },
  { city: "Isfahan", lat: 32.6539, lng: 51.666 },
  { city: "Tabriz", lat: 38.0709, lng: 46.3005 },
  { city: "Rasht", lat: 37.2808, lng: 49.5832 },
  { city: "Mashhad", lat: 36.297, lng: 59.6062 },
  { city: "Ahvaz", lat: 31.3183, lng: 48.6706 },
  { city: "Hamedan", lat: 34.798, lng: 48.5146 },
  { city: "Kerman", lat: 30.2839, lng: 57.0834 },
  { city: "Kermanshah", lat: 34.3142, lng: 47.065 },
];

const categories = ["apartment", "shop", "office", "land"] as const;

function randomOffset() {
  return (Math.random() - 0.5) * 0.04;
}

function getImageUrl(category: string, id: number): string {
  const imageIds: Record<string, number[]> = {
    apartment: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    shop: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    office: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    land: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
  };

  const ids = imageIds[category] || imageIds.apartment;
  const imageId = ids[id % ids.length];
  return `https://picsum.photos/seed/${category}-${imageId}/400/300`;
}

function generateMockAds(count: number): AdLocation[] {
  const ads: AdLocation[] = [];

  for (let i = 1; i <= count; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];

    const price =
      category === "land"
        ? Math.floor(Math.random() * 4_000_000_000 + 1_000_000_000)
        : Math.floor(Math.random() * 12_000_000_000 + 1_500_000_000);

    ads.push({
      id: i,
      title: `${category} ${i} در ${city.city}`,
      price,
      lat: city.lat + randomOffset(),
      lng: city.lng + randomOffset(),
      city: city.city,
      category,
      image: getImageUrl(category, i),
    });
  }

  return ads;
}

export const mockAds = generateMockAds(100);
