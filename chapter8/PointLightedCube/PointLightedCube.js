const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    attribute vec4 a_Normal;
    uniform mat4 u_ModelMatrix;     // 模型矩阵
    uniform mat4 u_MvpMatrix;
    uniform mat4 u_NormalMatrix;    // 用来变换法向量的矩阵
    uniform vec3 u_LightColor;      // 光线颜色
    uniform vec3 u_LightPosition;   // 光源位置（世界坐标）
    uniform vec3 u_AmbientLight;    // 环境光的颜色
    varying vec4 v_Color;
    void main() {
        gl_Position = u_MvpMatrix * a_Position;
        // 计算变换后的法向量并归一化
        vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
        // 计算顶点的世界坐标
        vec4 vertexPosition = u_ModelMatrix * a_Position;
        // 计算光线方向并归一化
        vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));
        // 计算光线方向和法向量的点积
        float nDotL = max(dot(lightDirection, normal), 0.0);
        // 计算漫反射光的颜色
        vec3 diffuse = u_LightColor * vec3(a_Color) * nDotL;
        // 计算环境光产生的反射光的颜色
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

const n = initVertexBuffers(gl)   // 设置顶点坐标、颜色和法向量
if(n < 0) {
    alert('initial vertex fail')
}

gl.clearColor(0, 0, 0, 1)
gl.enable(gl.DEPTH_TEST)

const u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
const u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix')
const u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor')
const u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition')
const u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight')

// Set the light color (white)
gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0)
// Set the light direction (in the world coordinate)
gl.uniform3f(u_LightPosition, 2.3, 4.0, 3.5)
// Set the ambient light
gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2)

const modelMatrix = new Matrix4()  // Model matrix
const mvpMatrix = new Matrix4()    // Model view projection matrix
const normalMatrix = new Matrix4() // Transformation matrix for normals

// Calculate the model matrix
modelMatrix.setRotate(90, 0, 1, 0) // Rotate around the y-axis
// Pass the model matrix to u_ModelMatrix
gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)

// Pass the model view projection matrix to u_MvpMatrix
mvpMatrix.setPerspective(30, 1, 1, 100)
mvpMatrix.lookAt(6, 6, 14, 0, 0, 0, 0, 1, 0)
mvpMatrix.multiply(modelMatrix)
gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements)

// Pass the matrix to transform the normal based on the model matrix to u_NormalMatrix
normalMatrix.setInverseOf(modelMatrix)
normalMatrix.transpose()
gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements)

// Clear color and depth buffer
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
// Draw the cube
gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)

function initVertexBuffers(gl) {
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    // Coordinates
    var vertices = new Float32Array([
       2.0, 2.0, 2.0,  -2.0, 2.0, 2.0,  -2.0,-2.0, 2.0,   2.0,-2.0, 2.0, // v0-v1-v2-v3 front
       2.0, 2.0, 2.0,   2.0,-2.0, 2.0,   2.0,-2.0,-2.0,   2.0, 2.0,-2.0, // v0-v3-v4-v5 right
       2.0, 2.0, 2.0,   2.0, 2.0,-2.0,  -2.0, 2.0,-2.0,  -2.0, 2.0, 2.0, // v0-v5-v6-v1 up
      -2.0, 2.0, 2.0,  -2.0, 2.0,-2.0,  -2.0,-2.0,-2.0,  -2.0,-2.0, 2.0, // v1-v6-v7-v2 left
      -2.0,-2.0,-2.0,   2.0,-2.0,-2.0,   2.0,-2.0, 2.0,  -2.0,-2.0, 2.0, // v7-v4-v3-v2 down
       2.0,-2.0,-2.0,  -2.0,-2.0,-2.0,  -2.0, 2.0,-2.0,   2.0, 2.0,-2.0  // v4-v7-v6-v5 back
    ]);
  
    // Colors
    var colors = new Float32Array([
      1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
      1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
      1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
      1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
      1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
      1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
   ]);
  
    // Normal
    var normals = new Float32Array([
      0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
      1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
      0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
     -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
      0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
      0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
    ]);
  
    // Indices of the vertices
    var indices = new Uint8Array([
       0, 1, 2,   0, 2, 3,    // front
       4, 5, 6,   4, 6, 7,    // right
       8, 9,10,   8,10,11,    // up
      12,13,14,  12,14,15,    // left
      16,17,18,  16,18,19,    // down
      20,21,22,  20,22,23     // back
   ]);
  
    // Write the vertex property to buffers (coordinates, colors and normals)
    if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;
  
    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
    // Write the indices to the buffer object
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
      console.log('Failed to create the buffer object');
      return false;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  
    return indices.length;
  }
  
  function initArrayBuffer(gl, attribute, data, num, type) {
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
      console.log('Failed to create the buffer object');
      return false;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Assign the buffer object to the attribute variable
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
      console.log('Failed to get the storage location of ' + attribute);
      return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // Enable the assignment of the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);
  
    return true;
}
  