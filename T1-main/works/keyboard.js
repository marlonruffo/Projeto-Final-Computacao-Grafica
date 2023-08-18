import * as THREE from 'three';
import KeyboardState from '../libs/util/KeyboardState.js';
import { mainshoot, keyboard} from './index.js';
import {
    createGroundPlaneWired,
    createGroundPlaneXZ
} from "../libs/util/util.js";
import { degToReg, getAirplane, getMovementBorders } from './convencoes.js';
import { BuildMissale, BuildProjeteis } from './models.js';

export function movements(scene, clock){
    //Definição variáveis
    let airplane = getAirplane(scene);
    let cameraHolder = scene.children.find(function(x){
        return x.type === 'Object3D';
    });

    //Controle teclado
    // var keyboard = new KeyboardState();
    keyboard.update();
    let top_border, bottom_border, left_border, right_border
    let borders = getMovementBorders();
    top_border = borders[0];
    bottom_border = borders[1];
    left_border = borders[2];
    right_border = borders[3];
    
    if (keyboard.down('K')){
        console.log(airplane.position) //Teste para ajeitar coordenadas
        console.log(cameraHolder.position)
    }

    if ( keyboard.pressed("left") ){
        if (airplane.position.x >= left_border){ 
            airplane.position.x = airplane.position.x - 0.3
        if(airplane.quaternion.x < 0.15) 
            airplane.rotateX(0.1)
            //console.log(airplane.quaternion.x * 57.2958)
        }
    } else if ( keyboard.pressed("right") ){
        //console.log(airplane.quaternion.x * 57.2958)
        if(airplane.quaternion.x > -0.15)
            airplane.rotateX(-0.1)
        if(airplane.position.x <= right_border){
            airplane.position.x = airplane.position.x + 0.3
            //airplane.translateZ(-0.3)
        }
    } else {
        if(airplane.quaternion.x > 0){
             airplane.rotateX(-0.03)
         }else if(airplane.quaternion.x < 0){
             airplane.rotateX(0.03)
         }
        //airplane.quaternion.rotateTowards(new)
    }

    if ( keyboard.pressed("down") ){
        if(airplane.position.z <= cameraHolder.position.z + bottom_border){
            airplane.translateX(0.3)
        }
    } 

    if ( keyboard.down("G") ){
        if(scene.godmode){
            scene.godmode = false;
        }else{
            scene.godmode = true;
        }
    } 

    if ( keyboard.down("enter") ){
        window.location.reload();
    } 

    if ( keyboard.down("M") ){
        if(scene.mapshadow){
            scene.mapshadow = false;
        }else{
            scene.mapshadow = true;
        }
    } 


    if ( keyboard.pressed("up") ){
        if(airplane.position.z >= cameraHolder.position.z + top_border){
            airplane.translateX(-0.3)
        }
    } 
    const SHOTS_PER_SECOND = 2

    if(keyboard.pressed("ctrl")){
        let delta = clock.getDelta();
        airplane.shootInterval += delta;

        if(airplane.shootInterval >= 1 / SHOTS_PER_SECOND){
            var projetil = BuildProjeteis();
            var x = airplane.position.x;
            var y = airplane.position.y;
            var z = airplane.position.z;
            projetil.position.set(x,y,z);
            projetil.inicial = [x,y,z];
            (scene.add(projetil));
            airplane.shootInterval = 0
        }
    }else if(keyboard.pressed("space")){
        let delta = clock.getDelta();
        airplane.shootInterval += delta;
        const SHOTS_PER_SECOND = 2

        if(airplane.shootInterval >= 1 / SHOTS_PER_SECOND){
            var projetil = BuildMissale();
            var x = airplane.position.x;
            var y = airplane.position.y - 1;
            var z = airplane.position.z;
            projetil.position.set(x,y,z);
            projetil.inicial = [x,y,z];
            (scene.add(projetil));
            airplane.shootInterval = 0
        }
    }else{
        airplane.shootInterval = 1/SHOTS_PER_SECOND
    }
    
    return true;
}
