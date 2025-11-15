export type AdLocation = {
  id: number;
  title: string;
  price: number;
  category: "apartment" | "shop" | "land" | "office";
  lat: number;
  lng: number;
  city: string;
  image: string;
  createdAt?: string;
};
