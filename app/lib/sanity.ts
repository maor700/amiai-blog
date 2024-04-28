import { SanityClient, createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import { config } from "../../config";


export const snClient: SanityClient = createClient({
  apiVersion: config.SANITY_API_VERSION,
  projectId: config.SANITY_PROJECT_ID,
  dataset: config.SANITY_DATASET,
  token: config.SANITY_TOKEN,
  useCdn: true,
}) as SanityClient;

const builder = imageUrlBuilder(snClient);

export function urlFor(source: any) {
  return builder.image(source);
}
