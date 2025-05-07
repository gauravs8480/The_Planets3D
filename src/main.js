import gsap from "gsap";
import "./style.css";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import * as THREE from "three";
import { mx_bilerp_0 } from "three/src/nodes/materialx/lib/mx_noise.js";

// Scene setup
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 9;

// Renderer setup
const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const colors = [
  0xff0000, // red
  0x00ff00, // green
  0x0000ff, // blue
  0xffff00, // yellow
];

const textures = [
  "./csilla/color.png",
  "./earth/map.jpg",
  "./venus/map.jpg",
  "./volcanic/color.png",
];

const loader = new RGBELoader();

loader.load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr",
  function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;

    scene.environment = texture;
  },
  undefined,
  function (error) {
    console.error("An error occurred:", error);
  }
);

// Create a large background sphere for stars
const starGeometry = new THREE.SphereGeometry(50, 64, 64);
const starTextureLoader = new THREE.TextureLoader();
const starTexture = starTextureLoader.load("./stars.jpg");
starTexture.colorSpace = THREE.SRGBColorSpace;
starTexture.wrapS = THREE.RepeatWrapping;
starTexture.wrapT = THREE.RepeatWrapping;

const starMaterial = new THREE.MeshStandardMaterial({
  map: starTexture,
  transparent: true,
  opacity: 0.5,
  side: THREE.BackSide, // Render the inside of the sphere
});

const starSphere = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starSphere);

// Create group of spheres
const spheres = new THREE.Group();
const spheresMesh = [];
// Sphere configuration
const radius = 1.2;
const segments = 64;

for (let i = 0; i < 4; i++) {
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(textures[i]);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshStandardMaterial({
    map: texture,
  });

  const sphere = new THREE.Mesh(geometry, material);
  spheresMesh.push(sphere);
  // Position spheres in a circle
  const angle = (i / 4) * (Math.PI * 2);
  const orbitRadius = 5;
  sphere.position.x = orbitRadius * Math.cos(angle);
  sphere.position.z = orbitRadius * Math.sin(angle); // Fixed: Changed cos to sin for proper circular placement

  spheres.add(sphere);
}

spheres.rotation.x = 0.04;
spheres.position.y = -1.2;
scene.add(spheres);

// Add ambient and directional light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// setInterval(()=>{
//   gsap.to(spheres.rotation,{
//     y:`+=${Math.PI/2}`,
//     duration:2,
//     ease:"expo.easeInOut",
//   });
// },2500)

let lastScrollTime = 0;
const scrollThrottleTime = 2000; // 2 seconds
let scrollCount = 0;

window.addEventListener("wheel", (event) => {
  const currentTime = Date.now();

  if (currentTime - lastScrollTime >= scrollThrottleTime) {
    lastScrollTime = currentTime; // <-- THIS WAS MISSING

    const direction = event.deltaY > 0 ? "down" : "up";
    scrollCount = (scrollCount + 1) % 4;

    const headings = document.querySelectorAll(".heading");

    gsap.to(headings, {
      duration: 1,
      y: `-=${100}%`,
      ease: "power2.inOut",
    });

    gsap.to(spheres.rotation, {
      y: `+=${Math.PI / 2}%`,
      duration: 1,
      ease: "expo.easeInOut",
    });

    if (scrollCount === 0) {
      gsap.to(headings, {
        duration: 1,
        y: `0%`,
        ease: "power2.inOut",
      });
    }
  }
});

// Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  // Rotate the sphere group
  for (let i = 0; i < spheresMesh.length; i++) {
    spheresMesh[i].rotation.y = clock.getElapsedTime() * 0.01;
  }
  // controls.update();
  renderer.render(scene, camera);
}
animate();
