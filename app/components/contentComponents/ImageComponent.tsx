import { urlFor } from "@/app/lib/sanity";

export const ImageComponent = ({value}: any) => {
  const imageSrc = urlFor(value).url() || "";
    return <img src={imageSrc} alt={value.alt} />;
  };