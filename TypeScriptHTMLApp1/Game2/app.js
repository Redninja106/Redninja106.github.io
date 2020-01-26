// --Global Variables--
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
var Inputs = [];
var dt;
var objs = [];
// --Function Definitions--
function GetKey(key) {
    return Inputs.indexOf(key) > -1;
}
function IfKey(key, ifPressed) {
    if (GetKey(key)) {
        ifPressed();
    }
}
// --Class Definitions--
var GameObject = /** @class */ (function () {
    function GameObject() {
        this.Position = createVector();
        this.Rotation = 0;
    }
    GameObject.prototype.MoveForward = function (dist) {
        this.Position.x += -sin(this.Rotation) * dist;
        this.Position.y += cos(this.Rotation) * dist;
    };
    GameObject.prototype.Rotate = function (angle) {
        this.Rotation += angle;
        this.Rotation %= TWO_PI;
    };
    GameObject.prototype.Draw = function () { };
    GameObject.prototype.Update = function () { };
    return GameObject;
}());
var Shell = /** @class */ (function (_super) {
    __extends(Shell, _super);
    function Shell(x, y, r, s) {
        var _this = _super.call(this) || this;
        _this.Position = createVector(x, y);
        _this.Rotation = r;
        _this.speed = s;
        console.log(x, y);
        console.log(_this.Position);
        return _this;
    }
    Shell.prototype.Draw = function () {
        push();
        translate(this.Position);
        rotate(this.Rotation);
        rect(2, -2, 4, 4);
        pop();
    };
    Shell.prototype.Update = function () {
        this.MoveForward(this.speed);
    };
    return Shell;
}(GameObject));
var Tank = /** @class */ (function (_super) {
    __extends(Tank, _super);
    function Tank(def) {
        var _this = _super.call(this) || this;
        _this.TurretRotation = 0;
        _this.def = def;
        return _this;
    }
    Tank.prototype.Update = function () {
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
    };
    Tank.prototype.Draw = function () {
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
    };
    Tank.prototype.RotateTurret = function (angle) {
        this.TurretRotation += angle;
        this.TurretRotation %= TWO_PI;
    };
    Tank.prototype.Fire = function () {
        objs.push(new Shell(this.Position.x, this.Position.y, this.Rotation, this.def.shellSpeed));
    };
    return Tank;
}(GameObject));
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
    text(frameRate().toFixed(0), 10, 10);
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
};
//# sourceMappingURL=app.js.map