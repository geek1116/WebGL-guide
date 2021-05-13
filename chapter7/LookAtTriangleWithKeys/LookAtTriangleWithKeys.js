const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_ViewMatrix;
    varying vec4 v_Color;
    void main() {
        gl_Position = u_ViewMatrix * a_Position;
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

const u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix')
const viewMatrix = new Matrix4()
let g_eyeX = 0.25, g_eyeY = 0.25, g_eyeZ = 0.25

gl.clearColor(0, 0, 0, 1.0)
draw()

document.addEventListener('keydown', (ev) => {
    if(ev.keyCode == 39) {
        g_eyeX += 0.01
    } else if(ev.keyCode == 37) {
        g_eyeX -= 0.01
    } else {
        return
    }

    draw()
})

function draw() {
    viewMatrix.setLookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, 0, 0, 1, 0)
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements)

    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, n)
}

function initVertexBuffers() {
    const verticesColors = new Float32Array([
        0.0, 0.5, -0.4, 0, 1.0, 0.4,
        -0.5, -0.5, -0.4, 0, 1.0, 0.4,
        0.5, -0.5, -0.4, 1.0, 0.4, 0.4,
        
        0.5, 0.5, -0.2, 1.0, 0.4, 0.4,
        -0.5, 0.5, -0.2, 1.0, 1.0, 0.4,
        0.0, -0.5, -0.2, 1.0, 1.0, 0.4,

        0.0, 0.5, 0, 0.4, 0.4, 1.0,
        -0.5, -0.5, 0, 0.4, 0.4, 1.0,
        0.5, -0.5, 0, 1.0, 0.4, 0.4
    ]), n = 9

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