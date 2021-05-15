const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_viewMatrix;
    uniform mat4 u_ProjMatrix;
    varying vec4 v_Color;
    void main() {
        gl_Position = u_ProjMatrix * u_viewMatrix * a_Position;
        v_Color = a_Color;
    }
`
const FSHADER_SOURCE = `
    precision mediump float;
    varying vec4 v_Color;
    void main() {
        gl_FragColor = v_Color;
    }
`
const canvas = document.querySelector('#canvas'),
    gl = canvas.getContext('webgl')

initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)

const n = initVertexBuffers()   // 设置顶点坐标和颜色
if(n < 0) {
    alert('initial vertex fail')
}

const u_viewMatrix = gl.getUniformLocation(gl.program, 'u_viewMatrix')
const u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix')
const viewMatrix = new Matrix4()
const projMatrix = new Matrix4()
viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0)
projMatrix.setPerspective(30, 1, 1, 100)
gl.uniformMatrix4fv(u_viewMatrix, false, viewMatrix.elements)
gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements)

gl.clearColor(0, 0, 0, 1.0)
gl.clear(gl.COLOR_BUFFER_BIT)
gl.drawArrays(gl.TRIANGLES, 0, n)

function initVertexBuffers() {
    const verticesColors = new Float32Array([
    0.75,  1.0,  -4.0,  0.4,  1.0,  0.4,
    0.25, -1.0,  -4.0,  0.4,  1.0,  0.4,
    1.25, -1.0,  -4.0,  1.0,  0.4,  0.4, 
    0.75,  1.0,  -2.0,  1.0,  1.0,  0.4,
    0.25, -1.0,  -2.0,  1.0,  1.0,  0.4,
    1.25, -1.0,  -2.0,  1.0,  0.4,  0.4, 
    0.75,  1.0,   -1.0,  0.4,  0.4,  1.0, 
    0.25, -1.0,   -1.0,  0.4,  0.4,  1.0,
    1.25, -1.0,   -1.0,  1.0,  0.4,  0.4, 
   -0.75,  1.0,  -4.0,  0.4,  1.0,  0.4,
   -1.25, -1.0,  -4.0,  0.4,  1.0,  0.4,
   -0.25, -1.0,  -4.0,  1.0,  0.4,  0.4, 
   -0.75,  1.0,  -2.0,  1.0,  1.0,  0.4,
   -1.25, -1.0,  -2.0,  1.0,  1.0,  0.4,
   -0.25, -1.0,  -2.0,  1.0,  0.4,  0.4, 
   -0.75,  1.0,   -1.0,  0.4,  0.4,  1.0,
   -1.25, -1.0,   -1.0,  0.4,  0.4,  1.0,
   -0.25, -1.0,   -1.0,  1.0,  0.4,  0.4, 
    ]), n = 18

    const vertexColorbuffer = gl.createBuffer()

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer)
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW)

    const FSIZE = verticesColors.BYTES_PER_ELEMENT

    const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0)
    gl.enableVertexAttribArray(a_Position)

    const a_Color = gl.getAttribLocation(gl.program, 'a_Color')
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)
    gl.enableVertexAttribArray(a_Color)

    return n
}