type Slug = {
  _type: "slug";
  current: string;
};
export interface simpleBlogCard {
  title: string;
  slug: Slug;
  currentSlug: string;
  author: any;
  publishedAt: string;
  image: any;
  imageTitle: string;
  description: string;
  comments: any[];
  _id: string;
  body: string;
}

export interface fullBlog {
  currentSlug: string;
  title: string;
  content: any;
  titleImage: any;
}
