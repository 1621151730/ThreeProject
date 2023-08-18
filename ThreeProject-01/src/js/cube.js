

import * as CANNON from "cannon";
import * as THREE from 'three';
import * as env from "./judgeEnv.js";

const { isIOS, isAndroid } = env.default();

let clickType = "click";

if (isIOS || isAndroid) {
  clickType = "touchstart"
}

let camera, scene, renderer;
let world; // cannonjs world
const originalBoxSize = 3;
const stack = [];
let overhangs = [];
const boxHeight = 1;
let counter = 0
let elementCount = null;

function init () {
  // 初始化CannonJS
  world = new CANNON.World();
  world.gravity.set(0, -10, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 40;

  // 初始化 THREEJS
  scene = new THREE.Scene();

  // 基础方块
  addLayer(0, 0, originalBoxSize, originalBoxSize);

  // 第一次的方块
  addLayer(-10, 0, originalBoxSize, originalBoxSize, "x");

  // 设置自然亮光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  // 设置方向光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(10, 20, 0);
  scene.add(directionalLight);

  // 设置摄像机
  const width = 10;
  const height = width * (window.innerHeight / window.innerWidth);
  camera = new THREE.OrthographicCamera(
    width / - 2,
    width / 2,
    height / 2,
    height / - 2,
    1,
    100
  );
  camera.position.set(4, 4, 4);
  camera.lookAt(0, 0, 0);

  // 开始渲染
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
  // 加载到页面上
  document.body.appendChild(renderer.domElement);

}



function addLayer (x, z, width, depth, direction) {
  const y = boxHeight * stack.length;

  const layer = generateBox(x, y, z, width, depth, false); // 没有重量false
  layer.direction = direction;

  stack.push(layer);
}

function addOverhang (x, z, width, depath) {
  const y = boxHeight * (stack.length - 1);
  const overhang = generateBox(x, y, z, width, depath, true); // 有重量 true
  overhangs.push(overhang);
}

function generateBox (x, y, z, width, depth, falls) {
  const geometry = new THREE.BoxGeometry(width, boxHeight, depth);

  const color = new THREE.Color(Math.random(), Math.random(), Math.random());
  // const color = new THREE.Color(`hsl(${30 + stack.length * 4}, 100%, 50%)`);
  const material = new THREE.MeshLambertMaterial({ color });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);

  scene.add(mesh);

  // CannonJS 物体
  const shape = new CANNON.Box(
    new CANNON.Vec3(width / 2, boxHeight / 2, depth / 2)
  );

  let mass = falls ? 5 : 0; // 重量为5
  const body = new CANNON.Body({ mass, shape });
  body.position.set(x, y, z);
  world.addBody(body);

  return {
    threejs: mesh,
    cannonjs: body,
    width,
    depth
  }
}

let gameStated = false;

window.addEventListener(clickType, () => {
  if (!gameStated) {
    renderer.setAnimationLoop(animation);
    gameStated = true;
  } else {

    const topLayer = stack[stack.length - 1];
    const previousLayer = stack[stack.length - 2];

    const direction = topLayer.direction;

    // 找出差值
    const delta = topLayer.threejs.position[direction] - previousLayer.threejs.position[direction];
    // 差多少重叠
    const overhangSize = Math.abs(delta);

    const size = direction == "x" ? topLayer.width : topLayer.depth;

    // 重叠量是多少
    const overlap = size - overhangSize;

    if (overlap > 0) {
      // 2维看是x轴还是z轴的偏差
      const newWidth = direction === "x" ? overlap : topLayer.width;
      const newDepth = direction === "z" ? overlap : topLayer.depth;

      // 更新刚刚滑块的数据
      topLayer.width = newWidth;
      topLayer.depth = newDepth;

      // 更新threejs模型
      topLayer.threejs.scale[direction] = overlap / size; // 缩放direction方向的长度
      topLayer.threejs.position[direction] -= delta / 2; // 偏移direction方向的长度,少了多少/2就是偏移量。

      // 更新cannonjs模块
      topLayer.cannonjs.position[direction] -= delta / 2; // 偏移direction方向的长度,少了多少/2就是偏移量。

      // 替换shape
      const shape = new CANNON.Box(
        new CANNON.Vec3(newWidth / 2, boxHeight / 2, newDepth / 2)
      );

      topLayer.cannonjs.shapes = [];
      topLayer.cannonjs.shapes.push(shape);

      // 超出的部分给与下落
      const overhangShift = (overlap / 2 + overhangSize / 2) * Math.sign(delta); // 找到 两个坐标差多少
      const overhangX = direction === "x" ? topLayer.threejs.position.x + overhangShift : topLayer.threejs.position.x; // 找到要掉下去的坐标
      const overhangZ = direction === "z" ? topLayer.threejs.position.z + overhangShift : topLayer.threejs.position.z;
      const overhangWidth = direction === "x" ? overhangSize : newWidth;
      const overhangDepth = direction === "z" ? overhangSize : newDepth;
      addOverhang(overhangX, overhangZ, overhangWidth, overhangDepth);

      // 模拟物理的下落撞击需要 Cannon.js


      // 开始生成下一个layer
      const nextX = direction === "x" ? topLayer.threejs.position.x : -10;
      const nextZ = direction === "z" ? topLayer.threejs.position.z : -10;
      const nextDirection = direction === "x" ? "z" : "x";

      // 修改count计数
      const setCounter = (count) => {
        counter = count
        elementCount.innerHTML = `计数得分： ${counter}`
      }
      setCounter(counter + 1);

      // 我添加了新的，那么就是新的在animation
      addLayer(nextX, nextZ, newWidth, newDepth, nextDirection);
    } else {
      renderer.setAnimationLoop(null);
      console.log("game over");
    }
  }
})

function setCounterElement (element) {
  elementCount = element;
}

function animation () {
  const spend = 0.15;

  const topLayer = stack[stack.length - 1];
  topLayer.threejs.position[topLayer.direction] += spend; // 可以说是偏移量
  topLayer.cannonjs.position[topLayer.direction] += spend; // 到这里了
  // 修改相机的初始高度
  if (camera.position.y < boxHeight * (stack.length - 2) + 4) {
    camera.position.y += spend;
  }
  updatePhysics();
  renderer.render(scene, camera);
}

function updatePhysics () {
  world.step(2 / 60); // 踏进物理世界

  // 将坐标、质量从Cannon.js复制到Three.js
  overhangs.forEach(element => {
    element.threejs.position.copy(element.cannonjs.position);
    element.threejs.quaternion.copy(element.cannonjs.quaternion);
  })
}


init();

export {
  setCounterElement
}