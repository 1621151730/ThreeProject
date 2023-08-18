/*
 * @Author: wangwendie
 * @Date: 2023-08-10 11:04:20
 * @LastEditors: wangwendie
 * @Description: three的方块
 */
import * as THREE from 'three';

// 创建场景
const scene = new THREE.Scene();

// 添加一个立方体
const geometry = new THREE.BoxGeometry(3, 1, 3); // x, y, z
const material = new THREE.MeshBasicMaterial({ color: 0xfb8e00 });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 0, 0);
scene.add(cube);

// 设置环境光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// 设置方向光
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(10, 20, 0);
scene.add(directionalLight);

// 设置相机，可视的位置
const width = 10;
const height = width * (window.innerHeight / window.innerWidth); // 按照比例获取
const camera = new THREE.OrthographicCamera(
  -width / 2, // left
  width / 2, // right
  height / 2, // top
  -height / 2, // bottom
  1, // near
  100 // far
);

camera.position.set(4, 4, 4);
camera.lookAt(0, 0, 0);

// 渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);

// 添加到HTML中
document.body.appendChild(renderer.domElement);
