// import sharp from 'sharp';
// import fse from 'fs-extra';
// import debugLib from 'debug';
// import config from '../dotenvConfig.js';
// import { cloudinary } from '../helpers/cloudinary.js';
// import { ImageService } from './image.service.js';

// const debug = debugLib('app:image');
// const { AVATAR_WIDTH, AVATAR_HEIGHT } = config;

// export class ImageAvatarService extends ImageService {
//   static async processAvatarImage(filePath, shape = 'square') {
//     try {
//       debug(
//         '📷 Обработка файла: %s как %s (%dx%d)',
//         filePath,
//         shape,
//         AVATAR_WIDTH,
//         AVATAR_HEIGHT
//       );

//       const tempProcessedPath = filePath.replace(/(\.\w+)$/, `_processed$1`);
//       let transformer = sharp(filePath).resize(AVATAR_WIDTH, AVATAR_HEIGHT);

//       if (shape === 'circle') {
//         transformer = transformer
//           .composite([
//             {
//               input: Buffer.from(
//                 `<svg><circle cx="${AVATAR_WIDTH / 2}" cy="${
//                   AVATAR_HEIGHT / 2
//                 }" r="${
//                   Math.min(AVATAR_WIDTH, AVATAR_HEIGHT) / 2
//                 }" fill="black" /></svg>`
//               ),
//               blend: 'dest-in',
//             },
//           ])
//           .png();
//       }

//       if (shape === 'webp') {
//         transformer = transformer.webp();
//       }

//       await transformer.toFile(tempProcessedPath);
//       await fse.move(tempProcessedPath, filePath, { overwrite: true });

//       debug('✅ Изображение успешно сохранено: %s', filePath);
//     } catch (error) {
//       console.error('❌ Ошибка в processAvatarImage:', error);
//       throw error;
//     }
//   }

//   static async saveImageToCloud(folder) {
//     if (!this._temporaryFilePath) {
//       throw new Error('Временный файл не найден');
//     }

//     const result = await cloudinary.uploader.upload(this._temporaryFilePath, {
//       folder,
//       transformation: [
//         {
//           width: AVATAR_WIDTH,
//           height: AVATAR_HEIGHT,
//           crop: 'fill',
//           gravity: 'face',
//         },
//       ],
//     });

//     return result.secure_url;
//   }
// }
import sharp from 'sharp';
import path from 'path';
import fse from 'fs-extra';
import debugLib from 'debug';
import config from '../dotenvConfig.js';
import { cloudinary } from '../helpers/cloudinary.js';
import { ImageService } from './image.service.js';

const debug = debugLib('app:image');
const { AVATAR_WIDTH, AVATAR_HEIGHT } = config;

export class ImageAvatarService extends ImageService {
  static async processAvatarImage(filePath) {
    try {
      debug('📷 Обработка файла:', filePath);

      const ext = path.extname(filePath);
      const tempProcessedPath = filePath.replace(ext, `_circle.webp`);

      await sharp(filePath)
        .resize(AVATAR_WIDTH, AVATAR_HEIGHT)
        .composite([
          {
            input: Buffer.from(
              `<svg><circle cx="${AVATAR_WIDTH / 2}" cy="${
                AVATAR_HEIGHT / 2
              }" r="${
                Math.min(AVATAR_WIDTH, AVATAR_HEIGHT) / 2
              }" fill="black" /></svg>`
            ),
            blend: 'dest-in',
          },
        ])
        .webp({
          quality: 85,
          lossless: false,
          alphaQuality: 90,
        })
        .toFile(tempProcessedPath);

      await fse.move(tempProcessedPath, filePath, { overwrite: true });

      debug('✅ Круглый аватар успешно сохранён:', filePath);
    } catch (error) {
      console.error('❌ Ошибка в processAvatarImage:', error);
      throw error;
    }
  }

  static async saveImageToCloud(folder) {
    if (!this._temporaryFilePath) {
      throw new Error('Временный файл не найден');
    }

    const result = await cloudinary.uploader.upload(this._temporaryFilePath, {
      folder,
      resource_type: 'image',
      format: 'webp',
      transformation: [
        {
          width: AVATAR_WIDTH,
          height: AVATAR_HEIGHT,
          crop: 'fill',
          gravity: 'face',
        },
      ],
    });

    return result.secure_url;
  }
}
