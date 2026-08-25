let scene;
let camera;
let renderer;

let player;

let flashlightOn = true;

let moveX = 0;
let moveY = 0;

let lastTouchX = null;
let lastTouchY = null;


/* =========================
   START GAME
========================= */

document
    .getElementById("startButton")
    .addEventListener("click", startGame);


function startGame() {

    document.getElementById("menu").style.display = "none";

    document.getElementById("game").style.display = "block";

    createGame();

    showMessage(
        "02:17 AM\n\nБОЛЬНИЦА ЗАКРЫТА."
    );

}


/* =========================
   CREATE GAME
========================= */

function createGame() {

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x020304);

    scene.fog = new THREE.Fog(
        0x020304,
        2,
        35
    );


    /* CAMERA */

    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.05,
        100
    );

    camera.position.set(
        0,
        1.65,
        6
    );


    /* RENDERER */

    renderer = new THREE.WebGLRenderer({
        antialias: false
    });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 1.5)
    );

    renderer.shadowMap.enabled = true;

    document
        .getElementById("game")
        .appendChild(renderer.domElement);


    /* LIGHT */

    const ambient =
        new THREE.AmbientLight(
            0x777788,
            0.22
        );

    scene.add(ambient);


    const light =
        new THREE.PointLight(
            0xaaaaff,
            1.2,
            12
        );

    light.position.set(
        0,
        2.6,
        3
    );

    scene.add(light);


    /* FLOOR */

    const floorMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x303238,
            roughness: 1
        });


    const floor =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                10,
                .2,
                30
            ),
            floorMaterial
        );

    floor.position.y = 0;

    scene.add(floor);


    /* WALLS */

    const wallMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x55545a,
            roughness: 1
        });


    const leftWall =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .3,
                3,
                30
            ),
            wallMaterial
        );

    leftWall.position.set(
        -5,
        1.5,
        0
    );

    scene.add(leftWall);


    const rightWall =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .3,
                3,
                30
            ),
            wallMaterial
        );

    rightWall.position.set(
        5,
        1.5,
        0
    );

    scene.add(rightWall);


    /* CEILING */

    const ceiling =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                10,
                .2,
                30
            ),
            new THREE.MeshStandardMaterial({
                color: 0x202126
            })
        );

    ceiling.position.y = 3;

    scene.add(ceiling);


    /* HOSPITAL DOORS */

    createDoor(-4.8, -2);
    createDoor(4.8, -7);
    createDoor(-4.8, -14);


    /* LIGHTS */

    createCeilingLight(0, 2, 2);
    createCeilingLight(0, 2, -8);
    createCeilingLight(0, 2, -18);


    /* START CAMERA */

    setupControls();


    window.addEventListener(
        "resize",
        resize
    );


    animate();

}


/* =========================
   DOOR
========================= */

function createDoor(
    x,
    z
) {

    const material =
        new THREE.MeshStandardMaterial({
            color: 0x292a2d,
            roughness: 1
        });


    const door =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .15,
                2.3,
                1.5
            ),
            material
        );


    door.position.set(
        x,
        1.15,
        z
    );


    scene.add(door);

}


/* =========================
   CEILING LIGHT
========================= */

function createCeilingLight(
    x,
    y,
    z
) {

    const light =
        new THREE.PointLight(
            0xc8d0ff,
            2,
            7
        );

    light.position.set(
        x,
        y + .5,
        z
    );

    scene.add(light);


    const bulb =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.3,
                .08,
                .15
            ),
            new THREE.MeshBasicMaterial({
                color: 0xeeeeff
            })
        );

    bulb.position.copy(
        light.position
    );

    scene.add(bulb);

}


/* =========================
   CONTROLS
========================= */

function setupControls() {

    const joystick =
        document.getElementById(
            "joystick"
        );

    const stick =
        document.getElementById(
            "joystickStick"
        );


    joystick.addEventListener(
        "touchmove",
        function(event) {

            const touch =
                event.touches[0];

            const rect =
                joystick.getBoundingClientRect();

            const centerX =
                rect.left +
                rect.width / 2;

            const centerY =
                rect.top +
                rect.height / 2;


            let dx =
                touch.clientX -
                centerX;

            let dy =
                touch.clientY -
                centerY;


            const max = 35;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (distance > max) {

                dx =
                    dx / distance * max;

                dy =
                    dy / distance * max;

            }


            stick.style.transform =
                `translate(${dx}px, ${dy}px)`;


            moveX =
                dx / max;

            moveY =
                dy / max;

        },
        { passive: true }
    );


    joystick.addEventListener(
        "touchend",
        function() {

            stick.style.transform =
                "translate(0,0)";

            moveX = 0;

            moveY = 0;

        }
    );


    const lookArea =
        document.getElementById(
            "lookArea"
        );


    lookArea.addEventListener(
        "touchstart",
        function(event) {

            const touch =
                event.touches[0];

            lastTouchX =
                touch.clientX;

            lastTouchY =
                touch.clientY;

        },
        { passive: true }
    );


    lookArea.addEventListener(
        "touchmove",
        function(event) {

            const touch =
                event.touches[0];


            const dx =
                touch.clientX -
                lastTouchX;


            const dy =
                touch.clientY -
                lastTouchY;


            camera.rotation.y -=
                dx * 0.006;


            camera.rotation.x -=
                dy * 0.004;


            camera.rotation.x =
                Math.max(
                    -1.3,
                    Math.min(
                        1.3,
                        camera.rotation.x
                    )
                );


            lastTouchX =
                touch.clientX;

            lastTouchY =
                touch.clientY;

        },
        { passive: true }
    );


    document
        .getElementById("flashlight")
        .addEventListener(
            "click",
            toggleFlashlight
        );


    document
        .getElementById("interact")
        .addEventListener(
            "click",
            interaction
        );

}


/* =========================
   FLASHLIGHT
========================= */

function toggleFlashlight() {

    flashlightOn =
        !flashlightOn;

    scene.traverse(
        function(object) {

            if (
                object instanceof
                THREE.PointLight
            ) {

                object.visible =
                    flashlightOn;

            }

        }
    );

}


/* =========================
   INTERACTION
========================= */

function interaction() {

    showMessage(
        "На стене висит старое медицинское табло.\n\n«ЭТАЖ 01 — ПРИЁМНОЕ ОТДЕЛЕНИЕ»"
    );

}


/* =========================
   MESSAGE
========================= */

function showMessage(text) {

    const message =
        document.getElementById(
            "message"
        );


    message.innerText = text;

    message.style.opacity = 1;


    setTimeout(
        function() {

            message.style.opacity = 0;

        },
        4000
    );

}


/* =========================
   GAME LOOP
========================= */

function animate() {

    requestAnimationFrame(
        animate
    );


    if (camera) {

        const direction =
            new THREE.Vector3();


        camera.getWorldDirection(
            direction
        );


        direction.y = 0;

        direction.normalize();


        const right =
            new THREE.Vector3(
                -direction.z,
                0,
                direction.x
            );


        camera.position.add(
            direction.multiplyScalar(
                -moveY * 0.045
            )
        );


        camera.position.add(
            right.multiplyScalar(
                moveX * 0.045
            )
        );


        camera.position.x =
            THREE.MathUtils.clamp(
                camera.position.x,
                -4.3,
                4.3
            );


        camera.position.z =
            THREE.MathUtils.clamp(
                camera.position.z,
                -13,
                6
            );

    }


    renderer.render(
        scene,
        camera
    );

}


/* =========================
   RESIZE
========================= */

function resize() {

    if (!camera || !renderer)
        return;


    camera.aspect =
        window.innerWidth /
        window.innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

}
