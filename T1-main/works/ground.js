import * as THREE from 'three';
import {
    createGroundPlaneWired,
    createGroundPlaneXZ
} from "../libs/util/util.js"
import { OBJLoader } from './loaders/OBJLoader.js'
import {MTLLoader} from './loaders/MTLLoader.js'
import { Water } from '../build/jsm/objects/Water.js';
import { criaobj } from './models.js';

var planeSize = 500;
var modelSize = 180
var terrainCheckBound = 0;
var waterCheckBound = 0;
const TERRAIN_FRONT = 1
const TERRAIN_BACK = 2
const WATER_FRONT = 3
const WATER_BACK = 4


export function initialPlane(scene){
    // create the ground plane
    let plane = new THREE.PlaneGeometry(50, planeSize);
    plane.receiveShadow=true;
    //createWater(scene, plane)
    createTerrains(scene)
    

    return plane;
}

export function newPlanes(scene){
    if(scene == undefined) return
    //Variáveis principais

    let camera = scene.children.find(function(x){
        return x.type === 'Object3D';
    })
    let plane = scene.children.find(function(x){
        if(x.geometry) return x.geometry.type === 'PlaneGeometry';
    })

    //------------------------
    //Plane + Water
    // if (Math.round(camera.position.z) == Math.round((-planeSize * scene.stage)+200)) // momento para criar novo plano
    // {
    //     var newplane = new THREE.PlaneGeometry(50, planeSize)
    //     //var enemys = buildEnemys(scene);
    //     scene.add(newplane);
    //     removeOldPlane(scene,plane);
    //     scene.stage += 1; //suporte pro tamanho do novo plano em Z
    //     console.log(scene.stage)
    //     console.log(camera.position.z)
    //     createWater(scene, newplane)
    //     //------------------------
    //     //Terrain
    //     createTerrain(scene)
    // }

    if((Math.round(camera.position.z + 250)) % 500 == 0 && (Math.round(camera.position.z + 250)) < waterCheckBound){
        waterCheckBound = camera.position.z - 15
        let waterBack = scene.children.find(function(x){
            if(x.waterID && x.waterID == WATER_BACK){
                return x;
            }
        });
        let waterFront = scene.children.find(function(x){
            if(x.waterID && x.waterID == WATER_FRONT){
                return x;
            }
        });
        waterBack.position.z -= planeSize * 2
        waterBack.waterID = WATER_FRONT
        waterFront.waterID = WATER_BACK
    }

    if((Math.round(camera.position.z + 90)) % 180 == 0 && (Math.round(camera.position.z + 90)) < terrainCheckBound){ //só nos negativos pra nao trocar antes da hora no começo
        terrainCheckBound = camera.position.z - 15
        criaobj(scene);
        scene.stage+=1        
        let terrainBack = scene.children.find(function(x){
            if(x.terrainID && x.terrainID == TERRAIN_BACK){
                return x;
            }
        });
        let terrainFront = scene.children.find(function(x){
            if(x.terrainID && x.terrainID == TERRAIN_FRONT){
                return x;
            }
        });
        terrainBack.position.z -= modelSize * 2
        terrainBack.terrainID = TERRAIN_FRONT
        terrainFront.terrainID = TERRAIN_BACK
    }

}

//HELPER FUNCTIONS

async function removeOldPlane(scene,oldPlane){
    await new Promise(r => setTimeout(r, 6000));
    scene.remove(oldPlane);
}

function createWater(scene, plane){
    let water = new Water(
        plane,
        {
            textureWidth: 500,
            textureHeight: 500,
            waterNormals: new THREE.TextureLoader().load( 'assets/waternormals.jpg', function ( texture ) {
                
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                
            } ),
            waterColor: 0xbbbbb,
            sunColor: 0x111111,
            distortionScale: 20,
            alpha: 0.5,
        }
        );
    // let water = new Water( plane, {
    //     color: 0xb7fff9,
    //     scale: 6,
    //     flowDirection: new THREE.Vector2( 1, 1 ),
    //     textureWidth: 500,
    //     textureHeight: 500,
    //     waterNormals: new THREE.TextureLoader().load( 'assets/waternormals.jpg', function ( texture ) {        
    //         texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    //     } ),
    // } );
        
        water.position.set(0,0,((-planeSize) * (scene.stage - 1)) + planeSize/2);
        water.rotation.x = - Math.PI / 2;

    scene.add( water );
}

function createTerrains(scene){
    let startingPos = 220 //onde o terreno começa sendo gerado
    const mloader = new MTLLoader();
    const loader = new OBJLoader();
    let terrain = null

    mloader.load('assets/RioB rev1.mtl', (mtl) => {
        mtl.preload();
        loader.setMaterials(mtl)
        mtl.metalness = 0;
        mtl.roughness = 1;
        loader.load('assets/RioB rev1.obj', function(obj){
            //obj.position.set(0,4,0)
            let scale = 6
            obj.scale.set(scale+0.5, scale, scale)
            obj.position.set(0, 4, startingPos)
            obj.terrainID = TERRAIN_BACK
            scene.add(obj)
            terrain = obj
            //Sombras
            obj.traverse((node) => {
                if(node.isMesh) {
                    node.receiveShadow = true
                    node.material.shininess = 0
                } 
            })
        }, null, null)
        loader.load('assets/RioB rev1.obj', function(obj){
            //obj.position.set(0,4,0)
            let scale = 6
            obj.scale.set(scale+0.5, scale, scale)
            obj.position.set(0, 4, startingPos - modelSize)
            obj.terrainID = TERRAIN_FRONT
            scene.add(obj)
            terrain = obj
            //Sombras
            obj.traverse((node) => {
                if(node.isMesh) {
                    node.receiveShadow = true
                    node.material.shininess = 0
                } 
            })
        }, null, null)
    })


    //WATER

    var newplane = new THREE.PlaneGeometry(50, planeSize)
    scene.add(newplane)
    let water = new Water(
        newplane,
        {
            textureWidth: 500,
            textureHeight: 500,
            waterNormals: new THREE.TextureLoader().load( 'assets/waternormals.jpg', function ( texture ) {
                
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.receiveShadow = true;
                

            } ),
            waterColor: 0xbbbbb,
            sunColor: 0x111111,
            distortionScale: 20,
            alpha: 0.5,
        }
        );
        water.position.set(0, 0, 0);
        water.waterID = WATER_BACK
        water.receiveShadow = true;
        water.rotation.x = - Math.PI / 2;  
        scene.add(water)
    
    let water_2 = new Water(
        newplane,
        {
            textureWidth: 500,
            textureHeight: 500,
            waterNormals: new THREE.TextureLoader().load( 'assets/waternormals.jpg', function ( texture ) {
                
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.receiveShadow = true;
                
            } ),
            waterColor: 0xbbbbb,
            sunColor: 0x111111,
            distortionScale: 20,
            alpha: 0.5,
        }
        );
        water_2.waterID = WATER_FRONT
        water_2.position.set(0, 0, 0 - planeSize);
        water_2.rotation.x = - Math.PI / 2;
        water_2.receiveShadow = true;
        scene.add(water_2)
        
}

//DEPRECATED
function createTerrain(scene){
    const mloader = new MTLLoader();
    const loader = new OBJLoader();
    let terrain = null

    mloader.load('assets/RioB rev1.mtl', (mtl) => {
        mtl.preload();
        loader.setMaterials(mtl)
        mtl.metalness = 0;
        mtl.roughness = 1;
        loader.load('assets/RioB rev1.obj', function(obj){
            //obj.position.set(0,4,0)
            let scale = 6
            obj.scale.set(scale+0.5, scale, scale)
            obj.position.set(0, 4, -360 * scene.stage + planeSize - 30)
            scene.add(obj)
            terrain = obj
            //Sombras
            obj.traverse((node) => {
                if(node.isMesh) {
                    node.receiveShadow = true
                    node.material.shininess = 0
                } 
            })
        }, null, null)
        loader.load('assets/RioB rev1.obj', function(obj){
            //obj.position.set(0,4,0)
            let scale = 6
            obj.scale.set(scale+0.5, scale, scale)
            obj.position.set(0, 4, -360 * scene.stage + planeSize - 210)
            scene.add(obj)
            terrain = obj
            //Sombras
            obj.traverse((node) => {
                if(node.isMesh) {
                    node.receiveShadow = true
                    node.material.shininess = 0
                } 
            })
        }, null, null)
    })
}
