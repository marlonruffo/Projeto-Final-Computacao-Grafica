import { degToReg, getAirplane, getMovementBorders } from './convencoes.js';


let fwdValue = 0;
let bkdValue = 0;
let rgtValue = 0;
let lftValue = 0;
let top_border, bottom_border, left_border, right_border
let borders = getMovementBorders();
let _scene
let _clock
top_border = borders[0];
bottom_border = borders[1];
left_border = borders[2];
right_border = borders[3];

const SHOTS_PER_SECOND = 2
const NERF_SPEED = 0.4

export function addJoysticks(scene){

    if(scene.plataforma == "pc") return;

    document.getElementById("buttons_mobile").style.display = "block";
    moverJoystick()
    
}

function moverJoystick(){
    let joystickL = nipplejs.create({
        zone: document.getElementById('joystickWrapper1'),
        mode: 'static',
        position: { top: '-80px', left: '80px' }
    });
    
    joystickL.on('move', function (evt, data) {
        const forward = data.vector.y
        const turn = data.vector.x
        fwdValue = bkdValue = lftValue = rgtValue = 0;
        if (forward > 0) 
        fwdValue = Math.abs(forward)
        else if (forward < 0)
        bkdValue = Math.abs(forward)
        
        if (turn > 0) 
        rgtValue = Math.abs(turn)
        else if (turn < 0)
        lftValue = Math.abs(turn)
    })
    
      joystickL.on('end', function (evt) {
          bkdValue = 0
          fwdValue = 0
          lftValue = 0
          rgtValue = 0
        })
    }
    
    export function moveAirplane(scene){
        let cameraHolder = scene.children.find(function(x){
            return x.type === 'Object3D';
        });
        let airplane = getAirplane(scene);
        if ( lftValue > 0 ){
            if (airplane.position.x >= left_border){ 
                airplane.position.x = airplane.position.x - lftValue * NERF_SPEED
                if(airplane.quaternion.x < 0.15) 
            airplane.rotateX(0.1)            
        }
    } else if ( rgtValue > 0 ){        
        if(airplane.quaternion.x > -0.15)
            airplane.rotateX(-0.1)
        if(airplane.position.x <= right_border){
            airplane.position.x = airplane.position.x + rgtValue * NERF_SPEED
            //airplane.translateZ(-0.3)
        }
    } else {
        if(airplane.quaternion.x > 0){
             airplane.rotateX(-0.03)
         }else if(airplane.quaternion.x < 0){
             airplane.rotateX(0.03)
         }        
    }

    if ( fwdValue > 0 ){
        if(airplane.position.z >= cameraHolder.position.z + top_border){
            //airplane.position.z -= fwdValue * NERF_SPEED
            airplane.translateX(-fwdValue * NERF_SPEED)
        }
    } 

    if ( bkdValue > 0 ){
        if(airplane.position.z <= cameraHolder.position.z + bottom_border){
            airplane.translateX(bkdValue * NERF_SPEED)
        }
    } 
}

