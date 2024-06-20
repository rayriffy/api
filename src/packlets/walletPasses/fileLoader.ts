export const load = async (filePath: string) => await Bun.file(filePath).text();

export const asset = async (fileName: string, actualResolve?: string) => [
  fileName,
  await load(`${__dirname}/garten/${actualResolve ?? fileName}`),
];

export const certs = (name: string) => load(`${__dirname}/certs/${name}.pem`);
