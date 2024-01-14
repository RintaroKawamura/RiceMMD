
//家の電気止まってしまって、APAホテルで作りました。（01/14 15:00）
//哀れに思うならレッドブルめぐんでください。お願いします。(´；ω；｀)ｳｩｯ

var container;
var stats;
var camera, scene, renderer, effect;
var controls;
var helper;
var shaderPass, composer, composer2;

var miku;
var main = new THREE.Group();
var beams = new THREE.Group();
var monitors = new THREE.Group();

beams.visible = false;
monitors.visible = false;

var directionalLight, spotLight;

var ready = false;

var clock = new THREE.Clock();

init();
animate();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    // FPSの表示
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.zIndex = 100;
    document.body.appendChild(stats.domElement);


    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.y = 15;
    camera.position.z = 50;


    // renderer

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0x000000));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    //マウスコントロールするなら
    //controls = new THREE.OrbitControls(camera, renderer.domElement);
    //controls.minDistance = 10;
    //controls.maxDistance = 60;
    //controls.maxPolarAngle = Math.PI * 0.5;

    effect = new THREE.OutlineEffect(renderer);

    // scene

    scene = new THREE.Scene();

    // lights

    spotLight = new THREE.SpotLight(0x223344);
    spotLight.position.set(5, 20, 15);
    spotLight.angle = 0.8;
    spotLight.intensity = 0.8;
    spotLight.penumbra = 0.7;
    spotLight.castShadow = true;

    // Model specific Shadow parameters
    spotLight.shadow.bias = -0.001;

    scene.add(spotLight);
    scene.add(spotLight.target);

    directionalLight = new THREE.DirectionalLight(0x333333);
    directionalLight.position.set(-15, 15, 20);

    // Shadow parameters
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.x = 1024;
    directionalLight.shadow.mapSize.y = 1024;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.bottom = -20;

    // Model specific Shadow parameters
    renderer.shadowMap.renderSingleSided = false;
    renderer.shadowMap.renderReverseSided = false;
    directionalLight.shadow.bias = -0.001;

    scene.add(directionalLight);

    // pass

    var bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.0, 0.7, 0.1
    );

    var copyPass = new THREE.ShaderPass(THREE.CopyShader);
    var copyPass2 = new THREE.ShaderPass(THREE.CopyShader);

    copyPass.renderToScreen = true;

    composer = new THREE.EffectComposer(renderer);
    composer.setSize(window.innerWidth, window.innerHeight);
    composer.addPass(bloomPass);
    composer.addPass(copyPass);

    composer2 = new THREE.EffectComposer(renderer);
    composer2.readBuffer = composer.readBuffer;
    composer2.setSize(window.innerWidth, window.innerHeight);
    composer2.addPass(copyPass2);

    // model

    //Loading Loading Loading Quickly reaching maximum capacity
    var onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log(Math.round(percentComplete, 2) + '% downloaded');
        }
    };

    var onError = function (xhr) {
    };

    // see the license https://github.com/takahirox/MMDLoader-app#readme for these assets
    //var vmdFiles = [ 'https://rawcdn.githack.com/mrdoob/three.js/r87/examples/models/mmd/vmds/wavefile_v2.vmd' ];
    //var cameraFiles = [ 'https://rawcdn.githack.com/mrdoob/three.js/r87/examples/models/mmd/vmds/wavefile_camera.vmd' ];
    var modelFile = 'Model/ライス.pmx';
    var vmdFiles = ['Motion/umapyoi_Center.vmd'];
    var cameraFiles = ['Camera/camera.vmd'];
    var audioFile = 'audio/umapyoi6.mp3';
    var audioParams = { delayTime: 160 * 1 / 30 };

    helper = new THREE.MMDHelper();

    // ステージの作成
    /*
    var sGeometry = new THREE.PlaneGeometry(150, 50);
    var stageTexture = THREE.ImageUtils.loadTexture('Stage/shiba.jpg');
    stageTexture.wrapS = stageTexture.wrapT = THREE.RepeatWrapping;
    stageTexture.repeat.set(45, 15);
    var sMaterial = new THREE.MeshLambertMaterial({ map: stageTexture, side: THREE.DoubleSlide });
    var stage = new THREE.Mesh(sGeometry, sMaterial);
    stage.position.set(0, -10, 0)
    stage.rotation.x = -90 * Math.PI / 180;
    scene.add(stage);
    */


    var loader = new THREE.MMDLoader();

    loader.load(modelFile, vmdFiles, function (object) {

        var mesh = object;
        miku = mesh;

        var materials = mesh.material;

        for (var i = 0, il = materials.length; i < il; i++) {

            var material = materials[i];
            material.emissive.multiplyScalar(0.2);

        }

        mesh.castShadow = false;
        mesh.receiveShadow = true;

        helper.add(mesh);
        helper.setAnimation(mesh);
        helper.setPhysics(mesh);

        main.add(mesh);

        //MMD のカメラデータをよむならこ↑こ↓
        //loader.loadVmds( cameraFiles, function ( vmd ) {
        //	helper.setCamera( camera );
        //	loader.pourVmdIntoCamera( camera, vmd );
        //	helper.setCameraAnimation( camera );

        loader.loadAudio(audioFile, function (audio, listener) {

            listener.position.z = 1;

            helper.setAudio(audio, listener, audioParams);

            /*
             * Note: call this method after you set all animations
             *       including camera and audio.
             */
            helper.unifyAnimationDuration({ afterglow: 2.0 });

            scene.add(audio);
            scene.add(listener);
            scene.add(main);

            star = new THREE.Mesh(
                new THREE.SphereBufferGeometry(0.1, 8),
                new THREE.MeshPhongMaterial({
                    opacity: 0.1,
                    transparent: true
                })
            );

            ready = true;

        }, onProgress, onError);

        //}, onProgress, onError );

    }, onProgress, onError);

    // beams

    var geometry = new THREE.SphereBufferGeometry(0.05, 4);
    var beamNum = 200;

    for (var i = 0; i < beamNum; i++) {

        var mesh = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({
                color: 0xffff88,
                opacity: 0.25 - 0.25 / beamNum * i,
                transparent: true
            })
        );

        beams.add(mesh);
    }
    scene.add(beams);

    // back & ground

    main.add(new THREE.Mesh(
        new THREE.SphereBufferGeometry(256, 32),
        new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true
        })
    ));

    var ground = new THREE.Mesh(
        new THREE.CircleBufferGeometry(50, 32),
        new THREE.MeshPhongMaterial({ color: 0x444444, emissive: 0x002222, side: THREE.FrontSide })
    );
    ground.rotation.x = -90 * Math.PI / 180;
    ground.receiveShadow = true;
    main.add(ground);

    // monitors

    var geometry = new THREE.PlaneBufferGeometry(100, 40);
    var material = new THREE.ShaderMaterial(
        {
            uniforms: {
                strength: { value: 0.20 },
                tDiffuse: { value: composer2.writeBuffer.texture }
            },
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: document.getElementById('fragmentShader').textContent
        }
    );

    var edgeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    function createMonitor() {

        var mesh = new THREE.Mesh(geometry, material);
        var edge = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        edge.scale.multiplyScalar(1.01);
        edge.position.z -= 0.01;

        mesh.add(edge);
        return mesh;
    }

    var tv;

    
    tv = createMonitor();
    tv.position.y = 25;
    tv.position.z = -50;
    tv.rotation.x = 180 * Math.PI / 180;
    tv.rotation.y = 180 * Math.PI / 180;
    tv.rotation.z = 180 * Math.PI / 180;
    monitors.add(tv);

    tv = createMonitor();
    tv.position.x = -70;
    tv.position.y = 25;
    tv.position.z = 0;
    tv.rotation.x = 180 * Math.PI / 180;
    tv.rotation.y = 110 * Math.PI / 180;
    tv.rotation.z = 180 * Math.PI / 180;
    monitors.add(tv);

    tv = createMonitor();
    tv.position.x = 70;
    tv.position.y = 25;
    tv.position.z = 0;
    tv.rotation.x = 180 * Math.PI / 180;
    tv.rotation.y = -110 * Math.PI / 180;
    tv.rotation.z = 180 * Math.PI / 180;
    monitors.add(tv);

    scene.add(monitors);

    //
    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    effect.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    composer2.setSize(window.innerWidth, window.innerHeight);

}

//

function updateBeams() {

    var pos = miku.skeleton.bones[110].getWorldPosition();

    var num = 20;

    for (var i = beams.children.length - 1; i > 0; i--) {

        if (i < num) {

            beams.children[i].position.copy(beams.children[0].position).lerp(pos, i / num);

        } else {

            beams.children[i].position.copy(beams.children[i - num].position);

        }

    }

    beams.children[0].position.copy(pos);

}

function animate() {

    requestAnimationFrame(animate);
    render();
    stats.update();

}

function render() {

    if (ready) {

        var delta = clock.getDelta();
        helper.animate(delta);

        spotLight.target.position.copy(miku.children[0].getWorldPosition());

        updateBeams();

    }

    // pass 1. render main

    renderer.autoClear = true;
    renderer.shadowMap.enabled = true;

    scene.autoUpdate = true;

    main.visible = true;
    beams.visible = false;
    monitors.visible = false;

    effect.render(scene, camera, composer.readBuffer);

    // pass 2. render beams

    renderer.autoClear = false;
    renderer.shadowMap.enabled = false;

    scene.autoUpdate = false;

    main.visible = false;
    beams.visible = true;
    monitors.visible = false;

    renderer.render(scene, camera, composer.readBuffer);

    // pass 3. copy for monitors

    composer2.render();

    // pass 4. render monitors

    main.visible = false;
    beams.visible = false;
    monitors.visible = true;

    renderer.render(scene, camera, composer.readBuffer);

    // pass 5. render to screen

    composer.render();

}

