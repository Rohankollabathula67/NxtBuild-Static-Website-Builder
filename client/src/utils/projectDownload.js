const encoder = new TextEncoder();

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
  }
  return value >>> 0;
});

const crc32 = (bytes) => {
  let value = 0xffffffff;
  bytes.forEach((byte) => {
    value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8);
  });
  return (value ^ 0xffffffff) >>> 0;
};

const writeUint16 = (view, offset, value) => view.setUint16(offset, value, true);
const writeUint32 = (view, offset, value) => view.setUint32(offset, value, true);

const safePath = (path, index) => {
  const normalized = String(path || '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .split('/')
    .filter((part) => part && part !== '.' && part !== '..')
    .join('/');

  return normalized || `file-${index + 1}.txt`;
};

const createZip = (files) => {
  const entries = files.map((file, index) => {
    const name = encoder.encode(safePath(file.path, index));
    const content = encoder.encode(file.content || '');
    return { name, content, checksum: crc32(content) };
  });

  const localSize = entries.reduce((total, entry) => total + 30 + entry.name.length + entry.content.length, 0);
  const centralSize = entries.reduce((total, entry) => total + 46 + entry.name.length, 0);
  const output = new Uint8Array(localSize + centralSize + 22);
  const view = new DataView(output.buffer);
  const offsets = [];
  let cursor = 0;

  entries.forEach((entry) => {
    offsets.push(cursor);
    writeUint32(view, cursor, 0x04034b50);
    writeUint16(view, cursor + 4, 20);
    writeUint16(view, cursor + 8, 0);
    writeUint16(view, cursor + 10, 0);
    writeUint32(view, cursor + 14, entry.checksum);
    writeUint32(view, cursor + 18, entry.content.length);
    writeUint32(view, cursor + 22, entry.content.length);
    writeUint16(view, cursor + 26, entry.name.length);
    writeUint16(view, cursor + 28, 0);
    output.set(entry.name, cursor + 30);
    output.set(entry.content, cursor + 30 + entry.name.length);
    cursor += 30 + entry.name.length + entry.content.length;
  });

  const centralOffset = cursor;
  entries.forEach((entry, index) => {
    writeUint32(view, cursor, 0x02014b50);
    writeUint16(view, cursor + 4, 20);
    writeUint16(view, cursor + 6, 20);
    writeUint16(view, cursor + 10, 0);
    writeUint16(view, cursor + 12, 0);
    writeUint32(view, cursor + 16, entry.checksum);
    writeUint32(view, cursor + 20, entry.content.length);
    writeUint32(view, cursor + 24, entry.content.length);
    writeUint16(view, cursor + 28, entry.name.length);
    writeUint16(view, cursor + 30, 0);
    writeUint16(view, cursor + 32, 0);
    writeUint32(view, cursor + 38, 0);
    writeUint32(view, cursor + 42, offsets[index]);
    output.set(entry.name, cursor + 46);
    cursor += 46 + entry.name.length;
  });

  writeUint32(view, cursor, 0x06054b50);
  writeUint16(view, cursor + 8, entries.length);
  writeUint16(view, cursor + 10, entries.length);
  writeUint32(view, cursor + 12, cursor - centralOffset);
  writeUint32(view, cursor + 16, centralOffset);
  writeUint16(view, cursor + 20, 0);

  return output;
};

export const downloadProject = (files, projectTitle = 'generated-app') => {
  const zip = createZip(files);
  const safeTitle = projectTitle.trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'generated-app';
  const url = URL.createObjectURL(new Blob([zip], { type: 'application/zip' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeTitle}.zip`;
  link.click();
  URL.revokeObjectURL(url);
};
