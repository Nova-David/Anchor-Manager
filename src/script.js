import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons'
import GUI from 'lil-gui'
import { Timer } from 'three/addons/misc/Timer.js'
import * as Anchor from './AnchorManager.js'

// GUI
const gui = new GUI();

// SIZE
const canvas = document.querySelector('.webgl');
const size = {
    x: window.innerWidth,
    y: window.innerHeight
}

// SCENE
const scene = new THREE.Scene();

// CAMERA
const camera = new THREE.PerspectiveCamera(75, size.x/size.y, 0.1, 1000);
scene.add(camera);
camera.position.set(1, 2, 2.5);

// LIGHTS
const ambience = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambience);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
directionalLight.position.set(3, 3, 3);
scene.add(directionalLight);

// OBJECTS
const params = {
    width: 1,
    height: 1,
    projection: 1,
    width2: 0.25,
    height2: 0.25,
    projection2: 0.25,
    width3: 0.125,
    height3: 0.125,
    projection3: 0.125,
    x: 0,
    y: 0.5,
    z: 0,
    x2: 0,
    y2: 0,
    z2: 0,
    x3: 0,
    y3: 0,
    z3: 0
}

let cubeAnc3 = null;

const addBox = () => {
    const newCube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({
            color: boxParams.color
        })
    );

    scene.add(newCube);
    newCube.name = "TEAL";
    newCube.scale.set(0.125, 0.125, 0.125);

    let parentBox;
    switch (boxParams.box) {
        case 0:
            parentBox = cube;
            break;
        case 1:
            parentBox = cube2;
            break;
        case 2:
            // parentBox = cube3;
            break;
    }

    const newAnchor = anchors.attach(newCube, {
        anchor: {
            x: boxParams.parent.x,
            y: boxParams.parent.y,
            z: boxParams.parent.z
        },
        origin: {
            x: boxParams.child.x,
            y: boxParams.child.y,
            z: boxParams.child.z
        }
    }).to(parentBox);

    cubeAnc3 = newAnchor;
    params.width3 = 0.125;
    params.height3 = 0.125;
    params.depth3 = 0.125;
    params.x3 = 0;
    params.y3 = 0;
    params.z3 = 0;
}

const boxParams = {
    parent: {
        x: -1,
        y: 1,
        z: 1,
    }, 
    child: {
        x: -1,
        y: -1,
        z: 1
    },
    box: 1,
    color: new THREE.Color(0x24fff0),
    addBox,
}

const parent = gui.addFolder("Parent");
parent.add( boxParams.parent, 'x', { LEFT: -1, CENTER: 0, RIGHT: 1 } )
parent.add( boxParams.parent, 'y', { TOP: 1, CENTER: 0, BOTTOM: -1 } )
parent.add( boxParams.parent, 'z', { BACK: -1, CENTER: 0, FRONT: 1 } )

const child = gui.addFolder("Child");
child.add( boxParams.child, 'x', { LEFT: -1, CENTER: 0, RIGHT: 1 } )
child.add( boxParams.child, 'y', { TOP: 1, CENTER: 0, BOTTOM: -1 } )
child.add( boxParams.child, 'z', { BACK: -1, CENTER: 0, FRONT: 1 } )

const addBoxGUI = gui.addFolder("Anchor New Box");
addBoxGUI.add( boxParams, 'box', { BLACK: 0, RED: 1 } ).name("attach to")
addBoxGUI.addColor( boxParams, 'color')
addBoxGUI.add( boxParams, 'addBox');

const box1 = gui.addFolder("Box 1");
box1.add(params, 'width').min(0.5).max(10).step(0.01);
box1.add(params, 'height').min(0.5).max(10).step(0.01);
box1.add(params, 'projection').min(0.5).max(10).step(0.01);
box1.add(params, 'x').min(-5).max(5).step(0.01);
box1.add(params, 'y').min(0.5).max(10).step(0.01);
box1.add(params, 'z').min(-5).max(5).step(0.01);

const box2 = gui.addFolder("Box 2");
box2.add(params, 'width2').min(0.25).max(10).step(0.01).name("Width");
box2.add(params, 'height2').min(0.25).max(10).step(0.01).name("Height");
box2.add(params, 'projection2').min(0.25).max(10).step(0.01).name("Depth");
box2.add(params, 'x2').min(-3).max(3).step(0.01);
box2.add(params, 'y2').min(-3).max(3).step(0.01);
box2.add(params, 'z2').min(-3).max(3).step(0.01);


const box3 = gui.addFolder("New Box");
box3.add(params, 'width3').min(0.125).max(10).step(0.01).name("Width");
box3.add(params, 'height3').min(0.125).max(10).step(0.01).name("Height");
box3.add(params, 'projection3').min(0.125).max(10).step(0.01).name("Depth");
box3.add(params, 'x3').min(-3).max(3).step(0.01);
box3.add(params, 'y3').min(-3).max(3).step(0.01);
box3.add(params, 'z3').min(-3).max(3).step(0.01);


const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({
        color: 0x3d3d3d
    })
);
cube.position.set(params.x, params.y, params.z);
cube.name = "Noir";
scene.add(cube);

const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({
        color: 0xff0000
    })
);

cube2.scale.set(0.25, 0.25, 0.25);
cube2.name = "Reddy";
scene.add(cube2);

// const cube3 = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshStandardMaterial({
//         color: 0xff0000
//     })
// );

// cube3.scale.set(0.25, 0.25, 0.25);
// cube3.name = "LEFT CUBE";
// scene.add(cube3);

// const cube3 = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshStandardMaterial({
//         color: 0x00ff00
//     })
// );

// cube3.scale.set(0.125, 0.125, 0.125);
// scene.add(cube3);

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 3),
    new THREE.MeshStandardMaterial({
        color: 0xecf0f1
    })
);
floor.rotation.x = - Math.PI/2;
// scene.add(floor);

const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 3),
    new THREE.MeshStandardMaterial({
        color: 0xecf0f1
    })
);
wall.position.z = -0.001;
// scene.add(wall);

// ANCHORS
const anchors = new Anchor.AnchorManager();

const cubeAnc2 = anchors.attach(cube2, {
    anchor: {
        x: Anchor.FILL,
        y: Anchor.FILL,
        z: Anchor.FRONT
    },
    origin: {
        x: Anchor.LEFT,
        y: Anchor.BOTTOM,
        z: Anchor.FRONT
    },
    padding: {
        x: 0.2
    }
}).to(cube);

box2.add(cubeAnc2.relativePosition, 'y').min(-3).max(3).step(0.01);
box2.add(cubeAnc2.padding, 'x').min(0).max(0.5).step(0.01);

// anchors.attach(cube3, {
//     parent: [
//         Anchor.LEFT,
//         Anchor.TOP,
//         Anchor.FRONT
//     ],
//     child: [
//         Anchor.LEFT,
//         Anchor.BOTTOM,
//         Anchor.FRONT
//     ]
// }).to(cube);
// const cubeAnc3 = cubeAnc2.attach(cube3, {
//     parent: [
//         Anchor.LEFT,
//         Anchor.BOTTOM,
//         Anchor.FRONT
//     ],
//     child: [
//         Anchor.LEFT,
//         Anchor.BOTTOM,
//         Anchor.FRONT
//     ]
// });


// CONTROLS
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// RENDER
const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true
});
renderer.setSize(size.x, size.y);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

window.addEventListener('resize', () => {
    size.x = window.innerWidth;
    size.y = window.innerHeight;

    camera.aspect = size.x/size.y;
    camera.updateProjectionMatrix();

    renderer.setSize(size.x, size.y);
});

const timer = new Timer();
// ANIMATION
const animate = () => {
    const elapsedTime = timer.getElapsed();

    // Controls
    controls.update();

    // Animations
    cube.scale.x += (params.width - cube.scale.x) * 0.1;
    cube.scale.y += (params.height - cube.scale.y) * 0.1;
    cube.scale.z += (params.projection - cube.scale.z) * 0.1;
    // cubeAnc2.scale.x += (params.width2 - cubeAnc2.scale.x) * 0.1;
    // cubeAnc2.scale.y += (params.height2 - cubeAnc2.scale.y) * 0.1;
    cubeAnc2.scale.z += (params.projection2 - cubeAnc2.scale.z) * 0.1;
    if (cubeAnc3) {    
        cubeAnc3.scale.x += (params.width3 - cubeAnc3.scale.x) * 0.1;
        cubeAnc3.scale.y += (params.height3 - cubeAnc3.scale.y) * 0.1;
        cubeAnc3.scale.z += (params.projection3 - cubeAnc3.scale.z) * 0.1;
    }

    cube.position.x += (params.x - cube.position.x) * 0.1;
    cube.position.y += (params.y - cube.position.y) * 0.1;
    cube.position.z += (params.z - cube.position.z) * 0.1;
    cubeAnc2.addX((params.x2 - cubeAnc2.relativePosition.x) * 0.1);
    cubeAnc2.addY((params.y2 - cubeAnc2.relativePosition.y) * 0.1);
    cubeAnc2.addZ((params.z2 - cubeAnc2.relativePosition.z) * 0.1);
    if (cubeAnc3) {
        cubeAnc3.addX((params.x3 - cubeAnc3.relativePosition.x) * 0.1);
        cubeAnc3.addY((params.y3 - cubeAnc3.relativePosition.y) * 0.1);
        cubeAnc3.addZ((params.z3 - cubeAnc3.relativePosition.z) * 0.1);
    }

    // Update anchors
    anchors.update();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();
