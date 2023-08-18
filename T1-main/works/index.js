//---------------Importações---------------
//import * as THREE from 'three';
import * as THREE from '../build/three.module.js';
import { ShadowMapViewer } from '../build/jsm/utils/ShadowMapViewer.js';
//import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import { OBJLoader } from './loaders/OBJLoader.js'
import {MTLLoader} from './loaders/MTLLoader.js'
import {
  initRenderer,
  initDefaultBasicLight,
  initBasicMaterial,

  onWindowResize,
} from "../libs/util/util.js";
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import { initialPlane, newPlanes } from './ground.js';
import { buildCamera, runCamera, runLight } from './camera.js';
import { 
  buildAirplane,
  runAirplane,
  runProjectile,
  animations,
  checkCollisions,
  createGroundEnemy,
  enemyAttacks,
  createVerticalEnemy,
  runMissel,
  createHorizontalEnemy,
  createDiagonalEnemy,
  createArcEnemy,
  criaobj,
  animateExplosion,
  BuildMissale,
  BuildProjeteis
  
} from './models.js';
import { movements } from './keyboard.js';
import { groundandobstacles } from './marlon.js';
import Stats from '../build/jsm/libs/stats.module.js';
import { getAirplane } from './convencoes.js';
import {life} from './vida.js';
import { addJoysticks, moveAirplane } from './joystick.js';
import {Buttons} from './libs/buttons.js'
import KeyboardState from '../libs/util/KeyboardState.js';

//---------------Variáveis da cena---------------
export var keyboard = new KeyboardState();
var buttons = new Buttons(onButtonDown, onButtonUp);
//let trackballControls = new TrackballControls(camera, renderer.domElement ); 
//trackball para testes ^^^ 

let scene;  
let clock = new THREE.Clock(); 
const clock_2 = new THREE.Clock();
let renderer;   
let light;
let airplaneExists = false
let material;
let axesHelper = new THREE.AxesHelper(12);
scene = new THREE.Scene();  
scene.stage = 1; //Variável de controle de estágios da cena
//renderer = initRenderer({alpha: true});  
//renderer = new THREE.WebGLRenderer({alpha: true})
renderer = new THREE.WebGLRenderer({alpha: true});
renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

//renderer.setClearColor(new THREE.Color("rgb(0, 0, 0)"));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("webgl-output").appendChild(renderer.domElement);

scene.isPlay = false;

let screenX = window.screen.availWidth;

if(screenX>600) scene.plataforma = "pc";
else scene.plataforma = "mobile";


//Inimigos
//(Criar função para mapear tudo dps, sem poluir o index)

//---------------Construção da Câmera---------------
var cameraHolder = new THREE.Object3D(); //Objeto que carrega a câmera
var camera = buildCamera(scene);
cameraHolder.add(camera);
scene.add(cameraHolder);
let cylindergeometry = new THREE.CylinderGeometry( 5, 5, 1, 100 );
let cylindermaterial = new THREE.MeshPhongMaterial( { color: 0xff0000, shininess:"0" } );
let vida1 = new THREE.Mesh( cylindergeometry, cylindermaterial );  //cilindro que mostra a vida na interface
let vida2 = new THREE.Mesh( cylindergeometry, cylindermaterial );  //cilindro que mostra a vida na interface
let vida3 = new THREE.Mesh( cylindergeometry, cylindermaterial );  //cilindro que mostra a vida na interface
let vida4 = new THREE.Mesh( cylindergeometry, cylindermaterial );  //cilindro que mostra a vida na interface
let vida5 = new THREE.Mesh( cylindergeometry, cylindermaterial );  //cilindro que mostra a vida na interface
vida1.position.set(-300,0,-4500);
vida2.position.set(-285,0,-4500);
vida3.position.set(-270,0,-4500);
vida4.position.set(-255,0,-4500);
vida5.position.set(-240,0,-4500);
scene.add(vida1);
scene.add(vida2);
scene.add(vida3);
scene.add(vida4);
scene.add(vida5);

material = initBasicMaterial(); 

var ambientlightObjt = new THREE.AmbientLight(0xffffff,1)
 //LUZ
//hemisphere light
  scene.add(ambientlightObjt);                                                 //         TUDO QUE TA PASSANDO PELO CAMERA HOLDER TA SENDO REMOVIDO, INCLUSIVE AS LUZES, POR ISSO
  scene.light = ambientlightObjt;                                                                                                //         A VIDA DA INTERFACE, A CAMERA AMBIENTE E TALVEZ O PLANO ESTEJA APAGANDO POR ISSO


  var stats = new Stats();
//directional light
const directionalLight=new THREE.DirectionalLight(0xffffff,1);
directionalLight.position.copy(new THREE.Vector3(0,64,240));
directionalLight.shadow.camera.far = 65;  //posicionamento distancia da camera da luz
directionalLight.shadow.camera.near = 0.1; //posicionamento distancia da camera da luz
directionalLight.shadow.camera.top = 28;  //posicionamento distancia da camera da luz
directionalLight.shadow.camera.bottom= -20;  //posicionamento distancia da camera da luz
directionalLight.shadow.camera.left = 20;  //posicionamento distancia da camera da luz
directionalLight.shadow.camera.right=-20;  //posicionamento distancia da camera da luz
directionalLight.shadow.bias = -0.0005;      //serrilhado
directionalLight.shadow.blurSamples = 5;    //desfoque

scene.add(directionalLight);
directionalLight.castShadow=true;
const helper = new THREE.CameraHelper(directionalLight.shadow.camera); //camera auxiliar
scene.add(helper);  //add a camera
helper.visible = false; //MOSTRA OU NÃO O RAIO DA LUZ
const targetObject = new THREE.Object3D();    //Target da luz
targetObject.position.set(0,6,240);  //posição do target
scene.add(targetObject);  //add target a cena
directionalLight.target=targetObject;  //seleciona o target como direção que a luz vai mirar


//TELA DE CARREGAMENTO


var button = document.getElementById("myBtn");
button.innerHTML = 'COMECE A JOGAR';
scene.loadScrean = true;
button.addEventListener("click", onButtonPressed);




  function onButtonPressed() { 
    // Change the "Submit" text
    button.innerHTML = 'Por favor aguarde...';

    // Disable the submit button
    button.setAttribute('disabled', 'disabled');

    const loadingScreen = document.getElementById( 'loading-screen' );
    loadingScreen.transition = 0;
    backgroundmusic();
    backgroundmusic2();
    loadingScreen.classList.add( 'fade-out' );
    loadingScreen.addEventListener( 'transitionend', (e) => {
      const element = e.target;
      element.remove();  
      scene.loadScrean = false;

    });  
    scene.isPlay = true;
    render();

}


















//sons

const listener = new THREE.AudioListener();   //basic settings
camera.add(listener);
const audioLoader = new THREE.AudioLoader();

function backgroundmusic(){  //som de fundo
  clock_2.start()
  console.log('começou')
  const backgroundsound1 = new THREE.Audio(listener);
  audioLoader.load('assets/backgroundmusica.mp3', function(buffer){
    backgroundsound1.setBuffer(buffer);
    backgroundsound1.setLoop(true);
    backgroundsound1.setVolume(0.2);
    backgroundsound1.play();
  
  
  
  })

}

function backgroundmusic2(){  //som de fundo2

  const backgroundforestsound = new THREE.Audio(listener);
  audioLoader.load('assets/backgroundfloresta.mp3', function(buffer){
    backgroundforestsound.setBuffer(buffer);
    backgroundforestsound.setLoop(true);
    backgroundforestsound.setVolume(0.4);
    backgroundforestsound.play();
  
  
  })

}

export function airplanedamage(){    //dano sofrido por tiro

  const airplanedamagesound = new THREE.Audio(listener);
  audioLoader.load('assets/damage.mp3', function(buffer){
    airplanedamagesound.setBuffer(buffer);
    airplanedamagesound.setLoop(false);
    airplanedamagesound.setVolume(0.2);
    airplanedamagesound.play();
  
  
  
  })

}

export function mainshoot(){    //main atira

  const mainshootsound = new THREE.Audio(listener);
  audioLoader.load('assets/mainshoot.mp3', function(buffer){
    mainshootsound.setBuffer(buffer);
    mainshootsound.setLoop(false);
    mainshootsound.setVolume(0.1);
    mainshootsound.play();
  
  
  
  })

}
export function enemyshoot(){  //inimigo atira
  const enemyshootsound = new THREE.Audio(listener);
  audioLoader.load('assets/enemyshoot.mp3', function(buffer){
    enemyshootsound.setBuffer(buffer);
    enemyshootsound.setLoop(false);
    enemyshootsound.setVolume(0.1);
    enemyshootsound.play();
  
  
  
  })

}

export function missileShoot(){
  const enemyshootsound = new THREE.Audio(listener);
  audioLoader.load('assets/rocket.mp3', function(buffer){
    enemyshootsound.setBuffer(buffer);
    enemyshootsound.setLoop(false);
    enemyshootsound.setVolume(0.1);
    enemyshootsound.play();
  
  
  
  })
}

export function explosionAudio(){
  const mainshootsound = new THREE.Audio(listener);
    audioLoader.load('assets/explosion.mp3', function(buffer){
        mainshootsound.setBuffer(buffer);
        mainshootsound.setLoop(false);
        mainshootsound.setVolume(0.1);
        mainshootsound.play();
    })
}



// Criação do ShadowMap
var directionalLightShadowMapViewer = new ShadowMapViewer( directionalLight );
renderer.shadowMap.type  = THREE.VSMShadowMap; //tipo de shadowmap
directionalLightShadowMapViewer.size.set( 256, 256 );	//tamanho do shadow map
directionalLightShadowMapViewer.position.set( 1625, 0);	//posição do shadow map


//Avião e plano
var plane = initialPlane(scene);
var knotBBox = buildAirplane(scene);
scene.add(plane);

//Outros
//scene.add(axesHelper);

//VIDA -------------------------------------------------------------------


//function vidas(){  //COLOCAR ESSA FUNÇÃO NO RENDER
  //IF(COLLISION1 OU COLLISION 2 OU COLLISION 3)

scene.mapshadow = false;
//VIEWPORT---------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------
// Setting virtual camera
//-------------------------------------------------------------------------------
var ViewportLookAt   = new THREE.Vector3( -264, 0, -4500 );  //selecionando o target que a camera vai olhar (cilindros de vida)
var ViewportCameraPosition = new THREE.Vector3( -264, 30, -4500 );  //Posição da camera do viewport(superior aos cilindros achatados que representam a vida)
var ViewportLargura = 140;   //tamanho do mostrador da vida(largura)
var ViewportAltura = 35;  //tamanho do mostrador da vida(altura)
var Viewportcamera = new THREE.PerspectiveCamera(40, ViewportLargura/ViewportAltura, 1.0, 40.0);  //CRIAÇÃO DA CAMERA DO VIEWPORT
  Viewportcamera.position.copy(ViewportCameraPosition);  //posição do viewport
  Viewportcamera.lookAt(ViewportLookAt);  //lookat do viewport

function controlledRender()
{
  var width = window.innerWidth;
  var height = window.innerHeight;

  // Set main viewport
  renderer.setViewport(0, 0, width, height); // Reset viewport    
  renderer.setScissorTest(false); // Se isso for = true, a tela só aparece o viewport do lado e o resto fica tudo branco
  //renderer.setClearColor("rgb(0, 0, 100)");    //Cor fora do plano
  //renderer.clear();   // limpa a tela             talvez tirar
  renderer.render(scene, camera);   
  if(scene.mapshadow){
    directionalLightShadowMapViewer.render( renderer );
  }

  // Set virtual camera viewport 
  var offset = 10; 
  renderer.setViewport(offset, height-ViewportAltura-offset, ViewportLargura, ViewportAltura);  // Set virtual camera viewport  
  renderer.setScissor(offset, height-ViewportAltura-offset, ViewportLargura, ViewportAltura); // Set scissor with the same size as the viewport
  renderer.setScissorTest(true); // Enable scissor to paint only the scissor are (i.e., the small viewport)
  //renderer.setClearColorHex( 0x000000, 0 );  // Cor da caixa do viewport
  //renderer.setClearAlpha( 0.5 );
  renderer.clear(); // limpa a tela          /talvez tirar
  renderer.render(scene, Viewportcamera);  // Render scene of the virtual camera
}


// window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);
//let orbit = new OrbitControls( camera, renderer.domElement );// Controlador obit mantido para realizar testes
criaobj(scene);
scene.godmode = false;
scene.vida = 5;  //VIDA
contaVidas(scene);



addJoysticks(scene);

render();


function render() {
  if(clock_2.getElapsedTime() >= 140){
    scene.godmode = true
    document.getElementById("victory").style.display = "block";
    if(clock_2.getElapsedTime() >= 142){
      window.location.reload();
    }
    //console.log('acabou o jogo')
  }
  if (!scene.isPlay) return;
  requestAnimationFrame(render);

  stats.update();

  if(airplaneExists || getAirplane(scene) != undefined){
    airplaneExists = true;
    checkCollisions(scene, knotBBox);
    runProjectile(scene);
    runMissel(scene);

    runAirplane(scene);
    // animations(scene);
    animateExplosion(scene)
    enemyAttacks(scene, clock);

    if(scene.plataforma == "pc")movements(scene, clock);
    else{
      moveAirplane(scene);
      shootJoystick();
    }
    
  }
  
  newPlanes(scene)
  //groundandobstacles(scene);
  //trackballControls.update();
  runCamera(cameraHolder);
  controlledRender();
  runLight(directionalLight);  //luz anda junto com a camera principal
  runLight(targetObject);  //target anda junto com a camera principal
}


 export function contaVidas(scene){
  //VIDA -------------------------------------------------------------------
  
  if(scene.vida ==1){ 
    scene.remove(vida1);   //REMOVE TODAS PRA NAO TER SOBREPOSIÇÃO E ADICIONA DEPOIS
    scene.remove(vida2);
      scene.remove(vida3);
      scene.remove(vida4);
      scene.remove(vida5);
      scene.add(vida1);
      
    }
    
    if(scene.vida ==2){
      scene.remove(vida1);
      scene.remove(vida2);
      scene.remove(vida3);
      scene.remove(vida4);
      scene.remove(vida5);
      scene.add(vida1);
      scene.add(vida2);
      
    }
    
    if(scene.vida ==3){
      scene.remove(vida1);
      scene.remove(vida2);
      scene.remove(vida3);
      scene.remove(vida4);
      scene.remove(vida5);
      scene.add(vida1);
      scene.add(vida2);
      scene.add(vida3);
    }
    
    if(scene.vida ==4){
      scene.remove(vida1);
      scene.remove(vida2);
      scene.remove(vida3);
      scene.remove(vida4);
      scene.remove(vida5);
      scene.add(vida1);
      scene.add(vida2);
      scene.add(vida3);
      scene.add(vida4);
    }
    
    if(scene.vida >=5){
      scene.vida = 5;
      scene.remove(vida1);
      scene.remove(vida2);
      scene.remove(vida3);
      scene.remove(vida4);
      scene.remove(vida5);
      scene.add(vida1);
      scene.add(vida2);
      scene.add(vida3);
      scene.add(vida4);
      scene.add(vida5);
      
    }
    
    if(scene.vida <= 0){
      window.alert("SUAS VIDAS ACABARAM");
      window.location.reload();
    }
  }
  
  

let pressingA = false
let pressingB = false

  function onButtonDown(event) {
    
    const SHOTS_PER_SECOND = 0.2
    let airplane = getAirplane(scene);
    let delta
    switch(event.target.id)
    {
      case "A":
        pressingA = true
      break;
      case "B":
        pressingB = true
      break;
    }
  }
    
  function onButtonUp(event) {
      pressingA = false
      pressingB = false
  }

  function shootJoystick(){
    let airplane = getAirplane(scene)
    let delta 
    const SHOTS_PER_SECOND = 2
    if(pressingA){
      delta = clock.getDelta() * 10;
      airplane.shootInterval += delta;
      console.log(airplane.shootInterval)
      if(airplane.shootInterval >= 1 / SHOTS_PER_SECOND){
          var projetil = BuildProjeteis();
          var x = airplane.position.x;
          var y = airplane.position.y;
          var z = airplane.position.z;
          projetil.position.set(x,y,z);
          projetil.inicial = [x,y,z];
          (scene.add(projetil));
          airplane.shootInterval = 0;
      }
    }else if(pressingB){
      delta = clock.getDelta() * 10;
      airplane.shootInterval += delta;

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
  }


document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
if(!scene.loadScrean){
  var keyCode = event.which;

  if(keyCode == 80){
    console.log(document.getElementById("pause"));
    if(scene.isPlay){
      scene.isPlay = false;
      document.getElementById("pause").style.display = "block";
    }else{
      scene.isPlay = true;
      document.getElementById("pause").style.display = "none";
      render();
    }
  }
}

};