'use strict';

import AirPort from './air-port';
import RandomRouteLine from './random-route-line';
const TweenMax = require('gsap');
const glslify = require('glslify');
const THREE = require('three');
window.THREE = THREE;

const Stats = require('stats.js');
require('three/examples/js/controls/OrbitControls');
require('./THREE.MeshLine');

var camera, scene, renderer, mouse, stats, geometry, shaderMaterial, mesh, clock;
var controls, radius, randomRouteLine;
var directionLight;
var airPortData;
var pointGeometry;
// var windowHalfX, windowHalfY;
var dayImgSrc = 'earth-day.jpg';
var nightImgSrc = 'earth-night.jpg';
var images = [
    dayImgSrc,
    nightImgSrc
];

var airportMeshes = [];


var loadedAssetCnt = 0;
var isLoop;
var textures = {};

var randomRoutes = [];

(() =>{
    fetchJsonFile('airpot.json', loadAssets);
})();

function fetchJsonFile(path, callback){
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState === 4){
            if(httpRequest.status == 200){
                var data = JSON.parse(httpRequest.responseText);
                if(callback) callback(data);
            }
        }
    };

    httpRequest.open('GET', path);
    httpRequest.send();
}


function loadAssets(jsonData){
    airPortData = new AirPort(jsonData);

    images.forEach((imgSrc) =>{
        var image = new Image();
        image.onload = () =>{
            var tex = new THREE.Texture(image);
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.needsUpdate = true;

            textures[imgSrc] = tex;

            loadedAssetCnt++;

            if(images.length == loadedAssetCnt) onLoadedAssets();
        };
        image.src = imgSrc;
        image.crossOrigin = 'crossOrigin';
    });
}

function onLoadedAssets(){
    init();
    isLoop = true;
    TweenMax.ticker.addEventListener('tick', loop);
}


function init(){
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 2 * 100;
    scene.add(camera);


    directionLight = new THREE.DirectionalLight(0xaaff33, 0);
    directionLight.position.set(-1, 1, 0.5).normalize();
    scene.add(directionLight);

    var size = 0.75 * 100;
    radius = size;

    geometry = new THREE.SphereGeometry(size, 32, 16);
    shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            sunDirection: {
                value: new THREE.Vector3(0, 0, 1)
            },
            dayTexture: {
                value: textures[dayImgSrc]
            },
            nightTexture: {
                value: textures[nightImgSrc]
            }
        },
        vertexShader: glslify('./shaders/shader.vert'),
        fragmentShader: glslify('./shaders/shader.frag'),
        transparent: true
    });

    mesh = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(mesh);

    pointGeometry = new THREE.Geometry();
    airPortData.airports.forEach((data)=>{
        mapAirpots(Number(data.longitude), Number(data.latitude));
    });
    pointGeometry.verticesNeedUpdate = true;
    var mat = new THREE.PointsMaterial({color: 0x9999ff, transparent: true, opacity: 0.9, size: 0.5, side: THREE.DoubleSide });
    // var mat = new THREE.PointsMaterial( { size: 35, sizeAttenuation: false, map: sprite, alphaTest: 0.5, transparent: true } );
    var pointMesh = new THREE.Points(pointGeometry, mat);
    scene.add(pointMesh)

    var meshLineMat = new THREE.MeshLineMaterial({color : new THREE.Color(0xffffff), lineWidth: 0.5});

    for(var ii = 0; ii < 150;  ii++){
        var route = new RandomRouteLine( meshLineMat, airPortData.routes); //airPortRouteData.pt0, airPortRouteData.pt1, scene);
        randomRoutes.push(route);
        scene.add(route);
    }

    renderer = new THREE.WebGLRenderer({antialias : true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);

    stats = new Stats();
    clock = new THREE.Clock();
    document.body.appendChild(stats.dom);

    document.body.appendChild(renderer.domElement);
    document.addEventListener('mousemove', onDocumentMouseMove, false);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;
    // controls.dampingFactor = 1;
    controls.enableZoom = true;

}
//
// var size = 0.3;
// var box = new THREE.BoxGeometry(size, size, size);


function mapAirpots(lon, lat){
    var x, y, z;
    var phi = (90 - lat) * (Math.PI / 180);
    var theta = (lon + 180 ) * (Math.PI / 180);
    var theta2 = (lon + 180 + 10) * (Math.PI / 180);

    x = -((radius) * Math.sin(phi) * Math.cos(theta));
    z = ((radius) * Math.sin(phi) * Math.sin(theta));
    y = ((radius) * Math.cos(phi));


    // console.log('??');
    // console.log(pointGeometry.vertices);
    pointGeometry.vertices.push(new THREE.Vector3(x, y, z));

    // var mesh = new THREE.Mesh(box, mat);
    // mesh.position.set(x, y, z);
    // scene.add(mesh);
}

function loop(){
    var time = clock.getElapsedTime();
    var rate = time / 100 * 2 * Math.PI;
    shaderMaterial.uniforms.sunDirection.value.x = Math.sin(-rate * 2 * Math.PI);
    shaderMaterial.uniforms.sunDirection.value.z = Math.cos(-rate * 2 * Math.PI);

    randomRoutes.forEach((randomRoute)=>{
        randomRoute.update();
    })

    controls.update();

    renderer.render(scene, camera);
    stats.update();
}


function onDocumentMouseMove(event){
    event.preventDefault();
    if(!mouse) mouse = new THREE.Vector2();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

}

window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('keydown', function(ev){
    switch(ev.which){
        case 27:
            isLoop = !isLoop;
            if(isLoop){
                clock.stop();
                TweenMax.ticker.addEventListener('tick', loop);
            }else{
                clock.start();
                TweenMax.ticker.removeEventListener('tick', loop);
            }
            break;
    }
});
