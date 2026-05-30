import { imageUrl, type GalleryItem } from "@/lib/mock-data";
import Image from "next/image";
import Link from "next/link";

type MediaGridProps = {
  items: GalleryItem[];
};

export function MediaGrid({ items }: MediaGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4 md:p-6">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/gallery/${item.id}`}
          className="group block overflow-hidden rounded-lg bg-bp-panel ring-1 ring-bp-border transition-transform hover:scale-[1.02] hover:ring-bp-gold-dim"
        >
          <article>
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-bp-chip">
              <Image
                src={imageUrl(item.imageId, 400, 533)}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {item.type === "video" && (
                <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {item.duration}
                </span>
              )}
              {item.type === "photo" && (
                <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Photo
                </span>
              )}
              {item.featured && (
                <span className="absolute left-2 top-2 rounded bg-bp-gold px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                  Featured
                </span>
              )}
            </div>
            <div className="px-2 py-2">
              <p className="truncate text-xs font-medium text-white">{item.title}</p>
              <p className="truncate text-[10px] text-gray-500">{item.creator}</p>
              <p className="mt-0.5 text-[10px] font-medium text-bp-yellow">
                ${item.price.toFixed(2)}
              </p>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
