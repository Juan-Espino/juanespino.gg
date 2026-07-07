import Image from "next/image";

export default function NoContent() {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center">
      <h2 className="p-4 text-center text-4xl">{"no articles avaliable!"}</h2>

      <Image
        className="h-auto max-w-md rounded-md object-contain md:max-w-lg"
        src={
          "https://2ugmvs13f3.ufs.sh/f/4tFEuyZH9AIblLx0oMEn9U01MtwiGxAVW3gSBQT6hYPleqau"
        }
        alt="no_content"
        width={600}
        height={400}
      />
    </div>
  );
}
