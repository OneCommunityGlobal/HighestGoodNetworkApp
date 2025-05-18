/**
 * Converts any image format to JPG for Instagram compatibility
 * 
 * @param {File} file - The image file to convert
 * @returns {Promise<File>} Converted JPG file
 */
export const convertToJPG = (file) => {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;

          img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;

              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);

              canvas.toBlob((blob) => {
                  if (!blob) {
                      reject(new Error('Failed to convert image to JPG'));
                      return;
                  }

                  const fileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';

                  const convertedFile = new File(
                      [blob],
                      fileName,
                      { type: 'image/jpeg' }
                  );

                  resolve(convertedFile);
              }, 'image/jpeg');
          };

          img.onerror = (error) => {
              reject(error);
          }
      }

      reader.onerror = (error) => {
          reject(new Error('FileReader error: ' + error.message));
      };
  });
};

/**
 * Validates if an image meets Instagram's requirements
 * 
 * @param {File} file - The image file to validate
 * @returns {Promise<{isValid: boolean, message: string, file: File}>} Validation result
 */
export const validateInstagramImage = (file) => {
  const INSTAGRAM_MIN_SIZE = 320; // px (minimum dimension)
  const INSTAGRAM_MAX_SIZE = 1080; // px (Instagram will resize larger images)
  const INSTAGRAM_ASPECT_RATIO_MIN = 4/5; // Portrait minimum (0.8)
  const INSTAGRAM_ASPECT_RATIO_MAX = 1.91/1; // Landscape maximum (1.91)
  const INSTAGRAM_MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

  return new Promise((resolve, reject) => {
    if (file.size > INSTAGRAM_MAX_FILE_SIZE) {
      resolve({
        isValid: false,
        file: null,
        message: "File size exceeds 8MB limit.",
        dimensions: null,
      });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const aspectRatio = width / height;

        const dimensions = { width, height };

        if (width < INSTAGRAM_MIN_SIZE || height < INSTAGRAM_MIN_SIZE) {
          resolve({
            isValid: false,
            file: null,
            message: `Image is too small. Minimum dimension is ${INSTAGRAM_MIN_SIZE}px`,
            dimensions
          });
          return;
        }

        if (width > INSTAGRAM_MAX_SIZE || height > INSTAGRAM_MAX_SIZE) {
          resolve({
            isValid: false,
            file: null,
            message: `Image is too large. Maximum dimension is ${INSTAGRAM_MAX_SIZE}px`,
            dimensions
          });
          return;
        }

        if (aspectRatio < INSTAGRAM_ASPECT_RATIO_MIN || aspectRatio > INSTAGRAM_ASPECT_RATIO_MAX) {
          resolve({
            isValid: false,
            file: null,
            message: `Image aspect ratio (${aspectRatio.toFixed(2)}) is outside Instagram's allowed range (${INSTAGRAM_ASPECT_RATIO_MIN} to ${INSTAGRAM_ASPECT_RATIO_MAX})`,
            dimensions
          });
          return;
        
        }

      }
      resolve({
        isValid: true,
        file: file,
        message: "Image validation successful",
      });
    }

    reader.onerror = (error) => {
      reject(new Error('FileReader error: ' + error.message));
    };
  })

  
}