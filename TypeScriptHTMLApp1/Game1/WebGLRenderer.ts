var vertShaderSource = document.getElementById('vsSource').textContent;
var fragShaderSource = document.getElementById('fsSource').textContent;

window.onload = function () {
    var renderer = new WebGLRenderer('canvas');

    
}

class WebGLRenderer {
    Canvas: HTMLCanvasElement;
    gl: WebGLRenderingContext;

    vert: WebGLShader;
    frag: WebGLShader;

    Program: WebGLProgram;

    vertexBuffer: WebGLBuffer;

    constructor(canvasid: string) {
        this.Canvas = document.getElementById('GameCanvas') as HTMLCanvasElement;
        this.gl = this.Canvas.getContext('webgl');

        this.gl.clearColor(1, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        if (!this.gl) {
            this.Error("webgl is not supported!");
        }

        this.LoadShaders();
    }

    private LoadShaders() {
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
    }

    private LoadBuffers() {
        this.vertexBuffer = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);

        var verts: number[] = [
            0, 0.5,
            0.5, 0,
            0, -0.5
        ];

        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(verts), this.gl.STATIC_DRAW);
    }

    public ResizeIfNeeded() {
        
        this.Canvas.width = this.gl.canvas.width;
        this.Canvas.height = this.gl.canvas.height;
    }

    public Error(message? : string | Object) : void {
        if (message === Object) {
            console.error("ERROR WITH " + message.toString());
        } else {
            console.error(message);
        }
    }
}

