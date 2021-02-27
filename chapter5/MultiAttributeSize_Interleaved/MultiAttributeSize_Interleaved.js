const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute float a_PointSize;
    void main() {
        gl_Position = a_Position;
        gl_PointSize = a_PointSize;
    }
`
const FSHADER_SOURCE = `
    void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
`

const canvas = document.querySelector('#canvas'),
    gl = canvas.getContext('webgl')

initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)

const n = initVertexBuffers()
if(n < 0) {
    alert('initial vertex fail')
}

gl.clearColor(0, 0, 0, 1.0)
gl.clear(gl.COLOR_BUFFER_BIT)
gl.drawArrays(gl.POINTS, 0, n)

function initVertexBuffers() {
    const verticesSize = new Float32Array([
        0.0, 0.5, 10.0,
        -0.5, -0.5, 20.0,
        0.5, -0.5, 30.0
    ]), n = 3

    const vertexSizeBuffer = gl.createBuffer()

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, verticesSize, gl.STATIC_DRAW)

    const FSIZE = verticesSize.BYTES_PER_ELEMENT

    const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 3, 0)
    gl.enableVertexAttribArray(a_Position)

    const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize')
    gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 3, FSIZE * 2)
    gl.enableVertexAttribArray(a_PointSize)

    return n
}