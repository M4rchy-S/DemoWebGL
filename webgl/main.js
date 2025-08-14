import { MainFontData } from "./font_data.js";
import { makeVerticesForString } from "./Text.js";
import {createShader, createProgram} from "./shader.js"

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
var vrChartShader = `
  attribute vec2 a_position;
  uniform vec2 u_resolution;


  void main() {
    // convert the position from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;
 
    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;
 
    // convert from 0->2 to -1->+1 (clip space)
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace, 0.0, 1.0);

    gl_PointSize = 10.0;

  }
`

var frChartShader = `

  void main() {
    gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);

  }
`

function renderText(gl, program, text_buffers) {
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
  gl.bindTexture(gl.TEXTURE_2D, text_buffers.texture);

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


function renderChart(gl, program, ChartPoints) {
  //  Use Shader

  gl.useProgram(program);

  //  Get Pos and Text Locations from shader
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  //  Fill data to memory
  var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);


  gl.bindBuffer(gl.ARRAY_BUFFER, ChartPoints);
  // gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices.arrays.texcoord);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  //  // Enable the depth test
  //  gl.enable(gl.DEPTH_TEST);

  // draw
  gl.drawArrays(gl.POINTS, 0, 4);

}





function main() {
  var canvas = document.querySelector('#c');
  var gl = canvas.getContext('webgl');
  if (!gl) {
    return;
  }
  //  Text Shader
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vTextShader);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, frTextShader);
  //  Chart Shader
  var vertexShaderChart = createShader(gl, gl.VERTEX_SHADER, vrChartShader);
  var fragmentShaderChart = createShader(gl, gl.FRAGMENT_SHADER, frChartShader);

  const TextShaderProgram = createProgram(gl, vertexShader, fragmentShader);
  const ChartShaderProgram = createProgram(gl, vertexShaderChart, fragmentShaderChart);

  // Text init
  const fontInfo = {
    letterHeight: 8,
    spaceWidth: 8,
    spacing: -1,
    textureWidth: 512,
    textureHeight: 512,

    glyphInfos: MainFontData

  };

  const textBufferInfo = [{
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
    ShaderProgram: TextShaderProgram
  }];

  for (let i = 0; i < textBufferInfo.length; i++) {
    // const test_str = "Hello world!";
    const vertices = makeVerticesForString(fontInfo, textBufferInfo[i].Text);

    textBufferInfo[i].attribs.a_position.numComponents = 2;
    //  Position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, textBufferInfo[i].attribs.a_position.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices.arrays.position, gl.DYNAMIC_DRAW);
    //  Texture Coord buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, textBufferInfo[i].attribs.a_texcoord.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices.arrays.texcoord, gl.DYNAMIC_DRAW);

    textBufferInfo[i].numVertices = vertices.numVertices;

    //  Create Texture
    textBufferInfo[i].texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textBufferInfo[i].texture);

    // Temp texture
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

  }

  const image = new Image();
  image.src = "../Mozilla.png";
  image.addEventListener('load', function () {

    for (let i = 0; i < textBufferInfo.length; i++) {
      gl.bindTexture(gl.TEXTURE_2D, textBufferInfo[i].texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image,
      );

      requestAnimationFrame(rendering_start);

    }
  });

  //  CHART BUFFER POINTS
  const ChartPointsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, ChartPointsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0, 0.0,
    125, 125,
    150, 150,
    250, 250
  ]) , gl.DYNAMIC_DRAW);

  function rendering_start() {

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    textBufferInfo[0].rotation += 0.01;

    renderText(gl, textBufferInfo[0].ShaderProgram, textBufferInfo[0]);

    renderChart(gl, ChartShaderProgram, ChartPointsBuffer);

    requestAnimationFrame(rendering_start);
  }

}


main();


