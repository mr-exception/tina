export function log(message: any, ...optionalParams: any[]) {
  const env = process.env["ENV"];
  if (env === "dev") {
    console.log(message, ...optionalParams);
  }
}
