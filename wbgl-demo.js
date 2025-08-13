

var vsSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;

  uniform vec2 u_resolution;
  uniform mat4 u_matrix;

  varying vec2 v_texCoord;

  void main() {

    // convert the position from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;
 
    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;
 
    // convert from 0->2 to -1->+1 (clip space)
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = u_matrix * vec4(clipSpace, 0.0, 1.0);
 
    // gl_Position = vec4(clipSpace , 0, 1);
    // gl_Position = vec4(clipSpace , 0, 1);
    v_texCoord = a_texCoord;


  }
`
var frSource = `
  precision mediump float;

  uniform vec4 u_color;
  
  varying vec2 v_texCoord;
  uniform sampler2D u_image;

  void main() {
    // gl_FragColor = u_color;
    gl_FragColor = texture2D(u_image, v_texCoord) ;
  }

`

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}


function render(image) {
  var canvas = document.querySelector('#c');
  var gl = canvas.getContext('webgl');
  if (!gl) {
    return;
  }

  // Get the strings for our GLSL shaders

  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, frSource);

  var program = createProgram(gl, vertexShader, fragmentShader);

  gl.clearColor(0.4, 0.4, 0.4, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.useProgram(program);

  // Manually create a bufferInfo
var textBufferInfo = {
  attribs: {
    a_position: { buffer: gl.createBuffer(), numComponents: 2, },
    a_texcoord: { buffer: gl.createBuffer(), numComponents: 2, },
  },
  numElements: 0,
};


  //  Position
  // var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // var positionBuffer = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // setRectangle(gl, 140, 200, image.width * 3, image.height * 3);

  // gl.enableVertexAttribArray(positionAttributeLocation);
  // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  // var size = 2;          // 2 components per iteration
  // var type = gl.FLOAT;   // the data is 32bit floats
  // var normalize = false; // don't normalize the data
  // var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  // var offset = 0;        // start at the beginning of the buffer
  // gl.vertexAttribPointer(
  //   positionAttributeLocation, size, type, normalize, stride, offset);


  // var colorUniformLocation = gl.getUniformLocation(program, "u_color");
  // gl.uniform4f(colorUniformLocation, 0.0, 1.0, 0.0, 1.0);

  // var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

  // var texCoordBuffer = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  //   0.0,  0.0,
  //   1.0,  0.0,
  //   0.0,  1.0,
  //   0.0,  1.0,
  //   1.0,  0.0,
  //   1.0,  1.0
  // ]), gl.STATIC_DRAW);

  // gl.enableVertexAttribArray(texCoordLocation);
  // gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  const scaleMatrixLocation = gl.getUniformLocation(program, "u_matrix");

  const modelMatrix = mat4.create();

  // mat4.scale(modelMatrix, modelMatrix, [1.0, 1.0, 0.0]);

  // mat4.translate(
  //   modelMatrix,
  //   modelMatrix,
  //   [0.0, 0.0, 0.0],
  // ); 

  gl.uniformMatrix4fv(scaleMatrixLocation, false, modelMatrix);
 
  // Set the parameters so we can render any size image.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
 
  // Upload the image into the texture.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
  const test_str = "234123,fe.";
  var vertices = makeVerticesForString(fontInfo, test_str);

  textBufferInfo.attribs.a_position.numComponents = 2;

  gl.bindBuffer(gl.ARRAY_BUFFER, textBufferInfo.attribs.a_position.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices.arrays.position, gl.DYNAMIC_DRAW);
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset);

  gl.bindBuffer(gl.ARRAY_BUFFER, textBufferInfo.attribs.a_texcoord.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices.arrays.texcoord, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(texCoordLocation);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  // draw
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = vertices.numVertices;
  gl.drawArrays(primitiveType, offset, count);

}


function main() {
  var image = new Image();
  image.src = "font.png";
  image.onload = function() {
    render(image);
  }
}
 

main();


function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2,
  ]), gl.STATIC_DRAW);
}

var fontInfo = {
  letterHeight: 8,
  spaceWidth: 8,
  spacing: -1,
  textureWidth: 64,
  textureHeight: 40,
  
  glyphInfos: {
    'a': { x: 0, y: 0, width: 8, },
    'b': { x: 8, y: 0, width: 8, },
    'c': { x: 16, y: 0, width: 8, },
    'd': { x: 24, y: 0, width: 8, },
    'e': { x: 32, y: 0, width: 8, },
    'f': { x: 40, y: 0, width: 8, },
    'g': { x: 48, y: 0, width: 8, },
    'h': { x: 56, y: 0, width: 8, },
    'i': { x: 0, y: 8, width: 8, },
    'j': { x: 8, y: 8, width: 8, },
    'k': { x: 16, y: 8, width: 8, },
    'l': { x: 24, y: 8, width: 8, },
    'm': { x: 32, y: 8, width: 8, },
    'n': { x: 40, y: 8, width: 8, },
    'o': { x: 48, y: 8, width: 8, },
    'p': { x: 56, y: 8, width: 8, },
    'q': { x: 0, y: 16, width: 8, },
    'r': { x: 8, y: 16, width: 8, },
    's': { x: 16, y: 16, width: 8, },
    't': { x: 24, y: 16, width: 8, },
    'u': { x: 32, y: 16, width: 8, },
    'v': { x: 40, y: 16, width: 8, },
    'w': { x: 48, y: 16, width: 8, },
    'x': { x: 56, y: 16, width: 8, },
    'y': { x: 0, y: 24, width: 8, },
    'z': { x: 8, y: 24, width: 8, },
    '0': { x: 16, y: 24, width: 8, },
    '1': { x: 24, y: 24, width: 8, },
    '2': { x: 32, y: 24, width: 8, },
    '3': { x: 40, y: 24, width: 8, },
    '4': { x: 48, y: 24, width: 8, },
    '5': { x: 56, y: 24, width: 8, },
    '6': { x: 0, y: 32, width: 8, },
    '7': { x: 8, y: 32, width: 8, },
    '8': { x: 16, y: 32, width: 8, },
    '9': { x: 24, y: 32, width: 8, },
    '-': { x: 32, y: 32, width: 8, },
    '*': { x: 40, y: 32, width: 8, },
    '!': { x: 48, y: 32, width: 8, },
    '?': { x: 56, y: 32, width: 8, },
  },
};



function makeVerticesForString(fontInfo, s) {
  var len = s.length;
  var numVertices = len * 6;
  var positions = new Float32Array(numVertices * 2);
  var texcoords = new Float32Array(numVertices * 2);
  var offset = 0;
  var x = 0;
  var maxX = fontInfo.textureWidth;
  var maxY = fontInfo.textureHeight;
  for (var ii = 0; ii < len; ++ii) {
    var letter = s[ii];
    var glyphInfo = fontInfo.glyphInfos[letter];
    if (glyphInfo) {
      var x2 = x + glyphInfo.width;
      var u1 = glyphInfo.x / maxX;
      var v1 = (glyphInfo.y + fontInfo.letterHeight - 1) / maxY;
      var u2 = (glyphInfo.x + glyphInfo.width - 1) / maxX;
      var v2 = glyphInfo.y / maxY;
 
      // 6 vertices per letter
      positions[offset + 0] = x;
      positions[offset + 1] = 0;
      texcoords[offset + 0] = u1;
      texcoords[offset + 1] = v1;
 
      positions[offset + 2] = x2;
      positions[offset + 3] = 0;
      texcoords[offset + 2] = u2;
      texcoords[offset + 3] = v1;
 
      positions[offset + 4] = x;
      positions[offset + 5] = fontInfo.letterHeight;
      texcoords[offset + 4] = u1;
      texcoords[offset + 5] = v2;
 
      positions[offset + 6] = x;
      positions[offset + 7] = fontInfo.letterHeight;
      texcoords[offset + 6] = u1;
      texcoords[offset + 7] = v2;
 
      positions[offset + 8] = x2;
      positions[offset + 9] = 0;
      texcoords[offset + 8] = u2;
      texcoords[offset + 9] = v1;
 
      positions[offset + 10] = x2;
      positions[offset + 11] = fontInfo.letterHeight;
      texcoords[offset + 10] = u2;
      texcoords[offset + 11] = v2;
 
      x += glyphInfo.width + fontInfo.spacing;
      offset += 12;
    } else {
      // we don't have this character so just advance
      x += fontInfo.spaceWidth;
    }
  }
 
  // return ArrayBufferViews for the portion of the TypedArrays
  // that were actually used.
  return {
    arrays: {
      position: new Float32Array(positions.buffer, 0, offset),
      texcoord: new Float32Array(texcoords.buffer, 0, offset),
    },
    numVertices: offset / 2,
  };
}