import { Card, CardContent } from "@/components/ui/card";
import { simpleBlogCard } from "./lib/interface";
import { snClient, urlFor } from "./lib/sanity";
import imageUrlBuilder from '@sanity/image-url'
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const revalidate = 30; // revalidate at most 30 seconds

async function getData() {
  const query = `
  *[_type == "post"] | order(_createdAt desc) {
    title,
    PublishedAt,
    "slug": slug.current,
    image,
    imageTitle,
    description
  }`;

  const data = await snClient.fetch(query);

  return data;
}

export default async function Home() {
  const data: simpleBlogCard[] = await getData();

  return (
    <span>
      <h1>מאמרים</h1>
    <div className="grid grid-cols-1  md:grid-cols-2 mt-5 gap-5">
      {data.map((post, idx) => (
        <Link  key={idx} href={`/blog/${post.slug}`}>
          <Card >
            <div className="relative h-48">
              <Image
                src={urlFor(post.image).url() || ""}
                layout="fill"
                objectFit="cover"
                alt={post.title}
              />
            </div>
            <CardContent className="mt-5">
              <h3 className="text-lg line-clamp-2 font-bold">{post.title}</h3>
              <p className="line-clamp-3 text-sm mt-2 text-gray-600 dark:text-gray-300">
                {post.description}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
    </span>
  );
}
