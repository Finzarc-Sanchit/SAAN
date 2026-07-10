/**
 * SAAN atmospheric WebGL silk-gradient background
 */
(function initShaderBackground() {
  const canvas = document.getElementById('glcanvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;

  let width = 0;
  let height = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  }

  window.addEventListener('resize', resize);
  resize();

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;
    varying highp vec2 v_texCoord;
    void main(void) {
      gl_Position = aVertexPosition;
      v_texCoord = aTextureCoord;
    }
  `;

  const fsSource = `
    precision highp float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    varying highp vec2 v_texCoord;

    void main() {
      vec2 uv = v_texCoord;
      float t = u_time * 0.2;

      float noise = sin(uv.x * 3.0 + t) * cos(uv.y * 2.0 - t);
      noise += sin(uv.y * 5.0 + t * 1.5) * 0.5;

      vec3 color1 = vec3(0.294, 0.0, 0.024);
      vec3 color2 = vec3(0.98, 0.976, 0.965);
      vec3 color3 = vec3(0.4, 0.1, 0.1);

      vec3 finalColor = mix(color2, color1, noise * 0.2 + 0.3);
      finalColor = mix(finalColor, color3, sin(uv.x * 2.0 + t) * 0.1);

      float vignette = 1.0 - smoothstep(0.5, 1.5, length(uv - 0.5));

      gl_FragColor = vec4(finalColor * (0.95 + 0.05 * vignette), 0.03);
    }
  `;

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  const vertexShader = compileShader(gl.VERTEX_SHADER, vsSource);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fsSource);
  if (!vertexShader || !fragmentShader) return;

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Shader link error:', gl.getProgramInfoLog(shaderProgram));
    return;
  }

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
      uTime: gl.getUniformLocation(shaderProgram, 'u_time'),
      uResolution: gl.getUniformLocation(shaderProgram, 'u_resolution'),
      uMouse: gl.getUniformLocation(shaderProgram, 'u_mouse'),
    },
  };

  const positions = [-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0];
  const texCoords = [0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0];

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = height - event.clientY;
  });

  const startTime = Date.now();

  function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const currentTime = (Date.now() - startTime) / 1000.0;

    gl.useProgram(programInfo.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

    gl.uniform1f(programInfo.uniformLocations.uTime, currentTime);
    gl.uniform2f(programInfo.uniformLocations.uResolution, width, height);
    gl.uniform2f(programInfo.uniformLocations.uMouse, mouseX, mouseY);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(render);
  }

  render();
})();
