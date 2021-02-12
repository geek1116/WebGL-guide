const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    void main() {
        gl_Position = a_Position;
        gl_PointSize = 10.0;
    }
    `,
    FSHADER_SOURCE = `
        void main() {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
    `

const canvas = document.querySelector('#canvas'),
    gl = canvas.getContext('webgl')

initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)

const n = initVertexBuffers()
if(n < 0) {
    alert('Failed to set the positions of the vertices')
}

gl.clearColor(0, 0, 0, 1.0)
gl.clear(gl.COLOR_BUFFER_BIT)

gl.drawArrays(gl.POINTS, 0, n)


function initVertexBuffers() {
    const vertices = new Float32Array([
        0.0, 0.5, -0.5, -0.5, 0.5, -0.5
    ]), num = 3

    // 创建缓冲区
    const vertexBuffer = gl.createBuffer()

    // 将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

    // 向缓冲区对象中写入数据
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const a_Position = gl.getAttribLocation(gl.program, 'a_Position')

    // 将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)

    // 连接a_Position变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position)

    return num
}