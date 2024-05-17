let img;
let canvas;
let imgUploader;
let magnifier;
let magnifierCanvas;
let imgWidth, imgHeight;
let colors = []; // Define the colors variable globally
const maxCanvasSize = 600;
const magnification = 10; // Increase magnification level to show individual pixels
const magnifierXOffset = 80; // Adjust this value to control X offset
const magnifierYOffset = -275;  // Adjust this value to control Y offset

function preload() {
    img = loadImage('images/burano.jpeg');
}

function setup() {
    canvas = createCanvas(maxCanvasSize, maxCanvasSize);
    canvas.parent('canvasContainer');
    pixelDensity(1);
    imgUploader = select('#imageUploader');
    imgUploader.changed(handleFile);
    magnifier = select('#magnifier');
    magnifierCanvas = createGraphics(150, 150);

    // Set up initial image
    if (img) {
        setImage(img);
        extractPalette(img);
    }
}

function handleFile() {
    let file = imgUploader.elt.files[0];
    if (file.type.startsWith('image/')) {
        let reader = new FileReader();
        reader.onload = function (e) {
            img = loadImage(e.target.result, () => {
                setImage(img);
                extractPalette(img);
            });
        }
        reader.readAsDataURL(file);
    }
}

function setImage(img) {
    let aspectRatio = img.width / img.height;
    if (aspectRatio > 1) {
        imgWidth = maxCanvasSize;
        imgHeight = maxCanvasSize / aspectRatio;
    } else {
        imgWidth = maxCanvasSize * aspectRatio;
        imgHeight = maxCanvasSize;
    }
    resizeCanvas(imgWidth, imgHeight);
    image(img, 0, 0, imgWidth, imgHeight);
}

function extractPalette(img) {
    colors = []; // Reset the colors array
    const colorCount = 8; // Number of colors in the palette
    for (let i = 0; i < colorCount; i++) {
        let x = Math.floor(random(img.width));
        let y = Math.floor(random(img.height));
        let c = img.get(x, y);
        colors.push(c);
    }
    displayPalette(colors);
}

function displayPalette(colors) {
    const paletteContainer = select('#paletteColors');
    paletteContainer.html(''); // Clear any existing palette colors
    colors.forEach(color => {
        let colorDiv = createDiv('');
        colorDiv.style('background-color', `rgb(${color[0]}, ${color[1]}, ${color[2]})`);
        colorDiv.class('palette-color');

        // Create tooltip
        let tooltip = createDiv(`RGB: ${color[0]}, ${color[1]}, ${color[2]}<br>HEX: #${hex(color[0], 2)}${hex(color[1], 2)}${hex(color[2], 2)}`);
        tooltip.class('tooltip');
        colorDiv.child(tooltip);

        paletteContainer.child(colorDiv);
    });
}

function draw() {
    if (img) {
        image(img, 0, 0, imgWidth, imgHeight);
    }

    if (mouseX > 0 && mouseY > 0 && mouseX < imgWidth && mouseY < imgHeight) {
        magnifier.style('display', 'block');

        // Clear magnifierCanvas
        magnifierCanvas.clear();

        // Draw magnified pixels with grey lines between them
        for (let i = -7; i <= 7; i++) {
            for (let j = -7; j <= 7; j++) {
                let x = Math.floor(map(mouseX + i, 0, imgWidth, 0, img.width));
                let y = Math.floor(map(mouseY + j, 0, imgHeight, 0, img.height));
                if (x >= 0 && y >= 0 && x < img.width && y < img.height) {
                    let c = img.get(x, y);
                    magnifierCanvas.fill(c);
                    magnifierCanvas.stroke(200); // Grey color for the lines
                    magnifierCanvas.strokeWeight(1); // Thin lines
                    magnifierCanvas.rect((i + 7) * magnification, (j + 7) * magnification, magnification, magnification);
                }
            }
        }

        // Calculate center coordinates for the red rectangle
        let centerX = Math.floor(magnifierCanvas.width / 2);
        let centerY = Math.floor(magnifierCanvas.height / 2);

        // Draw red border around the current pixel
        magnifierCanvas.stroke(255, 0, 0);
        magnifierCanvas.strokeWeight(2);
        magnifierCanvas.noFill();
        magnifierCanvas.rect(centerX - magnification / 2, centerY - magnification / 2, magnification, magnification);

        // Display magnifierCanvas in the magnifier
        magnifier.elt.style.backgroundImage = `url(${magnifierCanvas.elt.toDataURL()})`;

        // Set the position of the magnifier relative to the cursor with the specified offsets
        magnifier.position(mouseX + magnifierXOffset, mouseY + magnifierYOffset);

        // Live update color values
        updateColorValues();
    } else {
        magnifier.style('display', 'none');
    }
}

function updateColorValues() {
    let x = Math.floor(map(mouseX, 0, imgWidth, 0, img.width));
    let y = Math.floor(map(mouseY, 0, imgHeight, 0, img.height));
    if (x < img.width && y < img.height && x >= 0 && y >= 0) {
        let c = img.get(x, y);
        let rgbValue = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
        let hexValue = `#${hex(c[0], 2)}${hex(c[1], 2)}${hex(c[2], 2)}`;
        select('#rgbValue').html(rgbValue);
        select('#hexValue').html(hexValue);
        select('#colorPreview').style('background-color', rgbValue);
    }
}

function getColor() {
    updateColorValues();
}

document.getElementById('randomize').onclick = function () {
    extractPalette(img); // Call extractPalette to regenerate the colors
};
