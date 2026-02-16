import type { ImageMetadata } from "astro";

export interface Prize {
  image: ImageMetadata;
  name: string;
  date: string;
  link: string;
  priority?: boolean;
}
