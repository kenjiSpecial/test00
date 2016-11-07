"use strict";
const THREE = require('three');


function B1(t) { return t*t*t }
function B2(t) { return 3*t*t*(1-t) }
function B3(t) { return 3*t*(1-t)*(1-t) }
function B4(t) { return (1-t)*(1-t)*(1-t) }


export default class RandomLine extends THREE.Mesh {
  constructor( mat, randomRoutes ) {
      var verticesNum = 20;
      var geometry = new THREE.Geometry();
      // var geometry = new THREE.Geometry();
      // for( var j = 0; j < Math.PI; j += 2 * Math.PI / 100 ) {
      //     var v = new THREE.Vector3( Math.cos( j ), Math.sin( j ), 0 );
      //     geometry.vertices.push( v );
      // }
      // var line = new THREE.MeshLine();
      // line.setGeometry( geometry );
      //
      // var material = new THREE.MeshLineMaterial();

      super(geometry, mat);


      this.randomRoutes = randomRoutes;

      this.rad = 75;
      this.rad2 = this.rad + 20;

      this.points = this.getRandomPoints();
      this.createLine()
  }
  getRandomPoints(){
      var rand = THREE.Math.randInt(0, this.randomRoutes.length - 1);
      var airPortRouteData = this.randomRoutes[rand];

      return this.getPos(airPortRouteData.pt0, airPortRouteData.pt1);
  }
  getPos(pt0, pt1){

      return {
          pt0: this.getPt( Number(pt0.longitude), Number(pt0.latitude), this.rad),
          pt1: this.getPt(pt1.longitude, pt1.latitude, this.rad),
          // anchor : new THREE.Vector3()
          anchor : this.getPt( (Number(pt0.longitude) + Number(pt1.longitude) )/2, ( Number(pt1.latitude) + Number(pt0.latitude) )/2, this.rad2)
      };


  }
  getPt( _lon, _lat, radius){
      var lon = Number(_lon);
      var lat = Number(_lat);

      var x, y, z;
      var phi = (90 - lat) * (Math.PI / 180);
      var theta = (lon + 180 ) * (Math.PI/180);
      var theta2 = (lon + 180 + 10) * (Math.PI/180);

      x = -((radius) * Math.sin(phi)*Math.cos(theta));
      z = ((radius) * Math.sin(phi)*Math.sin(theta));
      y = ((radius) * Math.cos(phi));

      return new THREE.Vector3(x, y, z);
  }
  getAnchorPt(rate){
      var pt = new THREE.Vector3();
      pt.x = this.points.pt0.x*B1(rate) + this.points.anchor.x * B2(rate) + this.points.anchor.x * B3(rate) + this.points.pt1.x * B4(rate);
      pt.y = this.points.pt0.y*B1(rate) + this.points.anchor.y * B2(rate) + this.points.anchor.y * B3(rate) + this.points.pt1.y * B4(rate);
      pt.z = this.points.pt0.z*B1(rate) + this.points.anchor.z * B2(rate) + this.points.anchor.z * B3(rate) + this.points.pt1.z * B4(rate);
      return pt;
  }
  createLine(){
      this.line = new THREE.MeshLine();

      this.curCount = THREE.Math.randInt(-40, -10);
      this.lineLength = THREE.Math.randInt ( 20, 80 );
      this.maxCount = THREE.Math.randInt ( 400, 600 );
      var geometry = new THREE.Geometry();

      // console.log(this.points.anchor);
      for(var ii = 0; ii < this.lineLength; ii++){

          var rate= 0; //this.curCount/this.maxCount;
          geometry.vertices.push(this.getAnchorPt(rate));
      }

      this.line.setGeometry(geometry, function(p){ return 0.3});
      this.geometry = this.line.geometry;
  }
  updateLine(){
      this.curCount = THREE.Math.randInt(-40, -10);
      // this.lineLength = 20; //THREE.Math.randInt ( 20, 80 );
      this.maxCount = 500; //THREE.Math.randInt ( 150, 200 );

      this.points = this.getRandomPoints();

      for(var ii = 0; ii < this.lineLength; ii++){
          var rate= this.curCount/this.maxCount;
          this.line.advance(this.getAnchorPt(0));

          // this.geometry.vertices.push(this.getAnchorPt(0));
      }
  }
  update(dt = 1/60){
      this.curCount++;

      var rate = THREE.Math.clamp(this.curCount/this.maxCount, 0, 1);

      this.line.advance(this.getAnchorPt(rate));


      if(this.curCount > this.lineLength + this.maxCount){
          this.updateLine();
      }
  }
}