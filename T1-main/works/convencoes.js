export function degToReg(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

export function getAirplane(scene){
  return scene.children.find(function(x){
    if(x.name && x.name == 'A'){
        return x;
    }
  });
}

export function getMovementBorders(){
  let top_border = 225
  let bottom_border = 256.3
  let left_border = -17.5
  let right_border = 17.5
  return [top_border, bottom_border, left_border, right_border]
}