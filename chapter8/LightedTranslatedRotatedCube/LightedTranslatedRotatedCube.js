const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    attribute vec4 a_Normal;
    uniform mat4 u_MvpMatrix;
    uniform mat4 u_NormalMatrix;    // 用来变换法向量的矩阵
    uniform vec3 u_LightColor;  // 光线颜色
    uniform vec3 u_LightDirection;  // 光线方向 归一化的世界坐标
    uniform vec3 u_AmbientLight;    // 环境光的颜色
    varying vec4 v_Color;
    void main() {
        gl_Position = u_MvpMatrix * a_Position;
        // 计算变换后的法向量并归一化
        vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
        // 计算光线方向和法向量的点积
        float nDotL = max(dot(u_LightDirection, normal), 0.0);
        // 计算漫反射光的颜色
        vec3 diffuse = u_LightColor * vec3(a_Color) * nDotL;
        vec3 ambient = u_AmbientLight * a_Color.rgb;
        v_Color = vec4(diffuse + ambient, a_Color.a);
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

//initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)
if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    alert('Failed to intialize shaders.')
}

const n = initVertexBuffers()   // 设置顶点坐标、颜色和法向量
if(n < 0) {
    alert('initial vertex fail')
}

gl.clearColor(0, 0, 0, 1)
gl.enable(gl.DEPTH_TEST)

const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
const u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix')
const u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor')
const u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection')

// 设置光线颜色（白色）
gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0)
const lightDirection = new Vector3([0.5, 3.0, 4.0])
lightDirection.normalize()
gl.uniform3fv(u_LightDirection, lightDirection.elements)

// 环境光
const u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight')
gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2)

// 模型矩阵
const modelMatrix = new Matrix4()
modelMatrix.setTranslate(0, 1, 0)
modelMatrix.rotate(0, 0, 1, 0)

// 模型视图投影矩阵
const mvpMatrix = new Matrix4()
mvpMatrix.setPerspective(30, 1, 1, 100)
mvpMatrix.lookAt(-7, 2.5, 6, 0, 0, 0, 0, 1, 0)
mvpMatrix.multiply(modelMatrix)
gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements)

// 根据模型矩阵计算用来变换法向量的矩阵
const normalMatrix = new Matrix4()
normalMatrix.setInverseOf(modelMatrix)
normalMatrix.transpose()
gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements)

// 清空颜色缓冲区和深度缓冲区
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)


function initVertexBuffers() {
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    const vertices = new Float32Array([   // Coordinates
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
       -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
       -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
    ]);

    const colors = new Float32Array([    // Colors
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
    ]);

    const normals = new Float32Array([    // Normal
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
       -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
        0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
        0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
    ]);

    const indices = new Uint8Array([
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
        12,13,14,  12,14,15,    // left
        16,17,18,  16,18,19,    // down
        20,21,22,  20,22,23     // back
    ])

    const indexBuffer = gl.createBuffer()
    
    if(!initArrayBuffer(vertices, 3, gl.FLOAT, 'a_Position')) {
        return -1
    }
    if(!initArrayBuffer(colors, 3, gl.FLOAT, 'a_Color')) {
        return -1
    }
    if(!initArrayBuffer(normals, 3, gl.FLOAT, 'a_Normal')) {
        return -1
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

    return indices.length
}

function initArrayBuffer(data, num, type, attribute) {
    const buffer = gl.createBuffer()

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    
    const a_attribute = gl.getAttribLocation(gl.program, attribute)
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0)
    gl.enableVertexAttribArray(a_attribute)

    return true
}


function draw(timeStamp) {
    timeStamp %= 4000
    timeStamp /= 4000
    timeStamp *= 360

    modelMatrix.setTranslate(0, 1, 0)
    modelMatrix.rotate(timeStamp, 0, 1, 0)

    mvpMatrix.setPerspective(30, 1, 1, 100)
    mvpMatrix.lookAt(-7, 2.5, 6, 0, 0, 0, 0, 1, 0)
    mvpMatrix.multiply(modelMatrix)
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements)

    normalMatrix.setInverseOf(modelMatrix)
    normalMatrix.transpose()
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)

    requestAnimationFrame(draw)
}

requestAnimationFrame(draw)