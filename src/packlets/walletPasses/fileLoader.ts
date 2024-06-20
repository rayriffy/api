export const load = async (filePath: string) => await Bun.file(filePath).text();

export const asset = async (fileName: string, actualResolve?: string) => [
  fileName,
  await load(`./garten/${actualResolve ?? fileName}`),
];

export const certs = async (name: string) =>
  await load(
    `${process.env.NODE_ENV === "production" ? "/certs" : "./certs"}/${name}.pem`,
  );
