type colorData = {
  name: string;
  hex: string;
  opacity: number;
};

figma.showUI(__html__);
figma.ui.resize(500, 500);

const styles = figma.getLocalPaintStyles();

// toCamelCase
const camelize = (str: string) => {
  const wordsArr = str.split(/[\W-_]/g);
  const camelizedWords = wordsArr
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join("");
  return camelizedWords;
};

// 255に換算
const to255 = (rgb: number) => {
  return Math.round(rgb * 255);
};

// RGBA換算
const toRgba = (rgb: RGB, opacity: number) => {
  return (
    to255(rgb.r) +
    "," +
    to255(rgb.g) +
    "," +
    to255(rgb.b) +
    "," +
    opacity.toFixed(1)
  );
};

// 整数を16進数に変換
const decimalToHex = (decimal = 0) => decimal.toString(16);

// hex換算
// @ https://dev.to/coder4_life/convert-rgb-to-hex-color-codes-in-javascript-2bcd
const rgbToHex = (rgb: RGB) => {
  const hex =
    "#" +
    ((1 << 24) + (to255(rgb.r) << 16) + (to255(rgb.g) << 8) + to255(rgb.b))
      .toString(16)
      .slice(1);
  return hex;
};

// jsonの独自形式に整形
const toJSONHex = (color: colorData) => {
  let JSONData = color.name + ': "' + color.hex + '"';
  if (color.opacity !== 1) {
    const opacityTo10 = Number(color.opacity.toFixed(1)) * 100;
    JSONData += "." + opacityTo10;
  }
  return JSONData;
};

const colorsData = styles.map((style) => {
  const opacity = Number(style.paints[0].opacity);
  if (style.paints[0].type !== "SOLID") {
    // 単色でなければスキップ
    return;
  }
  const color = style.paints[0].color;
  const camelizedName = camelize(style.name);
  const hexString = rgbToHex(color);
  const jsonOriginalHex = toJSONHex({ name:camelizedName, hex:hexString, opacity:opacity });
  console.log(jsonOriginalHex);
  return jsonOriginalHex;
}).join(',\n');

figma.ui.postMessage({
    type: "render",
    colorsData,
  });