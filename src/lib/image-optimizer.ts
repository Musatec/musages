/**
 * Optimizes an image file by resizing and compressing it client-side.
 * Uses native HTML5 Canvas API to avoid external heavy dependencies.
 */
export async function optimizeImage(file: File, maxWidth = 1200, quality = 0.7): Promise<File> {
    return new Promise((resolve, reject) => {
        // 1. If not an image, return original
        if (!file.type.startsWith('image/')) {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                // 2. Calculate new dimensions
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxWidth) {
                    if (width > height) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    } else {
                        width = Math.round((width * maxWidth) / height);
                        height = maxWidth;
                    }
                }

                // 3. Draw to canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(file); // Fallback
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);

                // 4. Export as compressed JPEG
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            // Convert Blob back to File to maintain API compatibility
                            const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                                type: "image/jpeg",
                                lastModified: Date.now(),
                            });
                            resolve(newFile);
                        } else {
                            resolve(file); // Fallback
                        }
                    },
                    "image/jpeg",
                    quality
                );
            };

            img.onerror = (error) => reject(error);
        };

        reader.onerror = (error) => reject(error);
    });
}
