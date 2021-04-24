const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec2 a_TexCoord;
    varying vec2 v_TexCoord;
    void main() {
        gl_Position = a_Position;
        v_TexCoord = a_TexCoord;
    }
`

const FSHADER_SOURCE = `
    precision mediump float;
    uniform sampler2D u_Sampler;
    varying vec2 v_TexCoord;
    void main() {
        gl_FragColor = texture2D(u_Sampler, v_TexCoord);
    }
`

const canvas = document.querySelector('#canvas'),
    gl = canvas.getContext('webgl')

if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.error('Failed to initialize shaders!')
}
const n = initVertexBuffers()
if(n < 0) {
    console.error('Failed to set the vertex information!')
}

gl.clearColor(0.0, 0.0, 0.0, 1.0)

if(!initTextures()) {
    console.error('Failed to initialize the texture!')
}


function initVertexBuffers() {
    const verticesTexCoords = new Float32Array([
        -0.5, 0.5, 0.0, 1.0,
        -0.5, -0.5, 0.0, 0.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, -0.5, 1.0, 0.0
    ]), n = 4
    // const verticesTexCoords = new Float32Array([
    //     -0.5, 0.5, -0.3, 1.7,
    //     -0.5, -0.5, -0.3, -0.2,
    //     0.5, 0.5, 1.7, 1.7,
    //     0.5, -0.5, 1.7, -0.2
    // ]), n = 4

    const vertexTexCoordBuffer = gl.createBuffer()
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW)

    const FSIZE = verticesTexCoords.BYTES_PER_ELEMENT
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0)
    gl.enableVertexAttribArray(a_Position)

    const a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord')
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2)
    gl.enableVertexAttribArray(a_TexCoord)

    return n
}

function initTextures() {
    const texture = gl.createTexture()
    const u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler')
    const image = new Image()

    image.onload = loadTexture
    image.src = './sky.jpg'

    return true

    function loadTexture() {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)   // 进行Y轴反转
        gl.activeTexture(gl.TEXTURE0)   // 激活0号纹理单元
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
        gl.uniform1i(u_Sampler, 0)

        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, n)
    }
}