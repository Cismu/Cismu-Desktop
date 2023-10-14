import crypto from "crypto";

export function createHash(data: crypto.BinaryLike, algorithm: string = "sha256") {
  return crypto.createHash(algorithm).update(data).digest("hex");
}
