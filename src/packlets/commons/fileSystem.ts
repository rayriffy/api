import { rm, readdir, mkdir } from "node:fs/promises";

const cacheDirectory = "./.cache";

export const getHash = (items: string[]) => {
  const hasher = new Bun.CryptoHasher("sha256");

  items.forEach((item) => hasher.update(item));

  return hasher.digest().toString("base64").replace(/\//g, "-");
};

export const purgeFileSystem = async (key: string[]) => {
  const hash = getHash(key);
  const requestedDirectory = `${cacheDirectory}/${hash}`;

  try {
    await rm(requestedDirectory, {
      recursive: true,
    });
  } catch (e) {}
};

export const readFileSystem = async <T = unknown>(key: string[]) => {
  const hash = getHash(key);
  const requestedDirectory = `${cacheDirectory}/${hash}`;

  try {
    const now = Date.now();
    const files = await readdir(requestedDirectory);

    for (const file of files) {
      const [maxAgeString, expireAtString, etag, extension] = file.split(".");
      const filePath = `${requestedDirectory}/${file}`;
      const expireAt = Number(expireAtString);

      if (expireAt < now) {
        await rm(filePath);
      } else {
        const cachedMarkdownResponse = await Bun.file(filePath)
          .text()
          .then((o) => JSON.parse(o) as T);

        return {
          etag,
          data: cachedMarkdownResponse,
        };
      }
    }
  } catch (e) {}
  return null;
};

export const writeFileSystem = async (
  key: string[],
  content: unknown,
  maxAgeInMs = 60 * 1000,
) => {
  const stringifiedContent = JSON.stringify(content);

  const hash = getHash(key);
  const etag = getHash([stringifiedContent]);
  const requestedDirectory = `${cacheDirectory}/${hash}`;
  const targetFileName = `${maxAgeInMs}.${maxAgeInMs + Date.now()}.${etag}.json`;

  const builtPath = `${requestedDirectory}/${targetFileName}`;

  try {
    await mkdir(requestedDirectory, { recursive: true });
    await Bun.write(builtPath, stringifiedContent);

    return {
      etag,
      data: content,
    };
  } catch (e) {
    console.log(`failed to write [${key.join(", ")}] to filesystem`);
    await rm(builtPath).catch(() => {});
  }
};
