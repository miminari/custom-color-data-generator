type colorData = {
  name: string;
  hex: string;
  opacity: number;
};

figma.showUI(__html__);
figma.ui.resize(500, 500);

// 現在のファイルの塗りのスタイルを取得
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

// toSnakeCase
const snakeCase = (str: string) => {
  const camelizedWords = camelize(str);
  return camelizedWords.replace(/[A-Z]/g, (c) => { return '_' + c.toLowerCase() }).slice(1);
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
  let JSONData = '  "' + color.name + '" : "' + color.hex + '"';
  if (color.opacity !== 1) {
    const opacityTo10 = Number(color.opacity.toFixed(1)) * 100;
    JSONData += "." + opacityTo10;
  }
  return JSONData;
};

if (figma.editorType === "figma") {
  figma.ui.onmessage = (message) => {
    console.log(message);
    let currentData;
    switch (message.fileType) {
      case "CSS":
        console.log(message.fileType);
        // cssの形式に整形
        const getCSSColorData = styles
          .map((style) => {
            if (style.paints[0].type !== "SOLID") {
              // 単色でなければスキップ
              return;
            }
            const color = style.paints[0].color;
            const snakeCaseName = snakeCase(style.name);
            return (
              "--color-" +
              snakeCaseName +
              ": rgba(" +
              toRgba(color, Number(style.paints[0].opacity)) +
              ")"
            );
          })
          .join(";\n");
        currentData = getCSSColorData;
        break;
      case "XML":
        console.log(message.fileType);
        // XML形式に整形
        const getXMLColorData = styles
          .map((style) => {
            if (style.paints[0].type !== "SOLID") {
              // 単色でなければスキップ
              return;
            }
            const color = style.paints[0].color;
            const snakeCaseName = snakeCase(style.name);
            return (
              '<color name="' +
              snakeCaseName +
              '">' +
              rgbToHex(color) +
              "</color>"
            );
          })
          .join("\n");
        currentData = getXMLColorData;
        break;
      case "JSON":
      default:
        console.log(message.fileType);
        // json形式に整形
        const getJSONColorsData = styles
          .map((style) => {
            const opacity = Number(style.paints[0].opacity);
            if (style.paints[0].type !== "SOLID") {
              // 単色でなければスキップ
              return;
            }
            const color = style.paints[0].color;
            const camelizedName = camelize(style.name);
            const hexString = rgbToHex(color);
            const jsonOriginalHex = toJSONHex({
              name: camelizedName,
              hex: hexString,
              opacity: opacity,
            });
            return jsonOriginalHex;
          })
          .join(",\n");
        currentData = "{\n" + getJSONColorsData + "\n}";
        break;
    }
    figma.ui.postMessage({ type: "render", body: currentData });
  };
}
