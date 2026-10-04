"use client";

import { useEffect, useRef } from "react";

type SpaceObject = {
  id: number;
  src: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  captured: boolean;
};

type BlackHoleScreenPosition = {
  x: number;
  y: number;
};

type TextureData = {
  texture: WebGLTexture;
  width: number;
  height: number;
};

const SPACE_OBJECTS = [
  "/asteroid-2-svgrepo-com.svg",
  "/atronaut-svgrepo-com.svg",
  "/satellite-svgrepo-com.svg",
  "/space-shuttle-svgrepo-com.svg",
  "/earth-svgrepo-com.svg",
];

const SPAWN_INTERVAL = 3000;
const OBJECT_OPACITY = 0.55;

const GRAVITY_STRENGTH = 90000;
const TANGENTIAL_STRENGTH = 4200;
const MAX_SPEED = 750;
const CAPTURE_SPEED = 420;
const WARP_RADIUS_MULTIPLIER = 0.7;
const MAX_WARP_STRENGTH = 2.8;

const SIDES = ["top", "bottom", "left", "right"] as const;

function getEdgePosition(
  side: (typeof SIDES)[number],
  width: number,
  height: number
) {
  switch (side) {
    case "top":
      return {
        x: width * (0.1 + Math.random() * 0.8),
        y: -60,
      };

    case "bottom":
      return {
        x: width * (0.1 + Math.random() * 0.8),
        y: height + 60,
      };

    case "left":
      return {
        x: -60,
        y: height * (0.1 + Math.random() * 0.8),
      };

    case "right":
      return {
        x: width + 60,
        y: height * (0.1 + Math.random() * 0.8),
      };
  }
}

function createSpaceObject(
  id: number,
  width: number,
  height: number,
  blackHoleX: number,
  blackHoleY: number
): SpaceObject {
  const roll = Math.random();

  let startSide: (typeof SIDES)[number];

  if (roll < 0) {
    startSide = "right";
  } else if (roll < 0.40) {
    startSide = "top";
  } else if (roll < 0.70) {
    startSide = "bottom";
  } else {
    startSide = "left";
  }

  let endSide = SIDES[Math.floor(Math.random() * SIDES.length)];

  while (endSide === startSide) {
    endSide = SIDES[Math.floor(Math.random() * SIDES.length)];
  }

  const start = getEdgePosition(startSide, width, height);

  const dx = blackHoleX - start.x;
  const dy = blackHoleY - start.y;
  const distance = Math.hypot(dx, dy);

  const speed = 45 + Math.random() * 25;

  return {
    id,
    src: SPACE_OBJECTS[Math.floor(Math.random() * SPACE_OBJECTS.length)],
    x: start.x,
    y: start.y,
    vx: (dx / distance) * speed,
    vy: (dy / distance) * speed,
    size: 1.8 + Math.random() * 1.8,
    rotation: Math.random() * 360,
    rotationSpeed: -35 + Math.random() * 70,
    captured: false,
  };
}

const VERTEX_SHADER = `
precision mediump float;

attribute vec2 a_position;
attribute vec2 a_uv;

uniform vec2 u_resolution;
uniform vec2 u_position;
uniform vec2 u_size;
uniform float u_rotation;
uniform vec2 u_warpDirection;
uniform float u_warpStrength;

varying vec2 v_uv;

void main() {
  float halfWidth =
   u_size.x * 0.5;

  float halfHeight =
   u_size.y * 0.5;

  vec2 pixelPosition =
   vec2(
    a_position.x * halfWidth,
    a_position.y * halfHeight
   );

  float along =
   dot(
    a_position,
    u_warpDirection
   );

  float nearFactor =
   smoothstep(
    -0.15,
    0.85,
    along
   );

  float stretch =
   1.0 +
   nearFactor *
   u_warpStrength *
   2.0;

  float radial =
   dot(
    pixelPosition,
    u_warpDirection
   );

  vec2 perpendicular =
   pixelPosition -
   radial *
   u_warpDirection;

  pixelPosition =
   perpendicular +
   u_warpDirection *
   radial *
   stretch;

  pixelPosition +=
   u_warpDirection *
   nearFactor *
   u_warpStrength *
   min(
    u_size.x,
    u_size.y
   ) *
   0.28;

  float c =
   cos(u_rotation);

  float s =
   sin(u_rotation);

  vec2 rotated =
   vec2(
    pixelPosition.x * c -
    pixelPosition.y * s,

    pixelPosition.x * s +
    pixelPosition.y * c
   );

  vec2 screen =
   u_position +
   rotated;

  vec2 zeroToOne =
   screen /
   u_resolution;

  vec2 clip =
   zeroToOne * 2.0 -
   1.0;

  clip.y *= -1.0;

  gl_Position =
   vec4(
    clip,
    0.0,
    1.0
   );

  v_uv = a_uv;
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

uniform sampler2D u_texture;
uniform float u_opacity;

varying vec2 v_uv;

void main() {
    vec4 color = texture2D(
        u_texture,
        v_uv
    );

    color.a *= u_opacity;

    if (color.a < 0.01) {
        discard;
    }

    gl_FragColor = color;
}
`;

function createGridMesh(gl: WebGLRenderingContext, subdivisions = 20) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let y = 0; y <= subdivisions; y++) {
    const v = y / subdivisions;

    for (let x = 0; x <= subdivisions; x++) {
      const u = x / subdivisions;

      positions.push(u * 2 - 1, v * 2 - 1);
      uvs.push(u, 1 - v);
    }
  }

  const rowSize = subdivisions + 1;

  for (let y = 0; y < subdivisions; y++) {
    for (let x = 0; x < subdivisions; x++) {
      const a = y * rowSize + x;
      const b = a + 1;
      const c = a + rowSize;
      const d = c + 1;

      indices.push(a, c, b, b, c, d);
    }
  }

  const positionBuffer = gl.createBuffer();
  const uvBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();

  if (!positionBuffer || !uvBuffer || !indexBuffer) {
    throw new Error("Unable to create WebGL buffers.");
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  return {
    positionBuffer,
    uvBuffer,
    indexBuffer,
    indexCount: indices.length,
  };
}

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);

  if (!shader) {
    throw new Error("Unable to create WebGL shader.");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader);

    gl.deleteShader(shader);

    throw new Error(error || "WebGL shader compilation failed.");
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);

  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

  const program = gl.createProgram();

  if (!program) {
    throw new Error("Unable to create WebGL program.");
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error = gl.getProgramInfoLog(program);

    gl.deleteProgram(program);

    throw new Error(error || "WebGL program linking failed.");
  }

  return program;
}

export default function SpaceObjects() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const physics = useRef(new Map<number, SpaceObject>());

  const nextId = useRef(0);

  const frameId = useRef<number | null>(null);

  const blackHolePosition = useRef<BlackHoleScreenPosition>({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
    });

    if (!gl) {
      console.error("WebGL is not available.");
      return;
    }

    const program = createProgram(gl);
    const mesh = createGridMesh(gl, 50);

    const positionLocation = gl.getAttribLocation(program, "a_position");

    const uvLocation = gl.getAttribLocation(program, "a_uv");

    const uResolution = gl.getUniformLocation(program, "u_resolution");

    const uPosition = gl.getUniformLocation(program, "u_position");

    const uSize = gl.getUniformLocation(program, "u_size");

    const uRotation = gl.getUniformLocation(program, "u_rotation");

    const uWarpDirection = gl.getUniformLocation(program, "u_warpDirection");

    const uWarpStrength = gl.getUniformLocation(program, "u_warpStrength");

    const uOpacity = gl.getUniformLocation(program, "u_opacity");

    const uTexture = gl.getUniformLocation(program, "u_texture");

    const textures = new Map<string, TextureData>();
    const loading = new Map<string, Promise<void>>();

    const loadTexture = async (src: string) => {
      if (textures.has(src) || loading.has(src)) {
        return;
      }

      const promise = (async () => {
        try {
          const response = await fetch(src);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const svgText = await response.text();

          const blob = new Blob([svgText], {
            type: "image/svg+xml",
          });

          const blobUrl = URL.createObjectURL(blob);

          try {
            const image = new Image();

            image.decoding = "async";

            await new Promise<void>((resolve, reject) => {
              image.onload = () => resolve();

              image.onerror = () =>
                reject(new Error(`Failed to rasterize ${src}`));

              image.src = blobUrl;
            });

            const sourceWidth = image.naturalWidth || 512;

            const sourceHeight = image.naturalHeight || 512;

            const offscreen = document.createElement("canvas");

            offscreen.width = sourceWidth;
            offscreen.height = sourceHeight;

            const ctx = offscreen.getContext("2d");

            if (!ctx) {
              throw new Error("Unable to create 2D canvas.");
            }

            ctx.clearRect(0, 0, sourceWidth, sourceHeight);

            ctx.drawImage(image, 0, 0, sourceWidth, sourceHeight);

            const texture = gl.createTexture();

            if (!texture) {
              throw new Error("Unable to create WebGL texture.");
            }

            gl.bindTexture(gl.TEXTURE_2D, texture);

            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

            gl.texParameteri(
              gl.TEXTURE_2D,
              gl.TEXTURE_WRAP_S,
              gl.CLAMP_TO_EDGE
            );

            gl.texParameteri(
              gl.TEXTURE_2D,
              gl.TEXTURE_WRAP_T,
              gl.CLAMP_TO_EDGE
            );

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            gl.texImage2D(
              gl.TEXTURE_2D,
              0,
              gl.RGBA,
              gl.RGBA,
              gl.UNSIGNED_BYTE,
              offscreen
            );

            gl.bindTexture(gl.TEXTURE_2D, null);

            textures.set(src, {
              texture,
              width: sourceWidth,
              height: sourceHeight,
            });
          } finally {
            URL.revokeObjectURL(blobUrl);
          }
        } catch (error) {
          console.error(`Failed to load space object ${src}:`, error);
        } finally {
          loading.delete(src);
        }
      })();

      loading.set(src, promise);

      await promise;
    };

    for (const src of SPACE_OBJECTS) {
      void loadTexture(src);
    }

    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    const onBlackHolePosition = (event: Event) => {
      const customEvent = event as CustomEvent<BlackHoleScreenPosition>;

      if (!customEvent.detail) {
        return;
      }

      blackHolePosition.current.x = customEvent.detail.x;

      blackHolePosition.current.y = customEvent.detail.y;
    };

    window.addEventListener("blackhole-position", onBlackHolePosition);

    const spawnObject = () => {
      const target = blackHolePosition.current;

      const object = createSpaceObject(
        nextId.current,
        window.innerWidth,
        window.innerHeight,
        target.x,
        target.y
      );

      nextId.current += 1;

      physics.current.set(object.id, object);
    };

    const removeObject = (id: number) => {
      physics.current.delete(id);
    };

    const getObjectScale = (distance: number, minDimension: number) => {
      const captureRadius = minDimension * 0.025;

      const shrinkStartRadius = minDimension * 0.38;

      const shrinkProgress =
        distance < shrinkStartRadius
          ? Math.min(
            1,
            Math.max(
              0,
              (shrinkStartRadius - distance) /
              (shrinkStartRadius - captureRadius)
            )
          )
          : 0;

      return Math.max(0.025, 1 - shrinkProgress * 0.975);
    };

    const renderObject = (object: SpaceObject, minDimension: number) => {
      const textureData = textures.get(object.src);

      if (!textureData) {
        return;
      }

      const target = blackHolePosition.current;

      const dx = target.x - object.x;
      const dy = target.y - object.y;

      const distance = Math.hypot(dx, dy);

      const warpRadius = minDimension * WARP_RADIUS_MULTIPLIER;

      let warpProgress = Math.max(0, 1 - distance / warpRadius);

      warpProgress *= warpProgress;

      let warpStrength = warpProgress * MAX_WARP_STRENGTH;

      if (object.captured) {
        warpStrength = Math.max(warpStrength, 1.8);

        warpStrength = Math.min(warpStrength, MAX_WARP_STRENGTH);
      }

      const length = Math.max(distance, 1);

      const worldDirX = dx / length;

      const worldDirY = dy / length;

      const angle = (object.rotation * Math.PI) / 180;

      const cos = Math.cos(-angle);
      const sin = Math.sin(-angle);

      const localDirX = worldDirX * cos - worldDirY * sin;

      const localDirY = worldDirX * sin + worldDirY * cos;

      const scale = getObjectScale(distance, minDimension);

      const baseSize = Math.min(
        52,
        Math.max(20, (object.size * window.innerWidth) / 100)
      );

      const aspect = textureData.width / Math.max(textureData.height, 1);

      const width = baseSize * aspect;

      const height = baseSize;

      const scaledWidth = width * scale;

      const scaledHeight = height * scale;

      gl.useProgram(program);

      gl.uniform2f(uResolution, window.innerWidth, window.innerHeight);

      gl.uniform2f(uPosition, object.x, object.y);

      gl.uniform2f(uSize, scaledWidth, scaledHeight);

      gl.uniform1f(uRotation, angle);

      gl.uniform2f(uWarpDirection, localDirX, localDirY);

      gl.uniform1f(uWarpStrength, warpStrength);

      gl.uniform1f(uOpacity, OBJECT_OPACITY);

      gl.activeTexture(gl.TEXTURE0);

      gl.bindTexture(gl.TEXTURE_2D, textureData.texture);

      gl.uniform1i(uTexture, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positionBuffer);

      gl.enableVertexAttribArray(positionLocation);

      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.uvBuffer);

      gl.enableVertexAttribArray(uvLocation);

      gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);

      gl.drawElements(gl.TRIANGLES, mesh.indexCount, gl.UNSIGNED_SHORT, 0);
    };

    let disposed = false;

    let lastTime = performance.now();
    let lastSpawnTime = performance.now();

    const handleVisibilityChange = () => {
      const now = performance.now();

      lastTime = now;
      lastSpawnTime = now;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const animate = (now: number) => {
      if (disposed) {
        return;
      }
      const deltaTime = document.hidden
        ? 0
        : Math.min((now - lastTime) / 1000, 0.033);

      lastTime = now;

      const width = window.innerWidth;
      const height = window.innerHeight;

      const minDimension = Math.min(width, height);

      if (!document.hidden && now - lastSpawnTime >= SPAWN_INTERVAL) {
        spawnObject();

        lastSpawnTime = now;
      }

      const target = blackHolePosition.current;

      const gravityRadius = minDimension * 1.15;

      const commitRadius = minDimension * 0.2;

      const captureRadius = minDimension * 0.025;

      gl.clearColor(0, 0, 0, 0);

      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.enable(gl.BLEND);

      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      if (!document.hidden) {
        for (const object of physics.current.values()) {
          let dx = target.x - object.x;

          let dy = target.y - object.y;

          let distance = Math.hypot(dx, dy);

          if (!object.captured && distance <= commitRadius) {
            object.captured = true;
          }

          if (object.captured) {
            const safeDistance = Math.max(distance, 1);

            const nx = dx / safeDistance;

            const ny = dy / safeDistance;

            const currentSpeed = Math.hypot(object.vx, object.vy);

            const inwardSpeed = Math.max(currentSpeed, CAPTURE_SPEED);

            object.vx = nx * inwardSpeed;

            object.vy = ny * inwardSpeed;
          } else if (distance < gravityRadius) {
            const safeDistance = Math.max(distance, 1);

            const nx = dx / safeDistance;

            const ny = dy / safeDistance;

            const falloff = Math.max(0, 1 - distance / gravityRadius);

            const gravity =
              (GRAVITY_STRENGTH * (0.35 + falloff * falloff * 2.5)) /
              Math.max(distance, 25);

            object.vx += nx * gravity * deltaTime;

            object.vy += ny * gravity * deltaTime;

            const tangentX = -ny;
            const tangentY = nx;

            const tangentFalloff = Math.pow(falloff, 1.35);

            object.vx +=
              (tangentX * TANGENTIAL_STRENGTH * tangentFalloff * deltaTime) /
              Math.max(distance, 100);

            object.vy +=
              (tangentY * TANGENTIAL_STRENGTH * tangentFalloff * deltaTime) /
              Math.max(distance, 100);
          }

          const speed = Math.hypot(object.vx, object.vy);

          if (speed > MAX_SPEED) {
            const multiplier = MAX_SPEED / speed;

            object.vx *= multiplier;

            object.vy *= multiplier;
          }

          object.x += object.vx * deltaTime;

          object.y += object.vy * deltaTime;

          object.rotation += object.rotationSpeed * deltaTime;

          dx = target.x - object.x;

          dy = target.y - object.y;

          distance = Math.hypot(dx, dy);

          if (
            object.captured
              ? distance <= captureRadius
              : object.x < -160 ||
              object.x > width + 160 ||
              object.y < -160 ||
              object.y > height + 160
          ) {
            removeObject(object.id);

            continue;
          }

          renderObject(object, minDimension);
        }
      } else {
        for (const object of physics.current.values()) {
          renderObject(object, minDimension);
        }
      }

      frameId.current = requestAnimationFrame(animate);
    };

    spawnObject();

    frameId.current = requestAnimationFrame(animate);

    return () => {
      disposed = true;

      if (frameId.current !== null) {
        cancelAnimationFrame(frameId.current);

        frameId.current = null;
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);

      window.removeEventListener("resize", resizeCanvas);

      window.removeEventListener("blackhole-position", onBlackHolePosition);

      for (const { texture } of textures.values()) {
        gl.deleteTexture(texture);
      }

      gl.deleteBuffer(mesh.positionBuffer);

      gl.deleteBuffer(mesh.uvBuffer);

      gl.deleteBuffer(mesh.indexBuffer);

      gl.deleteProgram(program);

      physics.current.clear();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
        display: "block",
        background: "transparent",
      }}
    />
  );
}
