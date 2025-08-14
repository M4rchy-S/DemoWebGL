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

export { makeVerticesForString }