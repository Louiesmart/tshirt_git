

let canvas = new fabric.Canvas('tshirt-canvas');
canvas.setDimensions({ width: 1000, height: 1000 });

// Load t-shirt image as a background
let tshirtImage = new Image();
tshirtImage.src = './img/Shirt_Black.png';
tshirtImage.onload = function () {
    canvas.setDimensions({
        width: tshirtImage.width,
        height: tshirtImage.height
    });

    fabric.Image.fromURL(tshirtImage.src, function (img) {
        img.set({ selectable: false, evented: false });
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    });
};

// Function to update selected text properties
function updateSelectedTextProperties() {
    let activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
        activeObject.setFontSize(parseInt(document.getElementById('font-size-input').value) || 20);
        activeObject.setFill(document.getElementById('text-color-picker').value);
        activeObject.setFontFamily(document.getElementById('font-family-select').value); // Add font family

        // Notify the 3D script to update the model when text properties change
        update3DModel();
    }
}

// Add text to the canvas
document.getElementById('add-text-button').addEventListener('click', function () {
    let newText = new fabric.IText('Your Text', {
        left: 50,
        top: 50,
        fontSize: parseInt(document.getElementById('font-size-input').value) || 20,
        fill: document.getElementById('text-color-picker').value,
        fontFamily: document.getElementById('font-family-select').value // Add font family
    });

    canvas.add(newText);

    // Automatically select the newly added text element
    canvas.setActiveObject(newText);
    newText.enterEditing();
    newText.selectAll();
    canvas.renderAll();

    // Notify the 3D script to update the model when text is added
    update3DModel();
});

// Change text color
document.getElementById('text-color-picker').addEventListener('change', function () {
    updateSelectedTextProperties();
});

// Change font size
document.getElementById('font-size-input').addEventListener('input', function () {
    updateSelectedTextProperties();
});

document.getElementById('download-button').addEventListener('click', function () {
    // Get the canvas content as a data URL
    let dataURL = canvas.toDataURL({
        format: 'png', // Specify the desired image format (PNG in this case)
        quality: 1 // Highest quality
    });

    // Create a temporary link to trigger the download
    let link = document.createElement('a');
    link.href = dataURL;
    link.download = 'tshirt-design.png'; // Set the filename
    link.click();
});

// Function to add an image to the canvas
function addImageToCanvas(imageUrl) {
    fabric.Image.fromURL(imageUrl, function (img) {
        img.set({ left: 100, top: 100 }); // Adjust position as needed
        canvas.add(img);

        // Notify the 3D script to update the model when an image is added
        update3DModel();
    });
}

// Add image button click event
document.getElementById('add-image-button').addEventListener('click', function () {
    // Create an input element to select files
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', function (event) {
        let file = event.target.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = function (e) {
                let imageUrl = e.target.result;
                addImageToCanvas(imageUrl);
            };
            reader.readAsDataURL(file);
        }
    });
    input.click();
});

let drawingMode = false; // Flag to indicate if drawing is active
let selectedTool = ''; // Keeps track of the selected drawing tool

// Brush button click event
document.getElementById('brush-button').addEventListener('click', function () {
    drawingMode = true;
    selectedTool = 'brush';
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.width = 5; // Set brush width
    canvas.freeDrawingBrush.color = document.getElementById('text-color-picker').value;
});

// Mouse up event to end drawing
canvas.on('mouse:up', function () {
    if (drawingMode) {
        drawingMode = false;
        canvas.isDrawingMode = false;

        // Notify the 3D script to update the model when drawing ends
        update3DModel();
    }
});

// Mouse move event for drawing
canvas.on('mouse:move', function (event) {
    if (drawingMode) {
        if (selectedTool === 'brush') {
            canvas.freeDrawingBrush.color = document.getElementById('text-color-picker').value;
        }

        let pointer = canvas.getPointer(event.e);
        if (selectedTool === 'brush') {
            // Draw small circles for smoother lines with the brush tool
            let circle = new fabric.Circle({
                radius: canvas.freeDrawingBrush.width / 2,
                left: pointer.x,
                top: pointer.y,
                fill: canvas.freeDrawingBrush.color,
                selectable: false,
                evented: false
            });
            canvas.add(circle);

            // Notify the 3D script to update the model in real-time while drawing
            update3DModel();
        }
    }
});

// Add delete button click event
document.getElementById('delete-button').addEventListener('click', function () {
    let activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.remove(activeObject);
        canvas.discardActiveObject();
        canvas.renderAll();

        // Notify the 3D script to update the model when an object is deleted
        update3DModel();
    }
});

// Emit a custom event to trigger the update in the 3D script
function update3DModel() {
    let event = new Event('canvasUpdated');
    window.dispatchEvent(event);
}
