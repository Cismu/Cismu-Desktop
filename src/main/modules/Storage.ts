import { createHash } from "../crypto";
import { paths } from "../constants";
import Database from "./Database";
import { join } from "path";
import fs from "../fs";

class Storage {
  private db: Database;

  constructor(database: Database) {
    this.db = database;
  }

  saveFile(tempCoverPath: string, parent: string = paths.folders.cache) {
    // hash: 1a47929b6056d34d25a95eeb20.... >> {path}/1/1a/1a47929b6056d34d25a95eeb20....

    try {
      const data = fs.readFileSync(tempCoverPath);
      const hash = createHash(data);

      const filePath = join(parent, hash[0], hash.substring(0, 2));
      fs.mkdirSync(filePath, { recursive: true });
      fs.moveSync(tempCoverPath, join(filePath, hash), { overwrite: true });
      return join(filePath, hash);
    } catch (error) {
      throw error;
    }
  }

  init() {
    const songs = this.db.fetchAllSongs();
    console.log("Storage fetchAllSongs: ", songs);
  }
}

export default Storage;
