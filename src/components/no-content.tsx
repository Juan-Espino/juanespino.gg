import Image from "next/image";

export default function NoContent() {
  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="p-4 text-center text-4xl">{"No Articles avaliable!"}</h2>

      <Image
        className="h-auto max-w-3xl rounded-md object-contain"
        src={
          "https://static.independent.co.uk/s3fs-public/thumbnails/image/2016/02/20/16/50centbroke.jpg"
        }
        alt="no_content"
        width={1200}
        height={800}
      />
    </div>
  );
}
