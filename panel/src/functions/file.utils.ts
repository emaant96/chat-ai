export function fileToBase64(file: File): Promise<string | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function bufferMp3ToUrl(buffer: ArrayBuffer) {
  const blob = new Blob([buffer], {type: 'audio/mp3'});
  return URL.createObjectURL(blob)
}