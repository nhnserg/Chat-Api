import fse from 'fs-extra';
import path from 'path';
import { HttpError } from '../helpers/HttpError.js';
import multer from 'multer';

export class ImageService {
  static _temporaryDirPath;
  static _temporaryFilePath;
  static _temporaryFileName;

  static saveOriginalTemporaryFile(name, folder) {
    const storage = multer.diskStorage({
      destination: async (req, file, callback) => {
        try {
          this._temporaryDirPath = path.resolve('tmp', folder);
          await fse.ensureDir(this._temporaryDirPath);

          callback(null, this._temporaryDirPath);
        } catch ({ message }) {
          throw HttpError(400, message);
        }
      },
      filename: (_, file, callback) => {
        this._temporaryFilePath = path.join(
          this._temporaryDirPath,
          file.originalname
        );

        this._temporaryFileName = file.originalname;
        callback(null, file.originalname);
      },
    });

    const fileFilter = (_, file, callback) => {
      if (!file.mimetype.startsWith('image')) {
        callback(HttpError(400, 'Invalid file format'), false);
      } else {
        callback(null, true);
      }
    };

    return multer({ storage, fileFilter }).single(name);
  }
}
