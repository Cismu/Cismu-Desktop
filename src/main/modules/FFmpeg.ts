import FluentFFmpeg, { FfprobeData } from "fluent-ffmpeg";
import { join, resolve } from "path";
import { platform, arch } from "os";
import { app } from "electron";

import { FFprobeID3, TFormatsSoported, FFprobeData } from "../../types/main";
import { getTempPath } from "../utils";
import logger from "../logger";
import Storage from "./Storage";
import { paths } from "../constants";

class FFmpeg {
  ffmpeg: typeof FluentFFmpeg;
  storage: Storage;

  constructor(storage: Storage) {
    let FFmpegPath = resolve(join(__dirname, `../../bins/${platform()}/${arch()}/ffmpeg`));
    let FFprobePath = resolve(join(__dirname, `../../bins/${platform()}/${arch()}/ffprobe`));

    if (app.isPackaged) {
      FFmpegPath = resolve(join(__dirname, "../../../app.asar.unpacked/.webpack/bins/ffmpeg"));
      FFprobePath = resolve(join(__dirname, "../../../app.asar.unpacked/.webpack/bins/ffprobe"));
    }

    FluentFFmpeg.setFfmpegPath(FFmpegPath);
    FluentFFmpeg.setFfprobePath(FFprobePath);

    this.ffmpeg = FluentFFmpeg;
    this.storage = storage;
  }

  async getMetadata(input: string) {
    try {
      const ffprobeData = await new Promise<FfprobeData>((resolve, reject) => {
        this.ffmpeg.ffprobe(input, (err, data) => {
          if (err) reject(err);
          resolve(data);
        });
      });

      const { streams, format } = ffprobeData;
      const { tags } = format;
      const stream = streams[0];

      const id3: FFprobeID3 = {
        title: String(tags && (tags.title ?? tags.TITLE)) || null,
        album: String(tags && (tags.album ?? tags.ALBUM)) || null,
        artist: String(tags && (tags.artist ?? tags.ARTIST)) || null,
        track_num: Number(tags && (tags.track ?? tags.TRACK)) || null,
        genre: String(tags && (tags.genre ?? tags.GENRE)) || null,
        date: String(tags && (tags.date ?? tags.DATE)) || null,
        picture: null,
      };

      if (id3.artist.toString().split(",").length > 1) {
        id3.artist = id3.artist.toString().split(",");
      } else if (id3.artist.toString().split(";").length > 1) {
        id3.artist = id3.artist.toString().split(";");
      }

      const metadata: FFprobeData = {
        id3,
        format: {
          filename: String(format.filename),
          format_name: String(format.format_name),
          format_long_name: String(format.format_long_name),
          nb_streams: Number(format.nb_streams),
          duration: Number(format.duration),
          start_time: Number(format.start_time),
          bit_rate: Number(format.bit_rate),
          channels: Number(stream.channels),
          channel_layout: String(stream.channel_layout),
          codec_type: String(stream.codec_type),
          sample_rate: Number(stream.sample_rate),
          probe_score: Number(format.probe_score),
        },
      };

      if (streams.length > 1) {
        const stream = streams.find((stream) => stream.codec_type === "video");
        if (stream) {
          try {
            metadata.id3.picture = await this.extractCover(input);
          } catch (error) {
            logger.error(error);
            metadata.id3.picture = null;
          }
        }
      }

      return metadata;
    } catch (error) {
      logger.error(error);
    }
  }

  async convertFile(input: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const tempPath = getTempPath() + ".flac";

      const command = this.ffmpeg();
      command.input(input);
      command.format("flac");
      command.output(tempPath);
      command.run();

      command.on("end", () => {
        try {
          resolve(this.storage.saveFile(tempPath, paths.folders.media));
        } catch (error) {
          reject(error);
        }
      });

      command.on("error", (err) => {
        reject(err);
      });
    });
  }

  /**
   * Extracts the cover from the input and saves it.
   *
   * @param {string} input - The input to extract the cover from.
   * @return {Promise<string>} A promise that resolves to the path of the saved cover.
   */
  private async extractCover(input: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const tempCover = getTempPath() + ".png";

      const command = this.ffmpeg();
      command.input(input);
      command.outputOptions("-an");
      command.output(tempCover);
      command.run();

      command.on("end", () => {
        try {
          resolve(this.storage.saveFile(tempCover));
        } catch (error) {
          reject(error);
        }
      });

      command.on("error", (err) => {
        reject(err);
      });
    });
  }
}

export default FFmpeg;

// ffmpeg -y -i "02. Gimme×Gimme.flac" -c:a pcm_s16le -ar 48000 -map_metadata -1 -map 0 -vn output.wav
