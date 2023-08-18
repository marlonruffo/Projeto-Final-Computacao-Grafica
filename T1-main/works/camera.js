import * as THREE from 'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import { TetrahedronGeometry } from '../build/three.module.js';

export function buildCamera(scene){
        //camera details:
        const fov = 101;
        const near = 0.1;
        const far = 500;
    
        //creating the camera
        const camera = new THREE.PerspectiveCamera(fov, window.innerWidth/window.innerHeight, near, far);
        camera.lookAt(0,1,0);
        camera.rotateX(-2.75);
        

        if(scene.plataforma == 'pc'){
            camera.position.set(0,15,252.7);
        }else{
            camera.position.set(0,30,252.7);
        }

        return camera;

}

export function runCamera(cameraHolder){
    return cameraHolder.translateZ(-0.2);
}

export function runLight(Light){              //FAZ COM QUE A CAMERA DIRECIONAL ANDE JUNTO COM A CAMERA NA MESMA VELOCIDADE
    return Light.translateZ(-0.2);
}