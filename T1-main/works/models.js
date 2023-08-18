import * as THREE from 'three';
import { RGBADepthPacking } from 'three';
import { Box3, Vector3 } from '../build/three.module.js';
import { Vector } from '../libs/other/CSGMesh.js';
import { degToReg, getAirplane, getMovementBorders } from './convencoes.js';
import { contaVidas, explosionAudio, mainshoot, missileShoot } from './index.js';
import {airplanedamage, enemyshoot}from './index.js';
import {GLTFLoader} from './loaders/GLTFLoader.js';
import { MTLLoader } from './loaders/MTLLoader.js';
import { OBJLoader } from './loaders/OBJLoader.js';
import { life } from './vida.js';

//Constantes
const textureLoader = new THREE.TextureLoader();

//Identificadores
const GROUND_ENEMY_NAME = 'ge';
const VERTICAL_ENEMY_NAME = 've';
const HORIZONTAL_ENEMY_NAME = 'he';
const DIAGONAL_ENEMY_NAME = 'de';
const ARC_ENEMY_NAME = 'ae';
const PLANE_PROJECTILE_NAME = 'pp';
const PLANE_MISSALE_NAME = 'pm';
const TANK_PROJECTILE_NAME = 'tp';
const AIR_PROJECTILE_NAME = 'ap';
const AIRPLANE_NAME = 'A';
const EXPLOSION_NAME = 'e'



//Parâmetros criação inimigo
const TANK_SCALE = 0.13
const TANK_SHOTS_PER_SECOND = 0.7
const AIR_SCALE = 0.25
const ARC_SCALE = 0.04
const AIRPLANE_SCALE = 0.004
const VERTICAL_SHOTS_PER_SECOND = 0.3
const DIAGONAL_SHOTS_PER_SECOND = 0.3
const HORIZONTAL_SHOTS_PER_SECOND = 0.3
const PLAYER_SHOTS_PER_SECOND = 2
const ARC_SHOTS_PER_SECOND = 0.3

//Parâmetros IA inimigos

//Ground Enemy
const TANK_NEAR = 4; //controle de spawn de tiros do tank
const TANK_FAR = 50; //controle de spawn de tiros do tank
const TIME_TO_PLANE = 1 * 60; //tempo em FRAMES para projetil alcançar avião 
const OFFSET_Z = 12; //tank vai mirar um pouco na frente, já que o avião tá andando
const BUILD_SPEED = 0.2; //Velocidade em que o tiro sobe
const FRONT_SPEED = 0.01; //Velocidade que o tiro vai levemente pra frente

//Air Enemy
const ENEMY_NEAR = 4; //controle de spawn de tiros do tank
const ENEMY_FAR = 40; //controle de spawn de tiros do tank
const ENEMY_TIME_TO_PLANE = 0.95 * 60; //tempo em FRAMES para projetil alcançar avião 
const AIR_OFFSET_Z = 10; //tank vai mirar um pouco na frente, já que o avião tá andando
const HORIZONTAL_SPEED = 0.2;
const VERTICAL_SPEED = 0.1;
const DIAGONAL_SPEED = 0.15;
const ARC_SPEED = 0.23;

const explosionTextures = [
    textureLoader.load('assets/explosion/1.png'),
    textureLoader.load('assets/explosion/2.png'),
    textureLoader.load('assets/explosion/3.png'),
    textureLoader.load('assets/explosion/4.png'),
    textureLoader.load('assets/explosion/5.png'),
    textureLoader.load('assets/explosion/6.png'),
    textureLoader.load('assets/explosion/7.png'),
    textureLoader.load('assets/explosion/8.png'),
    textureLoader.load('assets/explosion/9.png'),
    textureLoader.load('assets/explosion/10.png'),
    textureLoader.load('assets/explosion/11.png'),
    textureLoader.load('assets/explosion/12.png'),
    textureLoader.load('assets/explosion/13.png'),
    textureLoader.load('assets/explosion/14.png'),
    textureLoader.load('assets/explosion/15.png'),
    textureLoader.load('assets/explosion/16.png')
]

export function runAirplane(scene){
    let airplane = getAirplane(scene)
    airplane.translateX(-0.2);
    //console.log(airplane.position.z)
}

export function buildAirplane(scene){
    const loader = new GLTFLoader();
    var knotBBox = new THREE.Box3();
    loader.load('assets/pilot.glb', function(gltf){
        let airplane = gltf.scene
        scene.add(airplane)
        airplane.position.set(0, 6, 247)
        airplane.scale.set(AIRPLANE_SCALE, AIRPLANE_SCALE, AIRPLANE_SCALE)
        airplane.name = AIRPLANE_NAME
        airplane.shootInterval = PLAYER_SHOTS_PER_SECOND
        airplane.dead = false
        airplane.deadTimer = 0
        airplane.rotateY(degToReg(-90))
        airplane.quaternion.x = 0

        //Sombras
        airplane.traverse((node) => {
            if(node.isMesh) {
                node.castShadow = true
            } 
        })

        //Colisão do avião
        var collider = new THREE.Mesh(new THREE.TorusKnotGeometry(140, 220), new THREE.MeshLambertMaterial({ opacity: 0, transparent: false })); //false fica visivel
        var knotBoxHelper = new THREE.BoxHelper(collider, 0x00ff00);
        knotBoxHelper.update();
        knotBBox.setFromObject(airplane); //copia especificações do cone
        collider.add(knotBoxHelper); //adiciona o objeto ao cone
        knotBoxHelper.visible = true; //aparece ou não a area
        collider.visible = false;  //aparece o objeto ou não
        airplane.collider = collider;
        airplane.add(collider);

    }, null, null)

    return knotBBox
}

function shuffle(array) {
    var i = array.length,
        j = 0,
        temp;

    while (i--) {

        j = Math.floor(Math.random() * (i+1));

        // swap randomly chosen element with current element
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;

    }

    return array;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  }

    export function buildEnemys(scene){

        // let camera = scene.children.find(function(x){
        //     return x.type === 'Object3D';
        // });
    
        // let plane = scene.children.find(function(x){
        //     if(x.geometry){
        //         return x.geometry.type === 'PlaneGeometry';
        //     }
        // });
        // var tamgroundZ = 500; 
        // var possibleX = [-4,-3,-2,-1,1,2,3,4] ;   
    
        // var enemys = [];
        // for(let i = 0; i < (scene.stage * 5); i++){
        //     var randomx = shuffle(possibleX)[Math.round(Math.random() * 5)];
        //     var randomz = getRandomInt(-15,20);
        //     var cube1 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), new THREE.MeshLambertMaterial({ color: 0xff1200 })); //vermelho
        //     cube1.position.set((randomx*5), 6, -1 * ((scene.stage) * tamgroundZ) - (randomz * 10)); //cria a posição da cubo em x aleatorio no final do plano assim que tem um plano novo obs: tamanho do ground em positivo nesse caso
        //     var cubebounding1 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()); 
        //     cubebounding1.setFromObject(cube1);
        //     // cube1.add(cubebounding1);
        //     cube1.bordBox = cubebounding1;
        //     enemys.push(cube1);
        // }
        // console.log(scene);
    
        // enemys.forEach( function ( v ) {
        //     v.dead = false
        //     v.deadTimer = 0
        //     scene.add(v);
        // } );
        
    }


export function BuildProjeteis(){
    mainshoot();
    const geometry = new THREE.SphereGeometry( 0.25, 16, 8 );
    const material = new THREE.MeshLambertMaterial( { color: 0xffff00 } );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.name = PLANE_PROJECTILE_NAME

    var boundingsphere1 = new THREE.Sphere(sphere.position, 0.5); //esfera que vai detectar a colisão
    
    sphere.bounding = boundingsphere1;
    sphere.receiveShadow=true;
    return sphere;
}

export function BuildMissale(){
    missileShoot();
    const geometry = new THREE.SphereGeometry( 0.25, 16, 8 );
    const material = new THREE.MeshLambertMaterial( { color: 0xffff00 } );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.name = PLANE_MISSALE_NAME;

    var boundingsphere1 = new THREE.Sphere(sphere.position, 0.5); //esfera que vai detectar a colisão
    
    sphere.bounding = boundingsphere1;
    sphere.receiveShadow=true;
    return sphere;
}

export function runProjectile(scene){
    let shootingDistance = 90
    let airplane = getAirplane(scene);
    scene.children.filter(function(sphere) {
        if(sphere.name && sphere.name == PLANE_PROJECTILE_NAME){
            sphere.translateZ(-0.7);
            if((sphere.position.z - sphere.inicial[2]) < - shootingDistance){
                scene.remove(sphere);
            }
        }
    });
}

export function runMissel(scene){
    let shootingDistance = 90
    let airplane = getAirplane(scene);
    scene.children.filter(function(sphere) {
        if(sphere.name && sphere.name == PLANE_MISSALE_NAME){
            sphere.translateZ(-0.3);
            sphere.translateY(-0.1);
            if((sphere.position.y <= 0)){
                scene.remove(sphere);
            }
        }
    });
}


export function animations(scene){
    let filteredEsferas = scene.children.filter(function(x){
        if(x.bounding) return x;
      });
    
    filteredEsferas.forEach(function(esfera){

        let cubos = scene.children.filter(function(x){
        if(x.bordBox) return x;
        });
        cubos.forEach(function(cubo){

            if(cubo.dead){
                cubo.rotateY(degToReg(1));  //movimento de rotação do cubo
                cubo.translateY(-0.1)  //o cubo vai para baixo do plano
                cubo.deadTimer += 1
            }

            if (cubo.deadTimer == 60){
                scene.remove(cubo)
            }
        })

    });


    let airplane = getAirplane(scene);
    if(airplane.dead){
        let scale = 1 - airplane.deadTimer/60
        airplane.scale.set(scale, scale, scale)
        airplane.deadTimer += 1
    }

    if (airplane.deadTimer == 60){
        airplane.position.x = 0
        airplane.scale.set(1,1,1)
        airplane.dead = false
        airplane.deadTimer = 0
    }    
    

}

function createExplosion(scene, x, y, z){
    let geometry = new THREE.PlaneGeometry(4, 4)
    let material = new THREE.MeshLambertMaterial({alphaTest: 0.5});
    let explosion = new THREE.Mesh( geometry, material );
    explosion.position.set(x, 6, z)
    explosion.frame = 0
    explosion.rotateX(-Math.PI/2)
    explosion.name = EXPLOSION_NAME
    scene.add( explosion );
    explosionAudio();
}

export function animateExplosion(scene){
    let explosions = scene.children.filter(function(x){
        if(x.name && x.name == EXPLOSION_NAME) return x;
    });

    explosions.forEach((ex) => {
        if(ex.frame == 15){
            scene.remove(ex)
        }else{
            ex.material.map = explosionTextures[ex.frame]
            ex.frame += 1
        }
    })
}

export function checkCollisions(scene, knotBBox){
    let airplane = getAirplane(scene);

    //Colisão avião com inimigos
    
    let enemy_collisions = scene.children.filter(function(x){
        if(x.bordBox) return x;
      });
    

      let life_collisions = scene.children.filter(function(x){
        if(x.bordLife) return x;
      });

      life_collisions.forEach(function(x){
        //knotBBox.copy(airplane.geometry.boundingBox).applyMatrix4(airplane.matrixWorld);
        knotBBox.setFromObject(airplane)

        if(knotBBox.intersectsBox(x.bordLife) && !x.dead)
        {
          scene.remove(x);
          scene.vida += 1;
          contaVidas(scene);
          
        }
      });

      enemy_collisions.forEach(function(x){
        //knotBBox.copy(airplane.geometry.boundingBox).applyMatrix4(airplane.matrixWorld);
        
        if(knotBBox.setFromObject(airplane).intersectsBox(x.bordBox) && !x.dead && !scene.godmode)
        {
            createExplosion(scene, x.position.x, x.position.y, x.position.z)
            scene.remove(x)
            scene.vida -= 1
            contaVidas(scene);
        }
      });
    
    //Colisão projétil com inimigos
    let projectiles = scene.children.filter(function(x){
        if(x.name && x.name == PLANE_PROJECTILE_NAME || x.name == PLANE_MISSALE_NAME) return x;
      });
    
      projectiles.forEach(function(sphere){
    
          let enemies = scene.children.filter(function(x){
            if(x.bordBox) return x;
          });
          enemies.forEach(function(enemy){
            
            if(sphere.bounding.intersectsBox(enemy.bordBox))
            {
                createExplosion(scene, enemy.position.x, enemy.position.y, enemy.position.z)
                scene.remove(enemy);
                scene.remove(sphere);
            }
          })
    
        });

        //Colisão projetil com aviao
        let shoot = scene.children.filter(function(x){
            if(x.name && x.name == AIR_PROJECTILE_NAME) return x;
          })
        
          shoot.forEach((sphere) => {
            if(sphere.bound.intersectsBox(knotBBox) && !scene.godmode){
                scene.remove(sphere)
                airplanedamage();
                scene.vida -= 1;
                contaVidas(scene);
            }
          })
  
          let shoot_2 = scene.children.filter(function(x){
              if(x.name && x.name == TANK_PROJECTILE_NAME) return x;
            })
          
            shoot_2.forEach((sphere) => {
              if(sphere.bound.intersectsBox(knotBBox) && !scene.godmode){
                airplanedamage();
                scene.vida -= 2;
                contaVidas(scene);
                scene.remove(sphere)
              }
            })
  }


  export function createGroundEnemy(scene, x, z){
    const loader = new GLTFLoader();
    loader.load('assets/sub2.glb', function(gltf){
        let tank = gltf.scene
        scene.add(tank)
        tank.position.set(x,0,z)
        tank.scale.set(TANK_SCALE, TANK_SCALE, TANK_SCALE)
        tank.name = GROUND_ENEMY_NAME
        tank.shootInterval = TANK_SHOTS_PER_SECOND
        tank.receiveShadow=true;
        tank.castShadow=true;
        let collision = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()); 
        collision.setFromObject(tank);
        tank.bordBox = collision;

        //Sombras
        tank.traverse((node) => {
            if(node.isMesh) {
                node.castShadow = true
            } 
        })
    }, null, null)
  } 

  export function createVerticalEnemy(scene, x, z){
    let airplane = getAirplane(scene);
    const loader = new GLTFLoader();
    loader.load('assets/333.glb', function(gltf){
        let enemy = gltf.scene
        scene.add(enemy)
        enemy.position.set(x, 6, z)
        enemy.rotateY(degToReg(-90))
        enemy.scale.set(0.2, 0.2, 0.2)
        enemy.rotateY(degToReg(0))
        enemy.name = VERTICAL_ENEMY_NAME
        enemy.shootInterval = VERTICAL_SHOTS_PER_SECOND
        // enemy.receiveShadow=true;
        // enemy.castShadow=true;

        let collision = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()); 
        collision.setFromObject(enemy);
        enemy.bordBox = collision;

        enemy.traverse((node) => {
            if(node.isMesh) {
                console.log(node);
                node.castShadow = true
            } 
        })
    }, null, null)
  }

  export function createHorizontalEnemy(scene, x, z){
    let airplane = getAirplane(scene);
    const loader = new GLTFLoader();
    loader.load('assets/enemyair2.glb', function(gltf){
        let enemy = gltf.scene
        scene.add(enemy)
        enemy.position.set(x, 6, z)
        enemy.scale.set(0.10, 0.10, 0.10)
        enemy.name = HORIZONTAL_ENEMY_NAME
        enemy.shootInterval = HORIZONTAL_SHOTS_PER_SECOND
        if(x <= 0){
            enemy.rotateZ(degToReg(180))
        }
        let collision = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()); 
        collision.setFromObject(enemy);
        enemy.bordBox = collision;

        enemy.traverse((node) => {
            if(node.isMesh) {
                node.castShadow = true
            } 
        })
    }, null, null)
  }

  export function createDiagonalEnemy(scene, x, z){
    let airplane = getAirplane(scene);
    const loader = new GLTFLoader();
    loader.load('assets/333.glb', function(gltf){
        let enemy = gltf.scene
        scene.add(enemy)
        enemy.position.set(x, 6, z)
        enemy.scale.set(0.2, 0.2, 0.2)
        enemy.name = DIAGONAL_ENEMY_NAME
        enemy.shootInterval = DIAGONAL_SHOTS_PER_SECOND
        if(x <= 0){
            enemy.rotateY(degToReg(-135))
        }else{
            enemy.rotateY(degToReg(-45))
        }
        let collision = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()); 
        collision.setFromObject(enemy);
        enemy.bordBox = collision;
        enemy.dead = false
        enemy.traverse((node) => {
            if(node.isMesh) {
                node.castShadow = true
            } 
        })
    }, null, null)
  }

  export function createArcEnemy(scene, z){
    let borders = getMovementBorders();
    let right_border = borders[3];
    let airplane = getAirplane(scene);
    const loader = new GLTFLoader();
    loader.load('assets/enemyair3.gltf', function(gltf){
        let enemy = gltf.scene
        scene.add(enemy)
        enemy.position.set(right_border, 6, z)
        enemy.scale.set(ARC_SCALE, ARC_SCALE, ARC_SCALE )
        enemy.name = ARC_ENEMY_NAME
        enemy.shootInterval = ARC_SHOTS_PER_SECOND
        let collision = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()); 
        collision.setFromObject(enemy);
        enemy.bordBox = collision;
        enemy.dead = false
        enemy.traverse((node) => {
            if(node.isMesh) {
                node.castShadow = true
            } 
        })
    }, null, null)
  }

  export function enemyAttacks(scene, clock){
    let airplane = getAirplane(scene);
    let borders = getMovementBorders();
    let cameraHolder = scene.children.find((x) => {
        return x.type == 'Object3D'
    })
    let bottom_border = borders[1];
    let left_border = borders[2];
    let right_border = borders[3];
    let groundEnemies = scene.children.filter(function(x){
        if(x.name && x.name == GROUND_ENEMY_NAME) return x;
      });
    let verticalEnemies = scene.children.filter(function(x){
        if(x.name && x.name == VERTICAL_ENEMY_NAME) return x;
    })
    let horizontalEnemies = scene.children.filter(function(x){
        if(x.name && x.name == HORIZONTAL_ENEMY_NAME) return x;
    })
    let diagonalEnemies = scene.children.filter(function(x){
        if(x.name && x.name == DIAGONAL_ENEMY_NAME) return x;
    })
    let arcEnemies = scene.children.filter(function(x){
        if(x.name && x.name == ARC_ENEMY_NAME) return x;
    })

    let delta = clock.getDelta();
    
    //Criando tiros do inimigo no chão
    groundEnemies.forEach((tank) => {
        let distanceZ = airplane.position.z - tank.position.z
        let tankIsClose = distanceZ >= TANK_NEAR && distanceZ <= TANK_FAR //tank só atira se o avião estiver perto, mas não atrás
        tank.shootInterval += delta;
        if(tank.shootInterval >= 1 / TANK_SHOTS_PER_SECOND && tankIsClose){
            tank.shootInterval = 0

        let loader = new GLTFLoader();
        loader.load('assets/rocket.glb', (obj) => {
            enemyshoot();
            let missile = obj.scene
            scene.add(missile)
            missile.position.set(tank.position.x + 0.5, tank.position.y + 2, tank.position.z)
            missile.name = TANK_PROJECTILE_NAME;
            missile.lockOn = false; //Variável que define se o projétil já está indo em direção do avião
            missile.rotating = true;
            missile.speedX = -1; //Variáveis de velocidade que controlam o movimento do projétil
            missile.speedZ = -1;
            missile.receiveShadow=true;
            missile.castShadow=true;
            missile.scale.set(0.4, 0.4, 0.4 )
            var bbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()).setFromObject(missile); //esfera que vai detectar a colisão
            missile.bound = bbox  
            //Sombras
            missile.traverse((node) => {
                if(node.isMesh) {
                    node.castShadow = true
                } 
            })
        })
        // let mloader = new MTLLoader();
        // mloader.load('assets/missile.mtl', (mtl) => {
        //     mtl.preload();
        //     let oloader = new OBJLoader();
        //     oloader.setMaterials(mtl)
        //     console.log(mtl)
        //     //mtl.metalness = 0;
        //     //mtl.roughness = 1;
        //     oloader.load('assets/missile.obj', function(obj){
        //         enemyshoot();
        //         let missile = obj
        //         scene.add(missile)
        //         missile.position.set(tank.position.x + 0.5, tank.position.y + 2, tank.position.z)
        //         missile.name = TANK_PROJECTILE_NAME;
        //         missile.lockOn = false; //Variável que define se o projétil já está indo em direção do avião
        //         missile.rotating = true;
        //         missile.speedX = -1; //Variáveis de velocidade que controlam o movimento do projétil
        //         missile.speedZ = -1;
        //         missile.receiveShadow=true;
        //         missile.castShadow=true;
        //         missile.scale.set(0.08, 0.08, 0.08)
        //         var bbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()).setFromObject(missile); //esfera que vai detectar a colisão
        //         missile.bound = bbox  
        //         //Sombras
        //         missile.traverse((node) => {
        //             if(node.isMesh) {
        //                 node.castShadow = true
        //             } 
        //         })
    
        //     }, null, null)
        // })

            // const geometry = new THREE.SphereGeometry( 0.25, 16, 8 );
            // const material = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
            // const sphere = new THREE.Mesh( geometry, material );
            // sphere.position.set(tank.position.x + 0.5, tank.position.y + 2, tank.position.z) 
            // var boundingsphere1 = new THREE.Sphere(sphere.position, 0.5); //esfera que vai detectar a colisão
            // sphere.bound = boundingsphere1     
        }
        if(tank.position.z >= cameraHolder.position.z + bottom_border + 1){
            scene.remove(tank);
        }
        if(tank.dead){
            tank.rotateY(degToReg(1));  //movimento de rotação do cubo
            tank.translateY(-0.1)  //o cubo vai para baixo do plano
            tank.deadTimer += 1
            
        }

        if (tank.deadTimer == 60){
            scene.remove(tank)
        }
    })

    //Avião que anda horizontalmente
    horizontalEnemies.forEach((enemy) => {
        let distanceZ = airplane.position.z - enemy.position.z
        let enemyIsClose = Math.abs(distanceZ) <= ENEMY_FAR //avião só anda ou atira se tiver perto do player
        enemy.shootInterval += delta;
        if(enemyIsClose){
            enemy.translateX(-HORIZONTAL_SPEED);
        }
        
    })

    //Avião que anda em diagonal
    diagonalEnemies.forEach((enemy) => {
        let distanceZ = airplane.position.z - enemy.position.z
        let enemyIsClose = Math.abs(distanceZ) <= ENEMY_FAR //avião só anda ou atira se tiver perto do player
        enemy.shootInterval += delta;
        if(enemyIsClose){
            enemy.translateX(DIAGONAL_SPEED);
        }
        
    })

    //Avião vertical

    verticalEnemies.forEach((enemy) => {
        enemy.translateX(VERTICAL_SPEED);
    })

    //Avião que anda em arco
    arcEnemies.forEach((enemy) => {
        let distanceZ = airplane.position.z - enemy.position.z
        let enemyIsClose =  distanceZ <= ENEMY_FAR 
        enemy.shootInterval += delta;
        
        if(enemyIsClose && enemy.dead == false){
            enemy.rotation.y = Math.atan(1/15 * enemy.position.x)
            enemy.translateX(-ARC_SPEED);
        }
    })
    
    let airEnemies = verticalEnemies.concat(horizontalEnemies, diagonalEnemies, arcEnemies)
    
    //Criando tiros dos inimigos no ar
    airEnemies.forEach((enemy) => {
        let distanceZ = airplane.position.z - enemy.position.z
        let enemyIsClose = distanceZ >= ENEMY_NEAR && distanceZ <= ENEMY_FAR //aviao só atira se o avião estiver perto, mas não atrás
        enemy.shootInterval += delta;
        let inMiddle = enemy.position.x >= left_border && enemy.position.x <= right_border
        if(enemy.shootInterval >= 1 / VERTICAL_SHOTS_PER_SECOND && enemyIsClose && inMiddle){
            enemy.shootInterval = 0
            const geometry = new THREE.SphereGeometry( 0.25, 16, 8 );
            const material = new THREE.MeshLambertMaterial( { color: 0xffff00 } );
            const sphere = new THREE.Mesh( geometry, material );
            sphere.position.set(enemy.position.x, enemy.position.y, enemy.position.z + 0.5)      
            sphere.name = AIR_PROJECTILE_NAME;
            var boundingsphere1 = new THREE.Sphere(sphere.position, 0.5); //esfera que vai detectar a colisão
            sphere.bound = boundingsphere1
            sphere.lockOn = false; //Variável que define se o projétil já está indo em direção do avião
            sphere.speedX = -1; //Variáveis de velocidade que controlam o movimento do projétil
            sphere.speedZ = -1;
            sphere.receiveShadow=true;
            sphere.castShadow=true;
            scene.add(sphere)
        }
        if(enemy.position.z >= cameraHolder.position.z + bottom_border + 1){
            scene.remove(enemy);
        }
        
        if(enemy.dead){
            enemy.rotateY(degToReg(1));  //movimento de rotação do cubo
            enemy.translateY(-0.1)  //o cubo vai para baixo do plano
            enemy.deadTimer += 1
        }else{
            enemy.bordBox.setFromObject(enemy);
        }

        if (enemy.deadTimer == 60){
            scene.remove(enemy)
        }
    })

    

    projectilesAI(scene);

  }

  function projectilesAI(scene){
    let airplane = getAirplane(scene);
    let borders = getMovementBorders()
    let bottom_border = borders[1]
    let cameraHolder = scene.children.find((x) => {
        return x.type == 'Object3D'
    })

    //Tiro do chão
    scene.children.filter(function(sphere) {
        if(sphere.name && sphere.name == TANK_PROJECTILE_NAME && sphere.name != ''){
            //sphere.bound.min.sub(sphere.position);
            //sphere.bound.max.sub(sphere.position);
            sphere.bound = new Box3().setFromObject(sphere)
            if(sphere.position.y < airplane.position.y){
                sphere.translateY(BUILD_SPEED);
                sphere.translateZ(FRONT_SPEED)
            }else{
                if(!sphere.lockOn){
                    if(sphere.rotating){
                        sphere.rotation.z += degToReg(3)
                        let distanceX = airplane.position.x - sphere.position.x
                        let distanceZ = airplane.position.z - sphere.position.z - OFFSET_Z;
                        let sum = 0
                        if(distanceX > 0){ //avião está na direita
                            if(distanceZ > 0){ //avião ta em baixo
                                sum += Math.PI/2
                            }else{ //avião tá em cima
                                sum += Math.PI
                            }
                        }else{ //avião tá na esquerda
                            if(distanceZ <= 0){ //aviao ta em cima
                                sum += (3/4) * Math.PI
                            }
                        }
                        sphere.rotation.y = Math.atan(Math.abs(distanceZ)/Math.abs(distanceX)) + sum
                        if (sphere.rotation.z >= degToReg(90)){
                            sphere.rotating = false
                        }
                    }else{
                        //sphere.up.set(1, -1, 1)
                        //sphere.lookAt(airplane.position.x, airplane.position.y, airplane.position.z - OFFSET_Z)
                        let distanceX = airplane.position.x - sphere.position.x;
                        let distanceZ = airplane.position.z - sphere.position.z - OFFSET_Z;
                        sphere.speedX = distanceX / TIME_TO_PLANE;
                        sphere.speedZ = distanceZ / TIME_TO_PLANE;
                        sphere.lockOn = true;
                        //sphere.rotation.y = degToReg(270)
                        //sphere.rotation.y = Math.atan(Math.abs(distanceZ)/Math.abs(distanceX))
                    }
                }else{ 
                    sphere.position.x += sphere.speedX;
                    sphere.position.z += sphere.speedZ;
                }
            }
            if(sphere.position.z >= cameraHolder.position.z + bottom_border + 1){
                scene.remove(sphere);
            }
        }
        
    });

    //Tiros do ar
    scene.children.filter(function(sphere) {
        if(sphere.name && sphere.name == AIR_PROJECTILE_NAME){            
            if(!sphere.lockOn){
                let distanceX = airplane.position.x - sphere.position.x;
                let distanceZ = airplane.position.z - sphere.position.z - AIR_OFFSET_Z;
                sphere.speedX = distanceX / ENEMY_TIME_TO_PLANE;
                sphere.speedZ = distanceZ / ENEMY_TIME_TO_PLANE;
                sphere.lockOn = true;
            }else{ 
                sphere.translateX(sphere.speedX);
                sphere.translateZ(sphere.speedZ);
            }
            if(sphere.position.z >= cameraHolder.position.z + bottom_border + 1){
                scene.remove(sphere)
            }
        }
    });
  }




export function criaobj(scene){
    let stage = scene.stage;

    // 1 250 = - 250
    // 2 -250 = - 750
    // 3 -750 = - 1250
    // 4 -1250 = - 1750
    // x ((x-1)*-500)+250 ((x*-500)+250)

    createGroundEnemy(scene, -15, (((stage-1)*-500)+250)- 100)    //1 
    createVerticalEnemy(scene, -5,(((stage-1)*-500)+250)- 150)  
    createDiagonalEnemy(scene, 0, (((stage-1)*-500)+250)- 200)  
    createHorizontalEnemy(scene, 4, (((stage-1)*-500)+250)- 250)  
    createGroundEnemy(scene, 0,     (((stage-1)*-500)+250)- 333)     //1 
    createVerticalEnemy(scene, 7,   (((stage-1)*-500)+250)- 50)  
    createDiagonalEnemy(scene, 10,  (((stage-1)*-500)+250)- 103)  
    createHorizontalEnemy(scene, 14,(((stage-1)*-500)+250)- 401)  
    createGroundEnemy(scene, 5,     (((stage-1)*-500)+250)- 59)    //1 
    createVerticalEnemy(scene, -16, (((stage-1)*-500)+250)- 50)  
    createDiagonalEnemy(scene, -10, (((stage-1)*-500)+250)- 125)  
    createArcEnemy(scene, -10, (((stage-1)*-500)+250)- 400)  
    createHorizontalEnemy(scene,-15,(((stage-1)*-500)+250)- 183)  
    createGroundEnemy(scene, 0,     (((stage-1)*-500)+250)- 260)    //1 
    createVerticalEnemy(scene, 10,  (((stage-1)*-500)+250)- 20)  
    createArcEnemy(scene, 10,  (((stage-1)*-500)+250)- 88)  
    createDiagonalEnemy(scene, -5,  (((stage-1)*-500)+250)- 400)  
    createHorizontalEnemy(scene, 4, (((stage-1)*-500)+250)- 140)  
    createArcEnemy(scene, 4, (((stage-1)*-500)+250)- 150)  
    createGroundEnemy(scene, 15,    (((stage-1)*-500)+250)- 105)    
    createVerticalEnemy(scene, -7,  (((stage-1)*-500)+250)- 500)  
    life(scene,-16,(((stage-1)*-500)+250)- 111)  
    life(scene,-4,(((stage-1)*-500)+250)- 444)  
    life(scene,15,(((stage-1)*-500)+250)- 256)  

    life(scene,0,220);  
    

}

