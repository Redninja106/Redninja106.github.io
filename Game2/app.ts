// --Global Variables--

let Inputs: Array<string> = [];
let dt: number;
let objs: Array<GameObject> = [];

// --Function Definitions--

function GetKey(key: string): boolean {
    return Inputs.indexOf(key) > -1;
}

function IfKey(key: string, ifPressed: Function): void {
    if (GetKey(key)) {
        ifPressed();
    }
}

// --Interface Definitions--

interface TankDefinition {
    color: p5.Color;
    speed: number;
    turnSpeed: number;
    turretTurnSpeed: number;
    shellSpeed: number;
}

// --Class Definitions--

class GameObject {
    Position: p5.Vector;
    Rotation: number;

    constructor() {
        this.Position = createVector();
        this.Rotation = 0;
    }

    MoveForward(dist: number) {
        this.Position.x += -sin(this.Rotation) * dist;
        this.Position.y +=  cos(this.Rotation) * dist;
    }

    Rotate(angle: number) {
        this.Rotation += angle;
        this.Rotation %= TWO_PI;
    }

    Draw() { }

    Update() { }
}

class Shell extends GameObject {
    speed: number;

    constructor(x, y, r, s) {
        super();
        this.Position = createVector(x, y);
        this.Rotation = r;
        this.speed = s;
        console.log(x, y);
        console.log(this.Position);
    }

    Draw() {
        push();

        translate(this.Position);
        rotate(this.Rotation);

        rect(2, -2, 4, 4);

        pop();
    }

    Update() {
        this.MoveForward(this.speed);
    }
}

class Tank extends GameObject {
    def: TankDefinition;

    TurretRotation: number;
    
    constructor(def) {
        super();
        this.TurretRotation = 0;
        this.def = def;
    }

    Update() {
        if (GetKey('w')) {
            this.MoveForward(this.def.speed * dt);
        }
        if (GetKey('a')) {
            this.Rotate(-this.def.turnSpeed * dt);
        }
        if (GetKey('s')) {
            this.MoveForward(-this.def.speed * dt);
        }
        if (GetKey('d')) {
            this.Rotate(this.def.turnSpeed * dt);
        }
        if (GetKey('q')) {
            this.RotateTurret(-this.def.turnSpeed * dt);
        }
        if (GetKey('e')) {
            this.RotateTurret(this.def.turnSpeed * dt);
        }
        if (GetKey(' ')) {
            this.Fire();
        }
    }

    Draw() {
        fill(0);
        stroke(0);

        push();

        translate(this.Position);
        rotate(this.Rotation);

        rect(-10, -13, 20, 26);

        fill(this.def.color);

        rect(-8, -15, 16, 30);

        translate(0, 3);
        rotate(this.TurretRotation);

        rect(-2, 0, 4, 25);
        circle(0, 0, 16);

        pop();
    }

    RotateTurret(angle: number) {
        this.TurretRotation += angle;
        this.TurretRotation %= TWO_PI;
    }

    Fire() {
        objs.push(new Shell(this.Position.x, this.Position.y, this.Rotation, this.def.shellSpeed));
    }
}

// --p5.js Functions--

function setup() {
    frameRate(144);
    createCanvas(innerWidth, innerHeight);
    objs.push(new Tank({
        color: color(255, 0, 0),
        speed: 100,
        turnSpeed: TWO_PI,
        turretTurnSpeed: TWO_PI,
    }));
}

function draw() {
    dt = deltaTime / 1000;

    for (var i = 0; i < objs.length; i++) {
        objs[i].Update();
    }

    background(color(110));
    //rect(1, 1, windowWidth-1, windowHeight-1);

    translate(windowWidth / 2, windowHeight / 2);
    
    for (var i = 0; i < objs.length; i++) {
        objs[i].Draw();
    }
    
    resetMatrix();

    text(frameRate().toFixed(0), 10, 10,);
}

function keyPressed() {
    if (Inputs.indexOf(key) == -1) {
        Inputs.push(key);
    }
}

function keyReleased() {
    if (Inputs.indexOf(key) != -1) {
        Inputs.splice(Inputs.indexOf(key), 1);
    }
}

// --Other--

window.onresize = function () {
    resizeCanvas(innerWidth, innerHeight);
}