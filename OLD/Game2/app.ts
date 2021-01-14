// p5.js has the PI and TWO_PI constants, this is so that pi can be used before p5 is initialized
const DEGREES_180: number = 3.14159265358979323826;
const DEGREES_360: number = DEGREES_180 * 2;

const e: number = 2.71828182845904523536028747135266249775724709369995;

// ==Settings==

const BrakeSpeed = 60;
const MaxDeltaTime = 50; // in milliseconds.
const BloomDegrees = 3; // 360 is a random direction, 0 is perfectly straight.
const ShellLifetime = 10; // in seconds.

const standardTankDef: ITankDefinition = {
    color: {
        r: 255,
        g: 0,
        b: 0,
    },
    acceleration: 160,
    turnSpeed: DEGREES_360/6,
    turretTurnSpeed: DEGREES_360,
    shellSpeed: 10,
    turretLength: 25,
    turretOffset: 3,
    firerate: 240,
    maxSpeed: 80,
}

const Explosion: IParticleSystemDefinition = {
    Impulse: true,
    MinLifetime: .1,
    MaxLifetime: .4,
    ParticleCount: 50,
    MaxColor: {
        r: 255,
        g: 255,
        b: 0,
    },
    MinColor: {
        r: 255,
        g: 0,
        b: 0,
    },
    RotationOffset: 0,
    RotaionVariance:DEGREES_360 * .1,
    MaxSpawnRadius: 0,
    MinSpawnRadius: 0,
    MinSpeed: 5,
    MaxSpeed: 100,
    MinSize: 1,
    MaxSize: 2.5,
    ColorChannels: 3,
    MoveParticle: function(p: Particle): void {
        p.MoveForward(p.speed * dt);
    }
}

const Exhaust: IParticleSystemDefinition = {
    Impulse: false,
    MaxColor: {
        r: 175,
        g: 0,
        b: 0,
    },
    MinColor: {
        r: 50,
        g: 0,
        b: 0
    },
    ColorChannels: 1,
    MaxLifetime: .5,
    MinLifetime: .1,
    MaxSize: 4,
    MinSize: 1,
    MaxSpawnRadius: 0,
    MinSpawnRadius: 0,
    MaxSpeed: 100,
    MinSpeed: 20,
    ParticleCount: 50,
    RotaionVariance: DEGREES_360 * 0.05,
    RotationOffset: DEGREES_180,
    MoveParticle: function(p: Particle): void {
        p.MoveForward(p.speed * dt);
    }
}
// ==Global Variables==

const MillisecondsInMinute = 60_000;
const HalfBloomRadians = BloomDegrees * DEGREES_180 / 360;

let mX: number;
let mY: number;

let Inputs: Array<string> = [];
let dt: number;
let objs: Array<GameObject> = [];

// ==Function Definitions==

function GetKey(key: string): boolean {
    return Inputs.indexOf(key) > -1;
}

function Remove<T>(array: Array<T>, object: T): void {
    var index = array.indexOf(object);

    if (index > -1) {
        array.splice(index, 1);
    }
}

function ResetTransform() {
    resetMatrix();
    translate(width / 2, height / 2);
    scale(3.0);
}

// ==Interface Definitions==

interface IColor {
    r: number;
    g: number;
    b: number;
}

interface ITankDefinition {
    color: p5.Color | IColor;
    acceleration: number; // in pixels per second squared
    turnSpeed: number; // in radians per second
    turretTurnSpeed: number; // in radians per second
    shellSpeed: number; // in pixels per second
    turretLength: number; // in pixels
    turretOffset: number; // in pixels
    firerate: number; // in rounds per minute
    maxSpeed: number; // in pixels per second
}

interface IPositionChange {
    X: number;
    Y: number;
    R: number;
    S: number;
}

interface IParticleSystemDefinition {
    Impulse: boolean;
    MinLifetime: number;
    MaxLifetime: number;
    ParticleCount: number;
    MoveParticle: Function;
    MinColor: IColor;
    MaxColor: IColor;
    RotationOffset: number;
    RotaionVariance: number;
    MinSpawnRadius: number;
    MaxSpawnRadius: number;
    MinSpeed: number;
    MaxSpeed: number;
    MinSize: number;
    MaxSize: number;
    ColorChannels: number; // 1 (single grayscale color value) or 3 (RGB color value)
}

// ==Class Definitions==

// --GameObjects--

class GameObject {
    Position: p5.Vector;
    Rotation: number;
    Collider: Array<p5.Vector>;

    constructor() {
        this.Position = createVector(0,0,0);
        this.Rotation = 0;
    }

    MoveForward(dist: number): void {
        this.Position.x += cos(this.Rotation) * dist;
        this.Position.y += sin(this.Rotation) * dist;
    }

    Rotate(angle: number): void {
        this.Rotation += angle;
        if (this.Rotation >= TWO_PI)
            this.Rotation %= TWO_PI;
        if (this.Rotation < 0)
            this.Rotation += TWO_PI;;
    }

    SetRotation(angle: number): void {
        this.Rotation = angle;
        if (this.Rotation >= TWO_PI)
            this.Rotation %= TWO_PI;
        if (this.Rotation < 0)
            this.Rotation += TWO_PI;;
    }

    lookAtObject(object: GameObject): void {
        this.lookAt(object.Position.x, object.Position.y);
    }

    lookAt(x: number, y: number): void {
        this.Rotation = atan2(y - this.Position.y, x - this.Position.x);
    }

    DistanceFrom(obj: GameObject): number {
        return this.Position.sub(obj.Position).mag();
    }

    DistanceFromSq(obj: GameObject): number {
        return this.Position.sub(obj.Position).magSq();
    }

    SetOrigin() {
        translate(this.Position);
        rotate(this.Rotation);
    }

    HasCollider(): boolean {
        return this.Collider != undefined;
    }

    Draw(): void { }

    Update(): void { }

    HandleCollision(other: GameObject) { }
}

class Shell extends GameObject {
    speed: number;
    age: number;
    
    constructor(x, y, r, s) {
        super();
        this.Position = createVector(x, y);
        this.Rotation = r;
        this.speed = s;
        this.age = 0;
    }

    Draw(): void {
        push();

        fill(255, 255, 0);

        this.SetOrigin();

        circle(2, 0, 4)
        rect(-2, -2, 4, 4);

        pop();
    }

    Update(): void {
        // don't move forward if just created, still need to be drawn at tank turret
        this.MoveForward(this.speed);
        

        if (this.age > ShellLifetime) {
            Remove(objs, this);
        }

        this.age += dt;
    }
}

class Tank extends GameObject {
    def: ITankDefinition;

    exhaust: ParticleSystem;
    
    Speed: number;
    TurretRotation: number;
    LastFire: number;

    constructor(def: ITankDefinition) {
        super();
        this.TurretRotation = 0;
        this.LastFire = 0;
        this.def = def;
        this.Speed = 0;

        if (!(def.color instanceof p5.Color)) {
            def.color = color(def.color.r, def.color.g, def.color.b);
        }

        this.exhaust = new ParticleSystem(createVector(0,0), 0, Exhaust);
    }
    
    Update(): void {
        var exhaustIntensity = 5;

        // handle inputs
        if (GetKey('w')) {
            // forward
            this.Accelerate(this.def.acceleration * dt);

            exhaustIntensity = 25;
        }
        if (GetKey('a')) {
            // left
            this.Rotate(-this.def.turnSpeed * dt);
        }
        if (GetKey('s')) {
            // back
            this.Accelerate(-this.def.acceleration * dt);

            exhaustIntensity = 25;
        }
        if (GetKey('d')) {
            // right
            this.Rotate(this.def.turnSpeed * dt);
        }
        // if not accelerating in either direction
        if (!GetKey('w') && !GetKey('s')) {
            // brakes
            this.Brake(BrakeSpeed * dt);
        }

        // limit the speed so it doesn't get to high.
        if (this.Speed > this.def.maxSpeed) {
            this.Speed = this.def.maxSpeed;
        }
        if (this.Speed < -this.def.maxSpeed) {
            this.Speed = -this.def.maxSpeed;
        }

        // move forward/back using the current speed.
        this.MoveForward(this.Speed * dt);

        this.BuildCollider();

        // turn turret towards the mouse
        this.LookTurretAt(mX, mY);

        this.exhaust.Position = this.GetExhaustPoint();
        this.exhaust.Rotation = this.Rotation;
        this.exhaust.def.ParticleCount = exhaustIntensity;
        this.exhaust.def.RotaionVariance = PI * (exhaustIntensity / 100);

        this.exhaust.Update();
        
        if (GetKey(' ')) {
            // fire
            this.TryFire();
        }
    }

    /**
     * draws the tank 
     */
    Draw(): void {
        push();

        fill(0);
        stroke(0);

        this.SetOrigin();

        rect(-13, -10, 26, 20);

        fill(this.def.color);

        rect(-17,2,4,4);

        rect(-15, -8, 30, 16);

        DrawCollider(this.Collider);

        translate(3, 0);
        rotate(this.TurretRotation);

        rect(0, -2, this.def.turretLength, 4);
        circle(0, 0, 16);

        ResetTransform();
        this.SetOrigin();

        this.exhaust.Draw()

        pop();
    }

    HandleCollision() {
        this.def.color = color(100, 100, 100);
    }

    /**
     * rotates the tank's turret
     * @param angle how amount to rotate the tank's turret
     */
    RotateTurret(angle: number): void {
        this.TurretRotation += angle;
        if (this.TurretRotation >= TWO_PI)
            this.TurretRotation %= TWO_PI;
        if (this.TurretRotation < 0)
            this.TurretRotation += TWO_PI;
    }

    /**
     * sets the rotation of the tank's turret
     * @param angle how amount to rotate the tank's turret
     */
    SetTurretRotation(angle: number): void {
        this.TurretRotation = angle;
        if (this.TurretRotation >= TWO_PI)
            this.TurretRotation %= TWO_PI;
        if (this.TurretRotation < 0)
            this.TurretRotation += TWO_PI;
    }

    /**
     * points the turret of the tank at the specified coordinates.
     * @param x
     * @param y
     */
    LookTurretAt(x: number, y: number): void {
        this.TurretRotation = atan2(y - this.Position.y, x - this.Position.x) - this.Rotation;
    }

    /**
     * calls the fire() function according to the firerate.
     */
    TryFire(): void{
        var timeBetweenShots = MillisecondsInMinute / this.def.firerate ;

        var now = millis();

        if (this.LastFire + timeBetweenShots < now) {
            this.Fire();

            this.LastFire = now;
        }
    }

    /**
     * Adds a new shell to the global objects array, at the tanks position
     */
    Fire(): void {
        var ps: ParticleSystem = new ParticleSystem(this.GetTurretEndPoint(), this.Rotation + this.TurretRotation, Explosion);

        objs.push(ps);

        // calculate bloom.
        var bloom = random(-HalfBloomRadians, HalfBloomRadians);

        // craete a new shell.
        var shell = new Shell(this.Position.x, this.Position.y, this.Rotation, this.def.shellSpeed);

        // move the shell to the center of the turret.
        shell.MoveForward(this.def.turretOffset);

        // move the shell to the end of the turret.
        shell.Rotate(this.TurretRotation);
        shell.MoveForward(this.def.turretLength);

        // rotate to apply bloom.
        shell.Rotate(bloom);

        // add the shell to the objects array.
        objs.push(shell);
    }

    Accelerate(amount: number): void {
        this.Speed += amount;
    }

    Brake(amount: number): void {
        if (abs(this.Speed) < amount) {
            this.Speed = 0;
            return;
        }

        if (this.Speed > 0) {
            this.Speed -= amount;
            return;
        }

        if (this.Speed < 0) {
            this.Speed += amount;
            return;
        }
    }

    GetTurretEndPoint(): p5.Vector {
        var result: p5.Vector = this.Position.copy();
        result = result.add(p5.Vector.fromAngle(this.Rotation).mult(this.def.turretOffset));
        result = result.add(p5.Vector.fromAngle(this.Rotation + this.TurretRotation).mult(this.def.turretLength));
        return result;
    }

    GetExhaustPoint(): p5.Vector {
        var result: p5.Vector = this.Position.copy();
        result = result.add(p5.Vector.fromAngle(this.Rotation).mult(-19));
        result = result.add(p5.Vector.fromAngle(this.Rotation + HALF_PI).mult(4));
        return result;
    }

    BuildCollider(): void {
        const cornerLength = 10 * sqrt(13);
        const cornerAngle = atan2(20, 30);

        var collider: Array<p5.Vector> = [];
        collider.push(this.Position.add(p5.Vector.fromAngle(cornerAngle).mult(cornerLength)));
        collider.push(this.Position.add(p5.Vector.fromAngle(HALF_PI - cornerAngle).mult(cornerLength)));
        collider.push(this.Position.add(p5.Vector.fromAngle((cornerAngle) + PI).mult(cornerLength)));
        collider.push(this.Position.add(p5.Vector.fromAngle((HALF_PI - cornerAngle) + PI).mult(cornerLength)));
        this.Collider = collider;
    }
}

// --Particles--

class ParticleSystem extends GameObject {
    particles: Particle[];
    def: IParticleSystemDefinition;

    constructor(pos: p5.Vector, r: number, def: IParticleSystemDefinition) {
        super();

        this.Position = pos;
        this.Rotation = r;

        this.def = def;

        this.particles = [];

        for (var i = 0; i < def.ParticleCount; i++) {
            this.particles.push(this.CreateRandomParticle());
        }
    }

    Draw() {
        push();
        
        this.SetOrigin();
        
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].Draw();
        }

        pop();
    }

    Update() {
        //while (this.particles.length > this.def.ParticleCount) {
        //    this.particles.pop();
        //}

        if (this.particles.length === 0) {
            Remove(objs, this);
        }
        
        for (var i = 0; i < this.particles.length; i++) {
            var p = this.particles[i];

            if (millis() / 1000 > p.createdTime + p.lifetime) {
                Remove(this.particles, p);    
            }

            if (p != undefined) {
                p.UpdateParticle(this.def.MoveParticle);
            }
        }

        if (!this.def.Impulse) {
            while (this.particles.length < this.def.ParticleCount) {
                this.particles.push(this.CreateRandomParticle());
            }
        }
    }

    CreateRandomParticle() {
        var rotation = random(-this.def.RotaionVariance / 2, this.def.RotaionVariance / 2) + this.def.RotationOffset;

        var r: number = random(this.def.MinColor.r, this.def.MaxColor.r);
        var g: number = random(this.def.MinColor.g, this.def.MaxColor.g);
        var b: number = random(this.def.MinColor.b, this.def.MaxColor.b);

        var c;

        switch (this.def.ColorChannels) {
            case 3:
                c = color(r, g, b);
                break;
            case 1:
                c = color(r, r, r);
                break;
            default:
                console.error("ColorChannels is not set to 1 or 3")
                break;
        }

        var speed = random(this.def.MinSpeed, this.def.MaxSpeed);

        var l = random(this.def.MinLifetime, this.def.MaxLifetime);

        var scale = random(this.def.MinSize, this.def.MaxSize);

        return new Particle(this.Position.x, this.Position.y, rotation + this.Rotation, c, speed, l, scale);
    }
}

class Particle extends GameObject {
    createdTime: number;
    
    constructor(x: number, y: number, r: number, public color: p5.Color, public speed: number, public lifetime: number, public scale: number) {
        super();
        this.Position.x = x;
        this.Position.y = y;

        this.Rotation = r;

        this.createdTime = millis() / 1000;
    }

    Draw() {
        push();

        fill(this.color);
        noStroke();

        ResetTransform();
        this.SetOrigin();
        //rotate(this.Rotation);

        rect(-this.scale / 2, -this.scale / 2, this.scale, this.scale);

        pop();
    }

    UpdateParticle(MoveParticle: Function) {
        //this.Position.x += this.speed * dt; 
        
        MoveParticle(this);
    }
}

// ==p5.js Functions==

function setup() {
    // try to render as fast as possible
    frameRate(1000);

    // create the canvas
    createCanvas(innerWidth, innerHeight);

    // create the tank
    objs.push(new Tank(standardTankDef));
}

function draw() {
    // set the global deltatime
    dt = deltaTime / 1000;

    // constrain the deltatime to a max value, in case of stops such as breakpoints.
    if (dt > MaxDeltaTime) {
        dt = MaxDeltaTime;
    }

    mX = mouseX - windowWidth / 2;
    mY = mouseY - windowHeight / 2;

    // update all objects
    for (var i = 0; i < objs.length; i++) {
        objs[i].Update();
    }

    // Handle Collisions
    for (var index1 = 0; index1 < objs.length; index1++) {
        for (var index2 = 0; index2 < objs.length; index2++) {
            if (index1 == index2) {
                continue;
            }

            var obj1 = objs[index1];
            var obj2 = objs[index2];

            if (obj1.HasCollider() && obj2.HasCollider()) {
                
                if (CollidePolyPoly(obj1.Collider, obj2.Collider)) {
                    objs[index1].HandleCollision(objs[index2]);
                }
            }
        }
    }

    // clear the screen
    background(color(110));

    // move the origin to the center of the screen
    ResetTransform();

    objs.sort((a, b): number => { return b.Position.z - a.Position.z });
    console.log(objs);
    // draw all the objects
    for (var i = 0; i < objs.length; i++) {
        objs[i].Draw();
    }

    // reset transfrom and darw FPS in corner
    resetMatrix();
    text(frameRate().toFixed(0), 10, 10,);
}

function keyPressed() {
    // if the inputs array doesn't have the pressed key, add it.
    if (Inputs.indexOf(key) == -1) {
        Inputs.push(key);
    }
    return false;
}

function keyReleased() {
    // if the inputs array has the released key, remove it. 
    if (Inputs.indexOf(key) != -1) {
        Inputs.splice(Inputs.indexOf(key), 1);
    }
    return false;
}

// ==Other==

window.onresize = function () {
    // resize the canvas if the window size is changed.
    resizeCanvas(innerWidth, innerHeight);
}

// ==Collsion functions==
function DrawCollider(poly: Array<p5.Vector>) {
    push();
    ResetTransform();

    noFill();

    beginShape();

    for (var i = 0; i < poly.length; i++) {
        vertex(poly[i].x, poly[i].y);
    }

    endShape(CLOSE);
    pop();
}

function CollidePolyPoly(poly1: Array<p5.Vector>, poly2: Array<p5.Vector>) {
    var next: number = 0;
    for (var current = 0; current < poly1.length; current++) {

        next = current + 1;
        if (next == poly1.length)
            next = 0;

        if (this.PolyLine(poly2, poly1[current], poly1[next]))
            return true;
    }

    return false;
}

function CollidePolyLine(poly: Array<p5.Vector>, p1: p5.Vector, p2: p5.Vector) : boolean {
    var next: number = 0;
    for (var current = 0; current < poly.length; current++) {

        next = current + 1;
        if (next == poly.length)
            next = 0;

        if (this.LineLine(p1, p2, poly[current], poly[next]))
            return true;
    }

    return false;
}

function CollideLineLine(p1:p5.Vector, p2: p5.Vector, p3: p5.Vector, p4: p5.Vector): boolean {
    var uA = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / ((p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y));
    var uB = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / ((p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y));

    return (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1);
}
