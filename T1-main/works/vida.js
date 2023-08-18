import { CSG } from "../libs/other/CSGMesh.js";
import * as THREE from 'three';
import { degreesToRadians} from "../libs/util/util.js";

const SCALE = 0.5

export function life(scene,X,Z){
// create a cube
 
let cube1 = new THREE.Mesh(new THREE.BoxGeometry(2, 5, 10))
// position the cube
cube1.position.set(0.0, 5, 0.0);


let cube2 = new THREE.Mesh(new THREE.BoxGeometry(2, 5, 10))
cube2.rotation.z = degreesToRadians(-90)
cube2.position.set(0.0, 5, 0.0);

//create a cylinder
const cylinder = new THREE.Mesh( new THREE.CylinderGeometry( 5, 5, 1, 50 ))
cylinder.position.set(0.0,5,0.0);
cylinder.rotation.x = degreesToRadians(-90)

//object 1 - cylinder substract cube
cylinder.matrixAutoUpdate=false;
cylinder.updateMatrix();
cube1.matrixAutoUpdate=false;
cube1.updateMatrix();
cube2.matrixAutoUpdate=false;
cube2.updateMatrix();
let cylinderCSG = CSG.fromMesh(cylinder);
let cubeCSG1 = CSG.fromMesh(cube1);
let cubeCSG2 = CSG.fromMesh(cube2);
let csgObject1 = cylinderCSG.subtract(cubeCSG1); //1o corte
let csgObject2 = csgObject1.subtract(cubeCSG2); //2 corte
let csgFinal = CSG.toMesh(csgObject2, new THREE.Matrix4()); //obj final
csgFinal.material = csgFinal.material = new THREE.MeshPhongMaterial({color:'red', shininess:"200"});  //material e cor do obj
csgFinal.scale.set(SCALE, SCALE, SCALE)
csgFinal.position.set(X,4.5,Z);

let collision = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()); 
collision.setFromObject(csgFinal);
csgFinal.bordLife = collision;

scene.add(csgFinal);
}