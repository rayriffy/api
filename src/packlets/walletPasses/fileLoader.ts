export const load = async (filePath: string) =>
  Buffer.from(await Bun.file(filePath).arrayBuffer());

export const assetLoader =
  (template: string) => async (fileName: string, actualResolve?: string) => [
    fileName,
    await load(`${__dirname}/${template}/${actualResolve ?? fileName}`),
  ];

export const certs = (name: string) => load(`${__dirname}/certs/${name}.pem`);
