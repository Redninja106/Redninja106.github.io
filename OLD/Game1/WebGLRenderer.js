var vertShaderSource = document.getElementById('vsSource').textContent;
var fragShaderSource = document.getElementById('fsSource').textContent;
window.onload = function () {
    var renderer = new WebGLRenderer('canvas');
};
var WebGLRenderer = /** @class */ (function () {
    function WebGLRenderer(canvasid) {
        this.Canvas = document.getElementById('GameCanvas');
        this.gl = this.Canvas.getContext('webgl');
        this.gl.clearColor(1, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        if (!this.gl) {
            this.Error("webgl is not supported!");
        }
        this.LoadShaders();
    }
    WebGLRenderer.prototype.LoadShaders = function () {
        //create the shaders
        this.vert = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.frag = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        // set shader source code
        this.gl.shaderSource(this.vert, vertShaderSource);
        this.gl.shaderSource(this.frag, fragShaderSource);
        // compile the shaders
        this.gl.compileShader(this.vert);
        this.gl.compileShader(this.frag);
        // confirm that the vertex shader loaded properly
        if (!this.gl.getShaderParameter(this.vert, this.gl.COMPILE_STATUS)) {
            this.gl.deleteShader(this.vert);
            this.Error(this.vert);
            return;
        }
        // confirm that the fragment shader loaded properly
        if (!this.gl.getShaderParameter(this.frag, this.gl.COMPILE_STATUS)) {
            this.gl.deleteShader(this.frag);
            this.Error(this.frag);
            return;
        }
        // create the program
        this.Program = this.gl.createProgram();
        // attach the shaders to the program
        this.gl.attachShader(this.Program, this.vert);
        this.gl.attachShader(this.Program, this.frag);
        // use the program
        this.gl.useProgram(this.Program);
    };
    WebGLRenderer.prototype.LoadBuffers = function () {
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        var verts = [
            0, 0.5,
            0.5, 0,
            0, -0.5
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(verts), this.gl.STATIC_DRAW);
    };
    WebGLRenderer.prototype.ResizeIfNeeded = function () {
        this.Canvas.width = this.gl.canvas.width;
        this.Canvas.height = this.gl.canvas.height;
    };
    WebGLRenderer.prototype.Error = function (message) {
        if (message === Object) {
            console.error("ERROR WITH " + message.toString());
        }
        else {
            console.error(message);
        }
    };
    return WebGLRenderer;
}());
//# sourceMappingURL=WebGLRenderer.js.map