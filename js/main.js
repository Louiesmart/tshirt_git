import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene = new THREE.Scene();

// Add some ambient light to illuminate the scene
let ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add a directional light to cast shadows and provide stronger lighting
let directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, -3); // Adjusted camera position for closer zoom
camera.lookAt(0, 0, 0); // Make the camera look at the center of the scene

let renderer = new THREE.WebGLRenderer({ antialias: true }); // Use antialiasing
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas3d-container').appendChild(renderer.domElement);

// Load the 3D shirt model
let loader = new GLTFLoader();
let shirtModel;

console.log("Loading model...");
loader.load('./model/scene.gltf', function (gltf) {
    console.log("Model loaded successfully");

    shirtModel = gltf.scene;

    // Adjust the model's scale and position
    shirtModel.scale.set(0.1, 0.1, 0.1);
    shirtModel.position.set(0, -5, 0); // Adjust the position to move it downwards

    scene.add(shirtModel);

    let controls = new OrbitControls(camera, renderer.domElement);

    // Render loop
    let animate = function () {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    };

    animate();

    // Function to update the texture of the t-shirt model
    function updateTShirtTexture() {
        if (shirtModel) {
            // Create a canvas texture from the Fabric.js canvas
            let canvasTexture = new THREE.CanvasTexture(document.getElementById('tshirt-canvas'));
            canvasTexture.needsUpdate = true; // Ensure texture is updated

            // Apply the canvas texture to the shirt model
            shirtModel.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.material.map = canvasTexture;
                }
            });

            // Render the 3D scene
            renderer.render(scene, camera);
        }
    }

    // Listen for the custom 'canvasUpdated' event from the script.js file
    window.addEventListener('canvasUpdated', updateTShirtTexture);

    // Add a reference to the color picker element
    let shirtColorPicker = document.getElementById('shirt-color-picker');

    // Function to update the shirt color
    function updateShirtColor() {
        if (shirtModel) {
            // Get the selected color from the color picker
            let selectedColor = shirtColorPicker.value;

            // Update the shirt's material color
            shirtModel.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    // Set the color directly
                    child.material.color.setStyle(selectedColor);
                }
            });
        }
    }

    // Listen for changes to the color picker
    shirtColorPicker.addEventListener('input', updateShirtColor); // Use 'input' event instead of 'change'

}, undefined, function (error) {
    console.error("Error loading model:", error);
});

// Add scene visualization helpers
scene.add(new THREE.CameraHelper(camera)); // Visualize camera frustum
scene.add(new THREE.DirectionalLightHelper(directionalLight)); // Visualize directional light
