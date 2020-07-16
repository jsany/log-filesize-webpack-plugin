
export const isJS = (val: string) => /[\\.]js$/.test(val);
export const isCSS = (val: string) => /[\\.]css$/.test(val);
export const isIMAGE = (val: string) => /[\\.](bmp|jpg|png|tif|gif|pcx|tga|exif|fpx|svg|psd|cdr|pcd|dxf|ufo|eps|ai|raw|WMF|webp)$/i.test(val);
export const isJSON = (val: string) => /[\\.]json$/i.test(val);
export const isFONT = (val: string) => /[\\.](ttf|otf|ttc)$/i.test(val);
export const isTXT = (val: string) => /[\\.]txt$/i.test(val);