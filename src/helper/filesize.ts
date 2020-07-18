export default (bytes: number) => {
  bytes = Math.abs(bytes);
  const radix = 1024;
  const unit = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let loop = 0;

  // calculate
  while (bytes >= radix) {
    bytes /= radix;
    ++loop;
  }
  return `${bytes.toFixed(1)} ${unit[loop]}`;
};
