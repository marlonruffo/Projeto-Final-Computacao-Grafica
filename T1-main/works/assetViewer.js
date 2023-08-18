import * as THREE from  'three';
import Stats from '../build/jsm/libs/stats.module.js';
import GUI from '../libs/util/dat.gui.module.js'
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import { life } from './vida.js';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';
import {OBJLoader} from '../build/jsm/loaders/OBJLoader.js';
import {MTLLoader} from '../build/jsm/loaders/MTLLoader.js';
import { degToReg} from './convencoes.js';
import {initRenderer, 
        SecondaryBox,
        initDefaultSpotlight,
        createGroundPlane,
        getMaxSize,        
        onWindowResize, 
        degreesToRadians,
        initCamera,
        initBasicMaterial, 
        initDefaultBasicLight,
        createGroundPlaneXZ,
        lightFollowingCamera} from "../libs/util/util.js";

        let scene, renderer, camera, material, light, orbit; // Initial variables
        scene = new THREE.Scene();    // Create main scene
        renderer = initRenderer();    // Init a basic renderer
        camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
        material = initBasicMaterial(); // create a basic material
        light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
        orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

        // Listen window size changes
        window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );
        
        // Show axes (parameter is size of each axis)
        let axesHelper = new THREE.AxesHelper( 12 );
        //scene.add( axesHelper );
        var ambientlightObjt = new THREE.AmbientLight(0xffffff,0.2)
    //LUZ
    //hemisphere light
     scene.add(ambientlightObjt);                                                

        let plane = createGroundPlaneXZ(140, 40)
        scene.add(plane);



        // avião principal (verde)        
        const loader = new GLTFLoader();
        loader.load('assets/pilot.glb', function(gltf){
            let airplane = gltf.scene
            scene.add(airplane)
            airplane.position.set(0, 5, 0)
            airplane.scale.set(0.005, 0.005, 0.005)
            airplane.rotateY(degToReg(90))
        })








        // avião inimigo 1 e 4(movimento vertical e diagonal)
        loader.load('assets/555.glb', function(gltf){
          let enemy1 = gltf.scene
          scene.add(enemy1)
          enemy1.position.set(10, 5, 0)
          enemy1.scale.set(0.020, 0.020, 0.020)
          enemy1.rotateY(degToReg(0))
      })  

         // avião inimigo 2(movimento Horizontal)
         loader.load('assets/enemyair2.glb', function(gltf){
            let enemy2 = gltf.scene
            scene.add(enemy2)
            enemy2.position.set(20, 5, 0)
            enemy2.scale.set(0.10, 0.10, 0.10)
            enemy2.rotateY(degToReg(90))
        })         

         // avião inimigo 3(movimento ARC)
         loader.load('assets/enemyair3.gltf', function(gltf){
            let enemy3 = gltf.scene
            scene.add(enemy3)
            enemy3.position.set(-10, 5, 0)
            enemy3.scale.set(0.04, 0.04, 0.04)
            enemy3.rotateY(degToReg(90))
        })         

        //submarino
        loader.load('assets/sub2.glb', function(gltf){
            let enemy1 = gltf.scene
            scene.add(enemy1)
            enemy1.position.set(-30, 5, 0)
            enemy1.scale.set(0.10, 0.10, 0.10)
            enemy1.rotateY(degToReg(0))
        })  

        loader.load('assets/rocket.glb', function(gltf){
          let missil22 = gltf.scene
          scene.add(missil22)
          missil22.position.set(-40, 5, 0)
          missil22.scale.set(0.5, 0.5, 0.5)
          missil22.rotateY(degToReg(90))
      })



        //vida
        life(scene,-20,0); 




        
        render();
        function render()
        {
          requestAnimationFrame(render);
          renderer.render(scene, camera) // Render scene
        }