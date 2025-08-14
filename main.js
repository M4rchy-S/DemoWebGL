import { MainFontData } from "./font_data.js";

var vTextShader = `
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
var frTextShader = `
  precision mediump float;

  uniform vec3 color;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;

  float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
  }

  void main() {
    // gl_FragColor = u_color;
    // gl_FragColor = texture2D(u_image, v_texCoord) ;
    
    vec4 texColor = texture2D(u_image, v_texCoord) ;
    float sigDist = median(texColor.r, texColor.g, texColor.b) - 0.5;
    float alpha = step(0.0001, sigDist);
    gl_FragColor = vec4(color, alpha);
    // if (gl_FragColor.a < 0.0001) discard;


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


function render(gl, program, text_buffers) {
  //  Use Shader

  gl.useProgram(program);

  //  Get Pos and Text Locations from shader
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

  //  Fill data to memory
  
  const vertices = makeVerticesForString(text_buffers.fontInfo, text_buffers.Text);

  gl.bindBuffer(gl.ARRAY_BUFFER, text_buffers.attribs.a_position.buffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices.arrays.position);
  var size = 2;          
  var type = gl.FLOAT;   
  var normalize = false; 
  var stride = 0;        
  var offset = 0;        
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset);

  gl.bindBuffer(gl.ARRAY_BUFFER, text_buffers.attribs.a_texcoord.buffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices.arrays.texcoord);
  gl.enableVertexAttribArray(texCoordLocation);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  //  Setup uniforms
  //  Color
  var colorUniformLocation = gl.getUniformLocation(program, "color");
  gl.uniform3f(colorUniformLocation, 0.0, 0.0, 0.0);
  //  Resolution
  var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);


  //  Model matrix
  //  Scale + Rotate + Translate
  const scaleMatrixLocation = gl.getUniformLocation(program, "u_matrix");

  const modelMatrix = mat4.create();

  mat4.scale(modelMatrix, modelMatrix, [text_buffers.scale.x, text_buffers.scale.y, 0.0]);

  mat4.translate(
    modelMatrix,
    modelMatrix,
    [text_buffers.position.x, text_buffers.position.y, 0.0],
  ); 

  mat4.rotate(modelMatrix, modelMatrix, text_buffers.rotation, [0.1, 0.0, 0.0]);

  // mat4.scale(modelMatrix, modelMatrix, [0.2, 0.2, 0.0]);

  gl.uniformMatrix4fv(scaleMatrixLocation, false, modelMatrix);

  //  Activate texture
  // gl.activeTexture(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, text_buffers.texture );

  // var texture = gl.createTexture();
  // gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);


  // draw
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = vertices.numVertices;
  gl.drawArrays(primitiveType, offset, count);

}


function main() {
  var canvas = document.querySelector('#c');
  var gl = canvas.getContext('webgl');
  if (!gl) {
    return;
  }

  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vTextShader);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, frTextShader);

  const program = createProgram(gl, vertexShader, fragmentShader);

  // Text init
  const fontInfo = {
    letterHeight: 8,
    spaceWidth: 8,
    spacing: -1,
    textureWidth: 512,
    textureHeight: 512,
  
    glyphInfos: MainFontData
  
  };

  const textBufferInfo = {
    attribs: {
      a_position: { buffer: gl.createBuffer(), numComponents: 2, },
      a_texcoord: { buffer: gl.createBuffer(), numComponents: 2, },
    },
    numElements: 0,
    numVertices: 0,
    fontInfo,
    Text: "Hello world",
    rotation: 0.0,
    position: {
      x: 0.0,
      y: 0.0
    },
    scale: {
      x: 1.0,
      y: 1.0
    },
    ShaderProgram: program
  };

  // const test_str = "Hello world!";
  const vertices = makeVerticesForString(fontInfo, textBufferInfo.Text);
  
  textBufferInfo.attribs.a_position.numComponents = 2;
  //  Position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, textBufferInfo.attribs.a_position.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices.arrays.position, gl.DYNAMIC_DRAW);
  //  Texture Coord buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, textBufferInfo.attribs.a_texcoord.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices.arrays.texcoord, gl.DYNAMIC_DRAW);

  textBufferInfo.numVertices = vertices.numVertices;

  //  Create Texture
  textBufferInfo.texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textBufferInfo.texture );

  // Temp texture
  // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));


  const image = new Image();
  image.src = "Mozilla.png";
  image.addEventListener('load' , function (){
    gl.bindTexture(gl.TEXTURE_2D, textBufferInfo.texture );
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image,
    );

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  
    requestAnimationFrame(rendering_start);
  });

  function rendering_start(){
    // textBufferInfo.rotation += 0.01;
    render(gl, textBufferInfo.ShaderProgram, textBufferInfo);
    requestAnimationFrame(rendering_start);
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
      var v1 = (glyphInfo.y + glyphInfo.height - 1) / maxY;
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
      positions[offset + 5] = glyphInfo.height;
      texcoords[offset + 4] = u1;
      texcoords[offset + 5] = v2;
 
      positions[offset + 6] = x;
      positions[offset + 7] = glyphInfo.height;
      texcoords[offset + 6] = u1;
      texcoords[offset + 7] = v2;
 
      positions[offset + 8] = x2;
      positions[offset + 9] = 0;
      texcoords[offset + 8] = u2;
      texcoords[offset + 9] = v1;
 
      positions[offset + 10] = x2;
      positions[offset + 11] = glyphInfo.height;
      texcoords[offset + 10] = u2;
      texcoords[offset + 11] = v2;
 
      x += glyphInfo.xadvance;
      offset += 12;
    } else {
      x += fontInfo.spaceWidth;
    }
  }
 

  return {
    arrays: {
      position: new Float32Array(positions.buffer, 0, offset),
      texcoord: new Float32Array(texcoords.buffer, 0, offset),
    },
    numVertices: offset / 2,
  };
}