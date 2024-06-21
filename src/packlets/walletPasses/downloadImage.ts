import { readFileSystem, writeFileSystem } from "../commons/fileSystem";

export const downloadImage = async (imageUrl: string): Promise<Buffer> => {
  const cacheKey = ["walletPasses", "image", imageUrl];

  const fileSystemResult = await readFileSystem<string>(cacheKey);

  if (fileSystemResult !== null)
    return Buffer.from(fileSystemResult.data, "base64");

  const image = await fetch(imageUrl)
    .then((o) => o.arrayBuffer())
    .then((o) => Buffer.from(o));

  (async () => {
    await writeFileSystem(
      cacheKey,
      image.toString("base64"),
      24 * 60 * 60 * 1000, // 1 day
    );
  })();

  return image;
};
