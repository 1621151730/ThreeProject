/*
 * @Author: wangwendie
 * @Date: 2023-08-16 14:42:28
 * @LastEditors: wangwendie
 * @Description:
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as dat from "dat.gui";
import { DirectionalLight } from "three";
import backgroundImage1 from "../imgs/wallhaven-oxo7r5.png";
import backgroundImage2 from "../imgs/wallhaven-dpo5w3.jpg";
import backgroundImage3 from "../imgs/wallhaven-l8qy7y.jpg";
import star from "../imgs/star.jpeg";
import sea from "../imgs/sea.jpeg";

const ghostUrl = new URL("../assets/three.glb", import.meta.url);

const renderer = new THREE.WebGLRenderer({});

renderer.shadowMap.enabled = true;

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(-10, 30, 30);
orbit.update();

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshBasicMaterial({ color: "#4dd44d" });
const box = new THREE.Mesh(boxGeometry, boxMaterial)
scene.add(box);

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xFFFFFF,
  side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = - 0.5 * Math.PI;
plane.receiveShadow = true;



const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

const sphereGeometry = new THREE.SphereGeometry(4, 50, 50);
const sphereMatrial = new THREE.MeshStandardMaterial({
  color: 0x0000FF,
  wireframe: false
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMatrial);
scene.add(sphere)
sphere.position.set(-10, 10, 0)
sphere.castShadow = true;

const sphereId = sphere.id;

const sphere2Geometry = new THREE.SphereGeometry(4);

const sphere2Matrial = new THREE.ShaderMaterial({
  vertexShader: document.getElementById("vertexShader").textContent,
  fragmentShader: document.getElementById("fragmentShader").textContent
});
const sphere2 = new THREE.Mesh(sphere2Geometry, sphere2Matrial);
scene.add(sphere2);

sphere2.position.set(-10, 10, -10)




// 环境光
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

// // 定向光
// const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 5);
// scene.add(directionalLight);
// directionalLight.position.set(-30, 50, 0);
// directionalLight.castShadow = true;
// directionalLight.shadow.camera.bottom = -12;


// // // 开启定向光的助手
// const dLightHelpe = new THREE.DirectionalLightHelper(directionalLight, 5);
// scene.add(dLightHelpe);

// const dLightShadowHepler = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(dLightShadowHepler);

// 聚光灯
const spotLight = new THREE.SpotLight(0xffffff, 100000);
scene.add(spotLight);
spotLight.position.set(-100, 100, 0);
spotLight.castShadow = true;
spotLight.angle = 0.2;

const spotHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotHelper);

// scene.fog = new THREE.Fog(0xFFFFFF, 0, 200);

// scene.fog = new THREE.FogExp2(0xFFFFFF, 0.01);

// renderer.setClearColor("yellow")

const textureLoader = new THREE.TextureLoader();
// scene.background = textureLoader.load(backgroundImage1);

const cubeTextureLoader = new THREE.CubeTextureLoader();
// 背景图片宽高一致
scene.background = cubeTextureLoader.load([
  star,
  star,
  star,
  star,
  star,
  star,
])

// 立方体加纹理

const box2Geometry = new THREE.BoxGeometry(4, 4, 4);
// const box2Matrial = new THREE.MeshBasicMaterial();
const box2MultiMaterial = [
  new THREE.MeshBasicMaterial({ map: textureLoader.load(sea) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(sea) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(star) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(star) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(star) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(star) }),
]

const box2 = new THREE.Mesh(box2Geometry, box2MultiMaterial);
scene.add(box2);
box2.position.set(0, 5, 10);

box2.name = "cubeImage"

const plane2Geometry = new THREE.PlaneGeometry(10, 10, 10, 10);
const plane2Matrial = new THREE.MeshBasicMaterial({
  color: "blank",
  wireframe: true
});
const plane2 = new THREE.Mesh(plane2Geometry, plane2Matrial);
scene.add(plane2);
plane2.position.set(10, 10, 10)

const gui = new dat.GUI();

const options = {
  sphereColor: '#ffea00',
  wireframe: false,
  speend: 0,
  angle: 0.2,
  penumbra: 0,
  intensity: 88888,
};

gui.addColor(options, 'sphereColor').onChange(function (e) {
  sphere.material.color.set(e);
});

gui.add(options, 'wireframe').onChange(function (e) {
  sphere.material.wireframe = e;
});

gui.add(options, 'speend', 0, 0.1);
gui.add(options, 'angle', 0, 1);
gui.add(options, 'penumbra', 0, 1);
gui.add(options, 'intensity', 0, 100000);

const assetsLoader = new GLTFLoader();

assetsLoader.load(ghostUrl.href, function (gltf) {
  const model = gltf.scene;
  console.log(model.scale);
  scene.add(model);
  model.scale.set(0.1, 0.1, 0.1);
}, undefined, function (error) {
  console.error(error);
})



// let speend = 0.01;
let step = 1;

const mousePosition = new THREE.Vector2();

window.addEventListener('mousemove', function (e) {
  // 获取鼠标在坐标中的值 -1 0  1
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = - (e.clientY / window.innerHeight) * 2 + 1;
})

const rayCaster = new THREE.Raycaster();

function animate (time) {
  // console.log("time", time);
  box.rotation.x += 0.01;
  box.rotation.y += 0.01;

  step += options.speend;
  sphere.position.y = 10 * Math.abs(Math.sin(step));

  spotLight.angle = options.angle;
  spotLight.penumbra = options.penumbra;
  spotLight.intensity = options.intensity;
  spotHelper.update();

  plane2.geometry.attributes.position.array[0] = 10 * Math.random();
  plane2.geometry.attributes.position.array[1] = 10 * Math.random();
  plane2.geometry.attributes.position.array[2] = 10 * Math.random();
  plane2.geometry.attributes.position.needsUpdate = true;

  rayCaster.setFromCamera(mousePosition, camera);
  const intersects = rayCaster.intersectObjects(scene.children);
  // console.log(intersects)

  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].object.id == sphereId) {
      intersects[i].object.material.color.set("red");
      // sphere.material.color.set("red"); 这个也可以
    }
    if (intersects[i].object.name == "cubeImage") {
      intersects[i].object.rotation.y += time / 1000;
      intersects[i].object.rotation.x += time / 1000;
    }
  }


  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);


window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / this.window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
})