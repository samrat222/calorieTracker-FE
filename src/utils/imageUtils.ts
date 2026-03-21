import * as ImageManipulator from "expo-image-manipulator";

/**
 * Compresses an image on the frontend before upload.
 * Resizes the image to a maximum width/height of 1024px while maintaining aspect ratio,
 * and reduces the quality to 0.7.
 *
 * @param uri The URI of the image to compress
 * @returns The compressed image URI and its base64 representation if requested
 */
export const compressImage = async (uri: string) => {
  try {
    // Get original size
    const originalResp = await fetch(uri);
    const originalBlob = await originalResp.blob();
    const originalSize = originalBlob.size;

    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }], // Maintains aspect ratio
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true },
    );

    // Get compressed size
    const compressedResp = await fetch(manipResult.uri);
    const compressedBlob = await compressedResp.blob();
    const compressedSize = compressedBlob.size;

    console.log("--- Image Compression Stats ---");
    console.log(`Original Size: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`Compressed Size: ${(compressedSize / 1024).toFixed(2)} KB`);
    console.log(
      `Reduction: ${(((originalSize - compressedSize) / originalSize) * 100).toFixed(2)}%`,
    );
    console.log("-------------------------------");

    return manipResult;
  } catch (error) {
    console.error("Error compressing image:", error);
    return null;
  }
};
