import Sqlite3, { Database as TSqlite3 } from "better-sqlite3";
import { FFprobeData, FFprobeID3 } from "../../types/main";
import { paths } from "../constants";
import { resolve, join } from "path";
import { app } from "electron";

class Database {
  private globalDB: TSqlite3;

  constructor() {
    let nativeBinding = resolve(join(__dirname, "./native_modules/build/Release/better_sqlite3"));

    if (app.isPackaged) {
      nativeBinding = resolve(
        join(
          __dirname,
          "../../../app.asar.unpacked/.webpack/main/native_modules/build/Release/better_sqlite3"
        )
      );
    }

    this.globalDB = new Sqlite3(paths.files.globalDatabase);
    this.createTables();
  }

  fetchAllSongs() {
    const query = "SELECT * FROM songs;";
    const RawSongs = this.globalDB.prepare(query).all() as IRawSongDB[];
    const songs: ISongDB[] = [];

    RawSongs.map((song) => {
      song.format = JSON.stringify(song.format);
      song.id3 = JSON.stringify(song.id3);
      songs.push();
    });

    return songs;
  }

  private createTables() {
    const query = `
      CREATE TABLE IF NOT EXISTS "songs" (
        "id" TEXT NOT NULL,
        "path" TEXT NOT NULL CHECK(length("path") != 0),
        "hash" TEXT NOT NULL CHECK(length("path") != 0),
        "size" INTEGER NOT NULL,
        "timestamp" INTEGER NOT NULL CHECK("timestamp" != 0),
        "id3" TEXT,
        "format" TEXT,
        PRIMARY KEY("id")
      );
    `;

    this.globalDB.exec(query);
  }
}

export default Database;

interface IRawSongDB {
  id: string;
  path: string;
  hash: string;
  size: number;
  timestamp: number;
  id3: any;
  format: any;
}

interface ISongDB extends IRawSongDB {
  id3: FFprobeData;
  format: FFprobeID3;
}

// // Uso de la clase MusicDatabase
// if (require.main === module) {
//   // Crear una instancia de la clase MusicDatabase
//   const musicDb = new MusicDatabase();

//   // Insertar canciones de ejemplo
//   musicDb.insertSong("path/to/song1.mp3");
//   musicDb.insertSong("path/to/song2.mp3");

//   // Consultar y mostrar todas las canciones en la base de datos
//   const songs = musicDb.fetchAllSongs();
//   console.log(songs);
// }

// public insertSong(file_path: string) {
//   // const buffer = fs.readFileSync(file_path);
//   // const metadata: any = {};
//   // if (metadata) {
//   //   const query = `
//   //             INSERT INTO music (title, artist, album, genre, year)
//   //             VALUES (?, ?, ?, ?, ?);
//   //         `;
//   //   const values = [
//   //     metadata.title,
//   //     metadata.artist ? metadata.artist.join(", ") : null,
//   //     metadata.album,
//   //     metadata.genre ? metadata.genre.join(", ") : null,
//   //     metadata.year || null,
//   //   ];
//   //   this.db.prepare(query).run(values);
//   // }
// }
