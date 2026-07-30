import type { Conference } from "../types/conference";

export const conferences: Conference[] = [
  {
    id: 1,
    title: "Indonesia AI Summit 2026",
    description: "The largest AI conference in Indonesia.",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200",
    location: "Jakarta",
    date: "20 September 2026",
    price: 299000,
    category: "AI",
  },
  {
    id: 2,
    title: "Cloud Expo Indonesia",
    description: "Explore the future of cloud computing.",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200",
    location: "Bandung",
    date: "10 October 2026",
    price: 199000,
    category: "Cloud",
  },
  {
    id: 3,
    title: "DevFest Indonesia",
    description: "Meet developers from all around Indonesia.",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200",
    location: "Surabaya",
    date: "5 November 2026",
    price: 399000,
    category: "Web",
  },
];