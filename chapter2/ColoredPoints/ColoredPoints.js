const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    void main() {
        gl_Position = a_Position;
        gl_PointSize = 10.0;
    }
    `,
    FSHADER_SOURCE = `
        precision mediump float;
        uniform vec4 u_FragColor;
        void main() {
            gl_FragColor = u_FragColor;
        }
    `

const canvas = document.querySelector('#canvas'),
    gl = canvas.getContext('webgl')

initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)

gl.clearColor(0, 0, 0, 1.0)
gl.clear(gl.COLOR_BUFFER_BIT)

const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
const g_points = []
const u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor')
const g_colors = []

canvas.addEventListener('mousedown', ev => {
    let x = ev.clientX, y = ev.clientY
    const rect = ev.target.getBoundingClientRect()

    x = (x - rect.left - canvas.width / 2) / (canvas.width / 2)
    y = (canvas.height / 2 - y + rect.top ) / (canvas.height / 2)

    g_points.push({ x, y })

    if(x >= 0.0 && y >= 0.0) {
        g_colors.push([1.0, 0.0, 0.0, 1.0])
    } else if(x < 0.0 && y < 0.0) {
        g_colors.push([0.0, 1.0, 0.0, 1.0])
    } else {
        g_colors.push([1.0, 1.0, 1.0, 1.0])
    }

    gl.clear(gl.COLOR_BUFFER_BIT)

    for(let i = 0; i < g_points.length; ++i) {
        gl.vertexAttrib3f(a_Position, g_points[i].x, g_points[i].y, 0.0)
        
        const rgba = g_colors[i]
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3])

        gl.drawArrays(gl.POINTS, 0, 1)
    }
})