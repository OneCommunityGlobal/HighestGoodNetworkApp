/**
 * Converts any image format to JPG for Imgur compatibility
 *
 * @param {File} file - The image file to convert
 * @returns {Promise<File>} Converted JPG file
 */
export const convertToJPG = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = event => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(blob => {
          if (!blob) {
            reject(new Error('Failed to convert image to JPG'));
            return;
          }

          const fileName = `${file.name.replace(/\.[^/.]+$/, '')}.jpg`;

          const convertedFile = new File([blob], fileName, { type: 'image/jpeg' });

          resolve(convertedFile);
        }, 'image/jpeg');
      };

      img.onerror = error => {
        reject(error);
      };
    };

    reader.onerror = error => {
      reject(new Error(`FileReader error: ${error.message}`));
    };
  });
};

/**
 * Validates if an image meets Imgur's requirements
 *
 * @param {File} file - The image file to validate
 * @returns {Promise<{isValid: boolean, message: string, file: File}>} Validation result
 */
export const validateImgurImage = file => {
  const IMGUR_MIN_SIZE = 320; // px (minimum dimension)
  const IMGUR_MAX_SIZE = 1080; // px (Imgur will resize larger images)
  const IMGUR_ASPECT_RATIO_MIN = 4 / 5; // Portrait minimum (0.8)
  const IMGUR_ASPECT_RATIO_MAX = 1.91 / 1; // Landscape maximum (1.91)
  const IMGUR_MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

  return new Promise((resolve, reject) => {
    if (file.size > IMGUR_MAX_FILE_SIZE) {
      resolve({
        isValid: false,
        file: null,
        message: 'File size exceeds 8MB limit.',
        dimensions: null,
      });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = event => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const { width } = img;
        const { height } = img;
        const aspectRatio = width / height;

        const dimensions = { width, height };

        if (width < IMGUR_MIN_SIZE || height < IMGUR_MIN_SIZE) {
          resolve({
            isValid: false,
            file: null,
            message: `Image is too small. Minimum dimension is ${IMGUR_MIN_SIZE}px`,
            dimensions,
          });
          return;
        }

        if (width > IMGUR_MAX_SIZE || height > IMGUR_MAX_SIZE) {
          resolve({
            isValid: false,
            file: null,
            message: `Image is too large. Maximum dimension is ${IMGUR_MAX_SIZE}px`,
            dimensions,
          });
          return;
        }

        if (aspectRatio < IMGUR_ASPECT_RATIO_MIN || aspectRatio > IMGUR_ASPECT_RATIO_MAX) {
          resolve({
            isValid: false,
            file: null,
            message: `Image aspect ratio (${aspectRatio.toFixed(
              2,
            )}) is outside Imgur's allowed range (${IMGUR_ASPECT_RATIO_MIN} to ${IMGUR_ASPECT_RATIO_MAX})`,
            dimensions,
          });
        }
      };
      resolve({
        isValid: true,
        file,
        message: 'Image validation successful',
      });
    };

    reader.onerror = error => {
      reject(new Error(`FileReader error: ${error.message}`));
    };
  });
};
