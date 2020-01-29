var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// p5.js has the PI and TWO_PI constants, this is so that pi can be used before p5 is initialized
var DEGREES_180 = 3.14159265358979323826;
var DEGREES_360 = DEGREES_180 * 2;
var e = 2.71828182845904523536028747135266249775724709369995;
// ==Settings==
var BrakeSpeed = 60;
var MaxDeltaTime = 50; // in milliseconds.
var BloomDegrees = 3; // 360 is a random direction, 0 is perfectly straight.
var ShellLifetime = 10; // in seconds.
var standardTankDef = {
    color: {
        r: 255,
        g: 0,
        b: 0,
    },
    acceleration: 160,
    turnSpeed: DEGREES_360 / 6,
    turretTurnSpeed: DEGREES_360,
    shellSpeed: 10,
    turretLength: 25,
    turretOffset: 3,
    firerate: 240,
    maxSpeed: 80,
};
var Explosion = {
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
    RotaionVariance: DEGREES_360 * .1,
    MaxSpawnRadius: 0,
    MinSpawnRadius: 0,
    MinSpeed: 5,
    MaxSpeed: 100,
    MinSize: 1,
    MaxSize: 2.5,
    ColorChannels: 3,
    MoveParticle: function (p) {
        p.MoveForward(p.speed * dt);
    }
};
var Exhaust = {
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
    MoveParticle: function (p) {
        p.MoveForward(p.speed * dt);
    }
};
// ==Global Variables==
var MillisecondsInMinute = 60000;
var HalfBloomRadians = BloomDegrees * DEGREES_180 / 360;
var mX;
var mY;
var Inputs = [];
var dt;
var objs = [];
// ==Function Definitions==
function GetKey(key) {
    return Inputs.indexOf(key) > -1;
}
function Remove(array, object) {
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
// ==Class Definitions==
// --GameObjects--
var GameObject = /** @class */ (function () {
    function GameObject() {
        this.Position = createVector(0, 0, 0);
        this.Rotation = 0;
    }
    GameObject.prototype.MoveForward = function (dist) {
        this.Position.x += cos(this.Rotation) * dist;
        this.Position.y += sin(this.Rotation) * dist;
    };
    GameObject.prototype.Rotate = function (angle) {
        this.Rotation += angle;
        if (this.Rotation >= TWO_PI)
            this.Rotation %= TWO_PI;
        if (this.Rotation < 0)
            this.Rotation += TWO_PI;
        ;
    };
    GameObject.prototype.SetRotation = function (angle) {
        this.Rotation = angle;
        if (this.Rotation >= TWO_PI)
            this.Rotation %= TWO_PI;
        if (this.Rotation < 0)
            this.Rotation += TWO_PI;
        ;
    };
    GameObject.prototype.lookAtObject = function (object) {
        this.lookAt(object.Position.x, object.Position.y);
    };
    GameObject.prototype.lookAt = function (x, y) {
        this.Rotation = atan2(y - this.Position.y, x - this.Position.x);
    };
    GameObject.prototype.DistanceFrom = function (obj) {
        return this.Position.sub(obj.Position).mag();
    };
    GameObject.prototype.DistanceFromSq = function (obj) {
        return this.Position.sub(obj.Position).magSq();
    };
    GameObject.prototype.SetOrigin = function () {
        translate(this.Position);
        rotate(this.Rotation);
    };
    GameObject.prototype.HasCollider = function () {
        return this.Collider != undefined;
    };
    GameObject.prototype.Draw = function () { };
    GameObject.prototype.Update = function () { };
    GameObject.prototype.HandleCollision = function (other) { };
    return GameObject;
}());
var Shell = /** @class */ (function (_super) {
    __extends(Shell, _super);
    function Shell(x, y, r, s) {
        var _this = _super.call(this) || this;
        _this.Position = createVector(x, y);
        _this.Rotation = r;
        _this.speed = s;
        _this.age = 0;
        return _this;
    }
    Shell.prototype.Draw = function () {
        push();
        fill(255, 255, 0);
        this.SetOrigin();
        circle(2, 0, 4);
        rect(-2, -2, 4, 4);
        pop();
    };
    Shell.prototype.Update = function () {
        // don't move forward if just created, still need to be drawn at tank turret
        this.MoveForward(this.speed);
        if (this.age > ShellLifetime) {
            Remove(objs, this);
        }
        this.age += dt;
    };
    return Shell;
}(GameObject));
var Tank = /** @class */ (function (_super) {
    __extends(Tank, _super);
    function Tank(def) {
        var _this = _super.call(this) || this;
        _this.TurretRotation = 0;
        _this.LastFire = 0;
        _this.def = def;
        _this.Speed = 0;
        if (!(def.color instanceof p5.Color)) {
            def.color = color(def.color.r, def.color.g, def.color.b);
        }
        _this.exhaust = new ParticleSystem(createVector(0, 0), 0, Exhaust);
        return _this;
    }
    Tank.prototype.Update = function () {
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
    };
    /**
     * draws the tank
     */
    Tank.prototype.Draw = function () {
        push();
        fill(0);
        stroke(0);
        this.SetOrigin();
        rect(-13, -10, 26, 20);
        fill(this.def.color);
        rect(-17, 2, 4, 4);
        rect(-15, -8, 30, 16);
        DrawCollider(this.Collider);
        translate(3, 0);
        rotate(this.TurretRotation);
        rect(0, -2, this.def.turretLength, 4);
        circle(0, 0, 16);
        ResetTransform();
        this.SetOrigin();
        this.exhaust.Draw();
        pop();
    };
    Tank.prototype.HandleCollision = function () {
        this.def.color = color(100, 100, 100);
    };
    /**
     * rotates the tank's turret
     * @param angle how amount to rotate the tank's turret
     */
    Tank.prototype.RotateTurret = function (angle) {
        this.TurretRotation += angle;
        if (this.TurretRotation >= TWO_PI)
            this.TurretRotation %= TWO_PI;
        if (this.TurretRotation < 0)
            this.TurretRotation += TWO_PI;
    };
    /**
     * sets the rotation of the tank's turret
     * @param angle how amount to rotate the tank's turret
     */
    Tank.prototype.SetTurretRotation = function (angle) {
        this.TurretRotation = angle;
        if (this.TurretRotation >= TWO_PI)
            this.TurretRotation %= TWO_PI;
        if (this.TurretRotation < 0)
            this.TurretRotation += TWO_PI;
    };
    /**
     * points the turret of the tank at the specified coordinates.
     * @param x
     * @param y
     */
    Tank.prototype.LookTurretAt = function (x, y) {
        this.TurretRotation = atan2(y - this.Position.y, x - this.Position.x) - this.Rotation;
    };
    /**
     * calls the fire() function according to the firerate.
     */
    Tank.prototype.TryFire = function () {
        var timeBetweenShots = MillisecondsInMinute / this.def.firerate;
        var now = millis();
        if (this.LastFire + timeBetweenShots < now) {
            this.Fire();
            this.LastFire = now;
        }
    };
    /**
     * Adds a new shell to the global objects array, at the tanks position
     */
    Tank.prototype.Fire = function () {
        var ps = new ParticleSystem(this.GetTurretEndPoint(), this.Rotation + this.TurretRotation, Explosion);
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
    };
    Tank.prototype.Accelerate = function (amount) {
        this.Speed += amount;
    };
    Tank.prototype.Brake = function (amount) {
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
    };
    Tank.prototype.GetTurretEndPoint = function () {
        var result = this.Position.copy();
        result = result.add(p5.Vector.fromAngle(this.Rotation).mult(this.def.turretOffset));
        result = result.add(p5.Vector.fromAngle(this.Rotation + this.TurretRotation).mult(this.def.turretLength));
        return result;
    };
    Tank.prototype.GetExhaustPoint = function () {
        var result = this.Position.copy();
        result = result.add(p5.Vector.fromAngle(this.Rotation).mult(-19));
        result = result.add(p5.Vector.fromAngle(this.Rotation + HALF_PI).mult(4));
        return result;
    };
    Tank.prototype.BuildCollider = function () {
        var cornerLength = 10 * sqrt(13);
        var cornerAngle = atan2(20, 30);
        var collider = [];
        collider.push(this.Position.add(p5.Vector.fromAngle(cornerAngle).mult(cornerLength)));
        collider.push(this.Position.add(p5.Vector.fromAngle(HALF_PI - cornerAngle).mult(cornerLength)));
        collider.push(this.Position.add(p5.Vector.fromAngle((cornerAngle) + PI).mult(cornerLength)));
        collider.push(this.Position.add(p5.Vector.fromAngle((HALF_PI - cornerAngle) + PI).mult(cornerLength)));
        this.Collider = collider;
    };
    return Tank;
}(GameObject));
// --Particles--
var ParticleSystem = /** @class */ (function (_super) {
    __extends(ParticleSystem, _super);
    function ParticleSystem(pos, r, def) {
        var _this = _super.call(this) || this;
        _this.Position = pos;
        _this.Rotation = r;
        _this.def = def;
        _this.particles = [];
        for (var i = 0; i < def.ParticleCount; i++) {
            _this.particles.push(_this.CreateRandomParticle());
        }
        return _this;
    }
    ParticleSystem.prototype.Draw = function () {
        push();
        this.SetOrigin();
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].Draw();
        }
        pop();
    };
    ParticleSystem.prototype.Update = function () {
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
    };
    ParticleSystem.prototype.CreateRandomParticle = function () {
        var rotation = random(-this.def.RotaionVariance / 2, this.def.RotaionVariance / 2) + this.def.RotationOffset;
        var r = random(this.def.MinColor.r, this.def.MaxColor.r);
        var g = random(this.def.MinColor.g, this.def.MaxColor.g);
        var b = random(this.def.MinColor.b, this.def.MaxColor.b);
        var c;
        switch (this.def.ColorChannels) {
            case 3:
                c = color(r, g, b);
                break;
            case 1:
                c = color(r, r, r);
                break;
            default:
                console.error("ColorChannels is not set to 1 or 3");
                break;
        }
        var speed = random(this.def.MinSpeed, this.def.MaxSpeed);
        var l = random(this.def.MinLifetime, this.def.MaxLifetime);
        var scale = random(this.def.MinSize, this.def.MaxSize);
        return new Particle(this.Position.x, this.Position.y, rotation + this.Rotation, c, speed, l, scale);
    };
    return ParticleSystem;
}(GameObject));
var Particle = /** @class */ (function (_super) {
    __extends(Particle, _super);
    function Particle(x, y, r, color, speed, lifetime, scale) {
        var _this = _super.call(this) || this;
        _this.color = color;
        _this.speed = speed;
        _this.lifetime = lifetime;
        _this.scale = scale;
        _this.Position.x = x;
        _this.Position.y = y;
        _this.Rotation = r;
        _this.createdTime = millis() / 1000;
        return _this;
    }
    Particle.prototype.Draw = function () {
        push();
        fill(this.color);
        noStroke();
        ResetTransform();
        this.SetOrigin();
        //rotate(this.Rotation);
        rect(-this.scale / 2, -this.scale / 2, this.scale, this.scale);
        pop();
    };
    Particle.prototype.UpdateParticle = function (MoveParticle) {
        //this.Position.x += this.speed * dt; 
        MoveParticle(this);
    };
    return Particle;
}(GameObject));
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
    objs.sort(function (a, b) { return b.Position.z - a.Position.z; });
    console.log(objs);
    // draw all the objects
    for (var i = 0; i < objs.length; i++) {
        objs[i].Draw();
    }
    // reset transfrom and darw FPS in corner
    resetMatrix();
    text(frameRate().toFixed(0), 10, 10);
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
};
// ==Collsion functions==
function DrawCollider(poly) {
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
function CollidePolyPoly(poly1, poly2) {
    var next = 0;
    for (var current = 0; current < poly1.length; current++) {
        next = current + 1;
        if (next == poly1.length)
            next = 0;
        if (this.PolyLine(poly2, poly1[current], poly1[next]))
            return true;
    }
    return false;
}
function CollidePolyLine(poly, p1, p2) {
    var next = 0;
    for (var current = 0; current < poly.length; current++) {
        next = current + 1;
        if (next == poly.length)
            next = 0;
        if (this.LineLine(p1, p2, poly[current], poly[next]))
            return true;
    }
    return false;
}
function CollideLineLine(p1, p2, p3, p4) {
    var uA = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / ((p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y));
    var uB = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / ((p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y));
    return (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1);
}
//# sourceMappingURL=app.js.map