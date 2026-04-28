declare module 'piexifjs' {
  interface ExifDict {
    '0th'?: Record<number, unknown>;
    Exif?: Record<number, unknown>;
    GPS?: Record<number, unknown>;
    '1st'?: Record<number, unknown>;
  }
  const piexif: {
    load(data: string): ExifDict;
    dump(exifDict: ExifDict): string;
    insert(exifStr: string, jpegStr: string): string;
    remove(jpegStr: string): string;
    ImageIFD: Record<string, number>;
    ExifIFD: Record<string, number>;
    GPSIFD: Record<string, number>;
  };
  export = piexif;
}
