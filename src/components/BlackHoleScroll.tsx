"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three/webgpu";

import {
  pass,
  uniform,
  Fn,
  Loop,
  Break,
  If,
  screenUV,
  vec2,
  vec3,
  vec4,
  float,
  length,
  normalize,
  dot,
  sin,
  cos,
  atan,
  asin,
  sqrt,
  pow,
  fract,
  clamp,
  smoothstep,
  mix,
  floor,
  step,
  sign,
} from "three/tsl";

import { bloom } from "three/addons/tsl/display/BloomNode.js";

export type BlackHoleScrollProps = {
  blackHoleTravel?: number;
  starTravel?: number;
  className?: string;
  dragSensitivity?: number;
  dragYSensitivity?: number;

  blackHoleTravelX?: number;
  blackHoleTravelY?: number;
  blackHoleTravelZ?: number;

  blackHolePositionXPercent?: number;
  blackHolePositionYPercent?: number;
  blackHolePositionZ?: number;

  blackHoleRotation?: number;
  blackHoleSizeMultiplier?: number;

  /** Weaker graphics for low-end laptops: lower render resolution and reduced glow. */
  lowGraphics?: boolean;
};

const config = {
  blackHoleMass: 0.4,

  diskInnerRadius: 4.1,
  diskOuterRadius: 14.5,

  diskTemperature: 49.78,
  temperatureFalloff: 5.22,
  diskBrightness: 5,

  diskRotationSpeed: -25,

  turbulenceScale: 1.81,
  turbulenceStretch: 0.75,
  turbulenceSharpness: 7.4,
  turbulenceCycleTime: 5,
  turbulenceLacunarity: 2.5,
  turbulencePersistence: 0.8,

  diskEdgeSoftnessInner: 0.18,
  diskEdgeSoftnessOuter: 0.5,

  gravitationalLensing: 2.4,
  dopplerStrength: 1,
  stepSize: 1,

  starsEnabled: true,
  starBackgroundColor: "#000000",
  starDensity: 0.1,
  starSize: 1.2,
  starBrightness: 0.1,

  nebulaEnabled: true,
  nebula1Scale: 2,
  nebula1Density: 0.5,
  nebula1Brightness: 0.01,
  nebula1Color: "#071f44",

  nebula2Scale: 5.5,
  nebula2Density: 0.05,
  nebula2Brightness: 0.21,
  nebula2Color: "#010615",

  bloomStrength: 0.68,
  bloomRadius: 0,
  bloomThreshold: 0.45,
};

const CAMERA_FOV = 60;
const TAN_HALF_FOV = Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV) / 2);

/** Render scale used when lowGraphics is on (1 = full resolution). */
const LOW_GRAPHICS_RESOLUTION_SCALE = 0.6;

const CAM_POS = new THREE.Vector3(0, -2, -18);
const CAM_TARGET = new THREE.Vector3(0, 0, 0);

const WORLD_UP = new THREE.Vector3(0, 1, 0);

const CAM_FORWARD = CAM_TARGET.clone().sub(CAM_POS).normalize();

const CAM_RIGHT = new THREE.Vector3()
  .crossVectors(WORLD_UP, CAM_FORWARD)
  .normalize();

const CAM_UP = new THREE.Vector3()
  .crossVectors(CAM_FORWARD, CAM_RIGHT)
  .normalize();

const STAR_BACKGROUND_COLOR = new THREE.Color(config.starBackgroundColor);

const NEBULA_1_COLOR = new THREE.Color(config.nebula1Color);

const NEBULA_2_COLOR = new THREE.Color(config.nebula2Color);

const hash21 = Fn(([p]: [ReturnType<typeof vec2>]) =>
  fract(sin(dot(p, vec2(127.1, 311.7))).mul(43758.5453))
);

const hash31 = Fn(([p]: [ReturnType<typeof vec3>]) =>
  fract(sin(dot(p, vec3(127.1, 311.7, 74.7))).mul(43758.5453))
);

const hash22 = Fn(([p]: [ReturnType<typeof vec2>]) => {
  const x = fract(sin(dot(p, vec2(127.1, 311.7))).mul(43758.5453));

  const y = fract(sin(dot(p, vec2(269.5, 183.3))).mul(43758.5453));

  return vec2(x, y);
});

const noise3D = Fn(([p]: [ReturnType<typeof vec3>]) => {
  const i = floor(p);
  const f = fract(p);

  const u = f.mul(f).mul(float(3).sub(f.mul(2)));

  const a = hash31(i);
  const b = hash31(i.add(vec3(1, 0, 0)));
  const c = hash31(i.add(vec3(0, 1, 0)));
  const d = hash31(i.add(vec3(1, 1, 0)));
  const e = hash31(i.add(vec3(0, 0, 1)));
  const f2 = hash31(i.add(vec3(1, 0, 1)));
  const g = hash31(i.add(vec3(0, 1, 1)));
  const h = hash31(i.add(vec3(1, 1, 1)));

  return mix(
    mix(mix(a, b, u.x), mix(c, d, u.x), u.y),
    mix(mix(e, f2, u.x), mix(g, h, u.x), u.y),
    u.z
  );
});

const fbm = Fn(
  ([p, lacunarity, persistence]: [
    ReturnType<typeof vec3>,
    ReturnType<typeof float>,
    ReturnType<typeof float>
  ]) => {
    const value = float(0).toVar();
    const amplitude = float(0.5).toVar();
    const pos = p.toVar();

    value.addAssign(noise3D(pos).mul(amplitude));

    pos.mulAssign(lacunarity);
    amplitude.mulAssign(persistence);
    value.addAssign(noise3D(pos).mul(amplitude));

    pos.mulAssign(lacunarity);
    amplitude.mulAssign(persistence);
    value.addAssign(noise3D(pos).mul(amplitude));

    pos.mulAssign(lacunarity);
    amplitude.mulAssign(persistence);
    value.addAssign(noise3D(pos).mul(amplitude));

    return value;
  }
);

const fbm3 = Fn(
  ([p, lacunarity, persistence]: [
    ReturnType<typeof vec3>,
    ReturnType<typeof float>,
    ReturnType<typeof float>
  ]) => {
    const value = float(0).toVar();
    const amplitude = float(0.5).toVar();
    const pos = p.toVar();

    value.addAssign(noise3D(pos).mul(amplitude));

    pos.mulAssign(lacunarity);
    amplitude.mulAssign(persistence);
    value.addAssign(noise3D(pos).mul(amplitude));

    pos.mulAssign(lacunarity);
    amplitude.mulAssign(persistence);
    value.addAssign(noise3D(pos).mul(amplitude));

    return value;
  }
);

const blackbodyColor = Fn(([tempK]: [ReturnType<typeof float>]) => {
  const t = clamp(tempK.sub(1000).div(9000), float(0), float(1));

  const red = clamp(float(1).sub(t.sub(0.8).mul(2)), float(0.5), float(1));

  const green = smoothstep(float(0), float(0.5), t).mul(
    float(1).sub(t.sub(0.7).mul(0.3).max(0))
  );

  const blue = smoothstep(float(0.3), float(1), t).mul(t);

  return vec3(red, green, blue);
});

export default function BlackHoleScroll({
                                          blackHoleTravel = 50,
                                          blackHoleSizeMultiplier = 1,
                                          starTravel = 1.15,
                                          className,
                                          dragSensitivity = -0.008,
                                          dragYSensitivity = -0.3,
                                          blackHoleTravelX = 0,
                                          blackHoleTravelY = blackHoleTravel,
                                          blackHoleTravelZ = 0,
                                          blackHolePositionXPercent = 0,
                                          blackHolePositionYPercent = 0,
                                          blackHolePositionZ = 0,
                                          blackHoleRotation = 0,
                                          lowGraphics = false,
                                        }: BlackHoleScrollProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    // Reduced glow for phones and for anyone who ticked "weaker graphics".
    const reduceBloom = isMobile || lowGraphics;

    let disposed = false;
    let frameId = 0;

    let lastRenderTime = 0;
    let isScrolling = false;
    let scrollTimeout = 0;

    let postProcessing: THREE.PostProcessing | null = null;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 1000);

    camera.position.copy(CAM_POS);
    camera.lookAt(CAM_TARGET);

    const renderer = new THREE.WebGPURenderer({
      antialias: false,
    });

    renderer.setPixelRatio(lowGraphics ? LOW_GRAPHICS_RESOLUTION_SCALE : 1);

    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const uniforms = {
      blackHoleSizeMultiplier: uniform(blackHoleSizeMultiplier),

      cycleTime: uniform(0),

      cameraRayScale: uniform(new THREE.Vector2(0, 0)),

      blackHolePosition: uniform(new THREE.Vector3()),

      starScroll: uniform(0),

      spinMatrix: uniform(new THREE.Matrix3()),

      inverseSpinMatrix: uniform(new THREE.Matrix3()),
    };

    const starField = Fn(([rayDir]: [ReturnType<typeof vec3>]) => {
      const theta = atan(rayDir.z, rayDir.x);

      const phi = asin(clamp(rayDir.y, float(-1), float(1))).sub(
        uniforms.starScroll
      );

      const gridScale = float(60 / config.starSize);

      const scaled = vec2(theta, phi).mul(gridScale);

      const cell = floor(scaled);
      const cellUV = fract(scaled);

      const cellHash = hash21(cell);

      const starProb = step(float(1 - config.starDensity), cellHash);

      const starPos = hash22(cell.add(42)).mul(0.8).add(0.1);

      const dist = length(cellUV.sub(starPos));

      const size = hash21(cell.add(100))
        .mul(0.03)
        .add(0.01)
        .mul(config.starSize);

      const core = smoothstep(size, float(0), dist);

      const glow = smoothstep(size.mul(3), float(0), dist).mul(0.3);

      const intensity = core.add(glow).mul(starProb);

      const temp = hash21(cell.add(200));

      const color = mix(vec3(0.8, 0.9, 1), vec3(1, 0.95, 0.8), temp);

      return color.mul(intensity).mul(config.starBrightness);
    });

    const nebulaField = Fn(([rayDir]: [ReturnType<typeof vec3>]) => {
      const n1 = fbm3(rayDir.mul(config.nebula1Scale), float(2), float(0.5))
        .mul(2)
        .sub(1);

      const layer1 = clamp(n1.add(config.nebula1Density), float(0), float(1));

      const color1 = vec3(NEBULA_1_COLOR.r, NEBULA_1_COLOR.g, NEBULA_1_COLOR.b)
        .mul(layer1)
        .mul(config.nebula1Brightness);

      const n2 = fbm3(rayDir.mul(config.nebula2Scale), float(2), float(0.5))
        .mul(2)
        .sub(1);

      const layer2 = clamp(n2.add(config.nebula2Density), float(0), float(1));

      const color2 = vec3(NEBULA_2_COLOR.r, NEBULA_2_COLOR.g, NEBULA_2_COLOR.b)
        .mul(layer2)
        .mul(config.nebula2Brightness);

      return color1.add(color2);
    });

    const accretionDiskColor = Fn(
      ([hitR, hitAngle, rayDir, innerR, outerR]: [
        ReturnType<typeof float>,
        ReturnType<typeof float>,
        ReturnType<typeof vec3>,
        ReturnType<typeof float>,
        ReturnType<typeof float>
      ]) => {
        const normR = clamp(
          hitR.sub(innerR).div(outerR.sub(innerR)),
          float(0),
          float(1)
        );

        const peakTemp = float(config.diskTemperature * 1000);

        const tempFalloff = pow(innerR.div(hitR), config.temperatureFalloff);

        const tempK = mix(float(1500), peakTemp, tempFalloff);

        const diskColor = blackbodyColor(tempK).toVar();

        const rotationSign = float(Math.sign(config.diskRotationSpeed));

        const velocityDir = vec3(
          sin(hitAngle).negate().mul(rotationSign),
          0,
          cos(hitAngle).mul(rotationSign)
        );

        const velocityMagnitude = sqrt(innerR.div(hitR));

        const beta = velocityMagnitude.mul(0.3);

        const cosTheta = dot(velocityDir, rayDir);

        const dopplerFactor = float(1).div(float(1).sub(beta.mul(cosTheta)));

        const dopplerBoost = pow(
          dopplerFactor,
          float(3 * config.dopplerStrength)
        );

        diskColor.mulAssign(clamp(dopplerBoost, float(0.1), float(5)));

        const edgeFalloff = smoothstep(
          float(0),
          config.diskEdgeSoftnessInner,
          normR
        ).mul(
          smoothstep(float(1), float(1 - config.diskEdgeSoftnessOuter), normR)
        );

        const blendFactor = uniforms.cycleTime.div(config.turbulenceCycleTime);

        const radiusPower = hitR.mul(sqrt(hitR));

        const phase1 = uniforms.cycleTime
          .mul(config.diskRotationSpeed)
          .div(radiusPower);

        const phaseCycle = float(
          config.turbulenceCycleTime * config.diskRotationSpeed
        ).div(radiusPower);

        const angle1 = hitAngle.add(phase1);

        const angle2 = angle1.add(phaseCycle);

        const stretch = float(Math.max(config.turbulenceStretch, 0.1));

        const noise1 = vec3(
          hitR.mul(config.turbulenceScale),
          cos(angle1).div(stretch),
          sin(angle1).div(stretch)
        );

        const noise2 = vec3(
          hitR.mul(config.turbulenceScale),
          cos(angle2).div(stretch),
          sin(angle2).div(stretch)
        );

        const turbulence1 = fbm(
          noise1,
          config.turbulenceLacunarity,
          config.turbulencePersistence
        );

        const turbulence2 = fbm(
          noise2,
          config.turbulenceLacunarity,
          config.turbulencePersistence
        );

        const turbulence = mix(turbulence2, turbulence1, blendFactor);

        const opacity = pow(
          clamp(turbulence, float(0), float(1)),
          config.turbulenceSharpness
        );

        return vec4(
          diskColor.mul(config.diskBrightness),
          opacity.mul(edgeFalloff)
        );
      }
    );

    const blackHoleShader = Fn(() => {
      const rs = float(config.blackHoleMass * 2).mul(
        uniforms.blackHoleSizeMultiplier
      );

      const innerR = float(config.diskInnerRadius).mul(
        uniforms.blackHoleSizeMultiplier
      );

      const outerR = float(config.diskOuterRadius).mul(
        uniforms.blackHoleSizeMultiplier
      );

      const uv = screenUV;
      const camForward = vec3(CAM_FORWARD.x, CAM_FORWARD.y, CAM_FORWARD.z);

      const camRight = vec3(CAM_RIGHT.x, CAM_RIGHT.y, CAM_RIGHT.z);

      const camUp = vec3(CAM_UP.x, CAM_UP.y, CAM_UP.z);

      const camPos = vec3(CAM_POS.x, CAM_POS.y, CAM_POS.z);

      const centeredUV = uv.mul(2).sub(1);

      const screenX = centeredUV.x.mul(uniforms.cameraRayScale.x);

      const screenY = centeredUV.y.mul(uniforms.cameraRayScale.y);

      const worldRayDir = normalize(
        camForward.add(camRight.mul(screenX)).add(camUp.mul(screenY))
      ).toVar();

      const rayPos = uniforms.spinMatrix
        .mul(camPos.sub(uniforms.blackHolePosition))
        .toVar();

      const rayDir = normalize(uniforms.spinMatrix.mul(worldRayDir)).toVar();

      const prevPos = rayPos.toVar();

      const color = vec3(0, 0, 0).toVar();

      const alpha = float(0).toVar();

      const escaped = float(0).toVar();

      const captured = float(0).toVar();

      const stepSize = float(config.stepSize);

      const lensing = float(config.gravitationalLensing);

      /*
			 * Important:
			 * Loop(40) is intentionally preserved.
			 */
      Loop(40, () => {
        If(
          captured
            .greaterThan(0.5)
            .or(escaped.greaterThan(0.5))
            .or(alpha.greaterThan(0.99)),
          () => Break()
        );

        const rSq = dot(rayPos, rayPos);

        const captureRadiusSq = rs.mul(rs).mul(1.0201);

        If(rSq.lessThan(captureRadiusSq), () => {
          captured.assign(1);
          Break();
        });

        If(rSq.greaterThan(700), () => {
          escaped.assign(1);
          Break();
        });

        const invR = float(1).div(sqrt(rSq));

        const toCenter = rayPos.negate().mul(invR);

        const bendStrength = rs.mul(invR).mul(invR).mul(stepSize).mul(lensing);

        rayDir.addAssign(toCenter.mul(bendStrength));

        rayDir.assign(normalize(rayDir));

        prevPos.assign(rayPos);

        rayPos.addAssign(rayDir.mul(stepSize));

        const crossedPlane = prevPos.y.mul(rayPos.y).lessThan(0);

        If(crossedPlane.and(alpha.lessThan(0.99)), () => {
          const t = prevPos.y.negate().div(rayPos.y.sub(prevPos.y));

          const hitPos = mix(prevPos, rayPos, t);

          const hitR = sqrt(hitPos.x.mul(hitPos.x).add(hitPos.z.mul(hitPos.z)));

          const inDisk = hitR.greaterThan(innerR).and(hitR.lessThan(outerR));

          If(inDisk, () => {
            const diskResult = accretionDiskColor(
              hitR,
              atan(hitPos.z, hitPos.x),
              rayDir,
              innerR,
              outerR
            );

            const remaining = float(1).sub(alpha);

            color.addAssign(diskResult.xyz.mul(diskResult.w).mul(remaining));

            alpha.addAssign(remaining.mul(diskResult.w));
          });
        });
      });

      If(captured.lessThan(0.5), () => {
        escaped.assign(1);
      });

      If(escaped.greaterThan(0.5).and(alpha.lessThan(0.99)), () => {
        const bg = vec3(
          STAR_BACKGROUND_COLOR.r,
          STAR_BACKGROUND_COLOR.g,
          STAR_BACKGROUND_COLOR.b
        ).toVar();

        const finalWorldRayDir = normalize(
          uniforms.inverseSpinMatrix.mul(rayDir)
        );

        if (config.starsEnabled) {
          bg.addAssign(starField(finalWorldRayDir));
        }

        if (config.nebulaEnabled) {
          bg.addAssign(nebulaField(finalWorldRayDir));
        }

        color.addAssign(bg.mul(float(1).sub(alpha)));
      });

      return vec4(pow(color, vec3(1 / 2.2)), 1);
    })();

    const geometry = new THREE.SphereGeometry(100, 12, 12);

    geometry.scale(-1, 1, 1);

    const material = new THREE.MeshBasicNodeMaterial();

    material.colorNode = blackHoleShader;

    const mesh = new THREE.Mesh(geometry, material);

    mesh.frustumCulled = false;

    scene.add(mesh);

    viewport.appendChild(renderer.domElement);

    let viewportWidth = 1;
    let viewportHeight = 1;

    const cachedRect = {
      left: 0,
      top: 0,
      width: 1,
      height: 1,
    };

    const baseBlackHolePosition = new THREE.Vector3();

    const travelVectorX = new THREE.Vector3();

    const travelVectorY = new THREE.Vector3();

    const blackHolePosition = new THREE.Vector3();

    const projectedBlackHolePosition = new THREE.Vector3();

    let maxScroll = 1;
    let scrollProgress = 0;

    const updateScrollRange = () => {
      maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
    };

    const rebuildBlackHolePositionBasis = () => {
      const depth = Math.abs(camera.position.z - blackHolePositionZ);

      const worldHeight = 2 * TAN_HALF_FOV * depth;

      const worldWidth = worldHeight * camera.aspect;

      const baseX = (blackHolePositionXPercent / 100) * worldWidth;

      const baseY = (blackHolePositionYPercent / 100) * worldHeight;

      baseBlackHolePosition
        .set(0, 0, blackHolePositionZ)
        .addScaledVector(CAM_RIGHT, baseX)
        .addScaledVector(CAM_UP, baseY);

      travelVectorX
        .copy(CAM_RIGHT)
        .multiplyScalar((blackHoleTravelX / 100) * worldWidth);

      travelVectorY
        .copy(CAM_UP)
        .multiplyScalar((blackHoleTravelY / 100) * worldHeight);
    };

    const END_TRANSITION_START = 0.88;
    const END_BLACK_HOLE_DISTANCE = 0.12;
    const END_INTERACTION_LOCK_PROGRESS = 0.97;
    const endBlackHoleTarget = CAM_POS.clone().addScaledVector(
      CAM_FORWARD,
      END_BLACK_HOLE_DISTANCE
    );

    const updateBlackHolePosition = (progress: number) => {
      const endProgress = THREE.MathUtils.smoothstep(
        progress,
        END_TRANSITION_START,
        1
      );

      blackHolePosition
        .copy(baseBlackHolePosition)
        .addScaledVector(travelVectorX, progress)
        .addScaledVector(travelVectorY, progress);

      blackHolePosition.z += blackHoleTravelZ * progress;

      if (endProgress > 0) {
        blackHolePosition.lerp(endBlackHoleTarget, endProgress);
      }

      uniforms.blackHolePosition.value.copy(blackHolePosition);
    };

    const resize = () => {
      viewportWidth = Math.max(1, viewport.clientWidth);

      viewportHeight = Math.max(1, viewport.clientHeight || window.innerHeight);

      camera.aspect = viewportWidth / viewportHeight;

      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();

      renderer.setSize(viewportWidth, viewportHeight);

      uniforms.cameraRayScale.value.set(
        camera.aspect * TAN_HALF_FOV,
        TAN_HALF_FOV
      );

      const rect = viewport.getBoundingClientRect();

      cachedRect.left = rect.left;

      cachedRect.top = rect.top;

      cachedRect.width = rect.width;

      cachedRect.height = rect.height;

      updateScrollRange();

      rebuildBlackHolePositionBasis();

      updateBlackHolePosition(scrollProgress);

      uniforms.starScroll.value = -scrollProgress * starTravel;

      hoverDirty = true;

      publishBlackHoleScreenPosition();
    };

    const blackHoleScreenPosition = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    const publishBlackHoleScreenPosition = () => {
      projectedBlackHolePosition.copy(blackHolePosition).project(camera);

      const projectedX =
        (projectedBlackHolePosition.x + 1) * 0.5 * viewportWidth;

      blackHoleScreenPosition.x = viewportWidth - projectedX;

      blackHoleScreenPosition.y =
        (projectedBlackHolePosition.y + 1) * 0.5 * viewportHeight;

      window.dispatchEvent(
        new CustomEvent("blackhole-position", {
          detail: {
            x: blackHoleScreenPosition.x,
            y: blackHoleScreenPosition.y,
          },
        })
      );
    };

    const onScroll = () => {
      updateScrollRange();

      const nextProgress = THREE.MathUtils.clamp(
        window.scrollY / maxScroll,
        0,
        1
      );

      if (nextProgress !== scrollProgress) {
        scrollProgress = nextProgress;

        updateBlackHolePosition(scrollProgress);

        uniforms.starScroll.value = -scrollProgress * starTravel;

        hoverDirty = true;
      }

      isScrolling = true;

      window.clearTimeout(scrollTimeout);

      scrollTimeout = window.setTimeout(() => {
        isScrolling = false;
      }, 100);
    };

    const spinQuaternion = new THREE.Quaternion();

    const cursorTiltTarget = { yaw: 0, pitch: 0 };
    const cursorTiltCurrent = { yaw: 0, pitch: 0 };
    const MAX_CURSOR_TILT = THREE.MathUtils.degToRad(3);
    const CURSOR_TILT_SMOOTHING = 10000;

    const DEFAULT_DISK_ROTATION = 180;

    spinQuaternion.setFromAxisAngle(
      CAM_FORWARD,
      THREE.MathUtils.degToRad(DEFAULT_DISK_ROTATION + blackHoleRotation)
    );

    const angularVelocity = {
      yaw: 0,
      pitch: 0,
    };

    const MAX_ANGULAR_VELOCITY = 25;
    const MOMENTUM_DAMPING = 0.05;
    const MOMENTUM_EPSILON = 0.001;

    const tempQuatA = new THREE.Quaternion();

    const tempQuatB = new THREE.Quaternion();

    const tempQuatInv = new THREE.Quaternion();

    const combinedSpinQuaternion = new THREE.Quaternion();

    const tempMatrixLocal = new THREE.Matrix4();

    const tempMatrixWorld = new THREE.Matrix4();

    let spinDirty = true;

    let lastPointerX = window.innerWidth / 2;

    let lastPointerY = window.innerHeight / 2;

    let lastMoveTime = performance.now();

    const applySpinDelta = (yawDelta: number, pitchDelta: number) => {
      if (yawDelta === 0 && pitchDelta === 0) {
        return;
      }

      tempQuatA.setFromAxisAngle(CAM_UP, yawDelta);

      tempQuatB.setFromAxisAngle(CAM_RIGHT, pitchDelta);

      tempQuatA.multiply(tempQuatB);

      spinQuaternion.premultiply(tempQuatA);

      spinDirty = true;
    };

    const updateSpinMatrixUniform = () => {
      tempQuatA.setFromAxisAngle(CAM_UP, cursorTiltCurrent.yaw);
      tempQuatB.setFromAxisAngle(CAM_RIGHT, cursorTiltCurrent.pitch);
      tempQuatA.multiply(tempQuatB);

      combinedSpinQuaternion.copy(spinQuaternion).premultiply(tempQuatA);

      tempQuatInv.copy(combinedSpinQuaternion).invert();

      tempMatrixLocal.makeRotationFromQuaternion(tempQuatInv);

      uniforms.spinMatrix.value.setFromMatrix4(tempMatrixLocal);

      tempMatrixWorld.makeRotationFromQuaternion(combinedSpinQuaternion);

      uniforms.inverseSpinMatrix.value.setFromMatrix4(tempMatrixWorld);

      spinDirty = false;
    };

    const pointer = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    let isOverBlackHole = false;
    let isDragging = false;

    let hoverDirty = true;

    const setCursor = (value: string) => {
      document.body.style.cursor = value;
    };

    const isEndTakeoverActive = () =>
      scrollProgress >= END_INTERACTION_LOCK_PROGRESS;

    const updateCursorTiltTarget = (clientX: number, clientY: number) => {
      if (isMobile || isEndTakeoverActive()) return;

      const x = THREE.MathUtils.clamp(
        (clientX - blackHoleScreenPosition.x) /
        Math.max(viewportWidth * 0.45, 1),
        -1,
        1
      );
      const y = THREE.MathUtils.clamp(
        (clientY - blackHoleScreenPosition.y) /
        Math.max(viewportHeight * 0.45, 1),
        -1,
        1
      );

      cursorTiltTarget.yaw = -x * MAX_CURSOR_TILT;
      cursorTiltTarget.pitch = y * MAX_CURSOR_TILT;
    };

    const rayPosTest = new THREE.Vector3();

    const rayDirTest = new THREE.Vector3();

    const relativeTest = new THREE.Vector3();

    const toCenterTest = new THREE.Vector3();

    const isPointerInsideBlackHole = () => {
      const rectWidth = cachedRect.width;

      const rectHeight = cachedRect.height;

      if (rectWidth <= 0 || rectHeight <= 0) {
        return false;
      }

      const localX = pointer.x - cachedRect.left;

      const localY = pointer.y - cachedRect.top;

      const normX = localX / rectWidth;

      const normY = localY / rectHeight;

      if (normX < 0 || normX > 1 || normY < 0 || normY > 1) {
        return false;
      }

      const uvX = (normX - 0.5) * 2;

      const uvY = (normY - 0.5) * 2;

      const aspect = rectWidth / rectHeight;

      const screenX = uvX * aspect * TAN_HALF_FOV;

      const screenY = uvY * TAN_HALF_FOV;

      rayDirTest
        .copy(CAM_FORWARD)
        .addScaledVector(CAM_RIGHT, screenX)
        .addScaledVector(CAM_UP, screenY)
        .normalize();

      rayPosTest.copy(camera.position);

      const rs = config.blackHoleMass * 2 * blackHoleSizeMultiplier;

      const captureRadius = rs * 1.01;

      for (let i = 0; i < 45; i++) {
        relativeTest.copy(rayPosTest).sub(blackHolePosition);

        const r = relativeTest.length();

        if (r < captureRadius) {
          return true;
        }

        if (r > 100) {
          return false;
        }

        toCenterTest.copy(blackHolePosition).sub(rayPosTest).divideScalar(r);

        const bendStrength =
          (rs / (r * r)) * config.stepSize * config.gravitationalLensing;

        rayDirTest.addScaledVector(toCenterTest, bendStrength).normalize();

        rayPosTest.addScaledVector(rayDirTest, config.stepSize);
      }

      return false;
    };

    const refreshHover = () => {
      hoverDirty = false;

      if (isEndTakeoverActive()) {
        isOverBlackHole = false;
        if (isDragging) {
          isDragging = false;
        }
        setCursor("");
        return false;
      }

      const captured = isPointerInsideBlackHole();

      if (captured !== isOverBlackHole) {
        isOverBlackHole = captured;

        if (!isDragging) {
          setCursor(captured ? "pointer" : "");
        }
      }

      return isOverBlackHole;
    };

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;

      updateCursorTiltTarget(e.clientX, e.clientY);

      hoverDirty = true;

      if (!isDragging) {
        return;
      }

      const now = performance.now();

      const dt = Math.max((now - lastMoveTime) / 1000, 1 / 240);

      const dx = e.clientX - lastPointerX;

      const dy = e.clientY - lastPointerY;

      const yawDelta = dx * dragSensitivity;

      const pitchDelta = dy * dragSensitivity * dragYSensitivity;

      applySpinDelta(yawDelta, pitchDelta);

      angularVelocity.yaw = THREE.MathUtils.clamp(
        yawDelta / dt,
        -MAX_ANGULAR_VELOCITY,
        MAX_ANGULAR_VELOCITY
      );

      angularVelocity.pitch = THREE.MathUtils.clamp(
        pitchDelta / dt,
        -MAX_ANGULAR_VELOCITY,
        MAX_ANGULAR_VELOCITY
      );

      lastPointerX = e.clientX;

      lastPointerY = e.clientY;

      lastMoveTime = now;
    };

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.("[data-no-blackhole]")) return;
      if (e.button !== 0) {
        return;
      }

      if (isMobile || isEndTakeoverActive()) {
        return;
      }

      pointer.x = e.clientX;
      pointer.y = e.clientY;

      updateCursorTiltTarget(e.clientX, e.clientY);

      if (!refreshHover()) {
        return;
      }

      isDragging = true;

      lastPointerX = e.clientX;

      lastPointerY = e.clientY;

      lastMoveTime = performance.now();

      angularVelocity.yaw = 0;
      angularVelocity.pitch = 0;

      setCursor("grabbing");

      e.preventDefault();
      e.stopPropagation();
    };

    const endDrag = () => {
      if (!isDragging) {
        return;
      }

      isDragging = false;

      if (isEndTakeoverActive()) {
        setCursor("");
        return;
      }

      if (hoverDirty) {
        refreshHover();
      }

      setCursor(isOverBlackHole ? "pointer" : "");
    };

    let cycleTime = 0;
    let lastFrameTime = performance.now();

    const animate = () => {
      if (disposed) {
        return;
      }

      frameId = requestAnimationFrame(animate);

      const now = performance.now();

      const renderInterval = isScrolling
        ? 1000 / 30
        : 1000 / 60;

      if (now - lastRenderTime >= renderInterval) {
        lastRenderTime = now;

        if (postProcessing) {
          postProcessing.render();
        } else {
          renderer.render(scene, camera);
        }
      }

      const deltaTime = Math.min((now - lastFrameTime) / 1000, 0.033);

      lastFrameTime = now;

      const tiltAlpha = 1 - Math.exp(-CURSOR_TILT_SMOOTHING * deltaTime);

      const nextYaw = THREE.MathUtils.lerp(
        cursorTiltCurrent.yaw,
        cursorTiltTarget.yaw,
        tiltAlpha
      );
      const nextPitch = THREE.MathUtils.lerp(
        cursorTiltCurrent.pitch,
        cursorTiltTarget.pitch,
        tiltAlpha
      );

      if (
        nextYaw !== cursorTiltCurrent.yaw ||
        nextPitch !== cursorTiltCurrent.pitch
      ) {
        cursorTiltCurrent.yaw = nextYaw;
        cursorTiltCurrent.pitch = nextPitch;
        spinDirty = true;
      }

      cycleTime += deltaTime;

      if (cycleTime >= config.turbulenceCycleTime) {
        cycleTime -= config.turbulenceCycleTime;
      }

      uniforms.cycleTime.value = cycleTime;

      if (isEndTakeoverActive()) {
        if (isDragging) {
          isDragging = false;
        }
        angularVelocity.yaw = 0;
        angularVelocity.pitch = 0;
        cursorTiltTarget.yaw = 0;
        cursorTiltTarget.pitch = 0;
        if (cursorTiltCurrent.yaw !== 0 || cursorTiltCurrent.pitch !== 0) {
          cursorTiltCurrent.yaw = 0;
          cursorTiltCurrent.pitch = 0;
          spinDirty = true;
        }
        setCursor("");
      } else if (!isDragging) {
        const speed = Math.hypot(angularVelocity.yaw, angularVelocity.pitch);

        if (speed > MOMENTUM_EPSILON) {
          applySpinDelta(
            angularVelocity.yaw * deltaTime,
            angularVelocity.pitch * deltaTime
          );

          const decay = Math.pow(MOMENTUM_DAMPING, deltaTime);

          angularVelocity.yaw *= decay;

          angularVelocity.pitch *= decay;

          if (Math.abs(angularVelocity.yaw) < MOMENTUM_EPSILON) {
            angularVelocity.yaw = 0;
          }

          if (Math.abs(angularVelocity.pitch) < MOMENTUM_EPSILON) {
            angularVelocity.pitch = 0;
          }
        }
      }

      if (spinDirty) {
        updateSpinMatrixUniform();
      }

      if (!isDragging && hoverDirty) {
        refreshHover();
      }

      publishBlackHoleScreenPosition();

      if (postProcessing) {
        postProcessing.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    resize();

    window.addEventListener("resize", resize);

    window.addEventListener("scroll", onScroll, { passive: true });

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    window.addEventListener("pointerdown", onPointerDown, {
      capture: true,
      passive: false,
    });

    window.addEventListener("pointerup", endDrag, { passive: true });

    window.addEventListener("pointercancel", endDrag, { passive: true });

    let documentResizeObserver: ResizeObserver | null = null;

    if (typeof ResizeObserver !== "undefined") {
      documentResizeObserver = new ResizeObserver(() => {
        updateScrollRange();

        const nextProgress = THREE.MathUtils.clamp(
          window.scrollY / maxScroll,
          0,
          1
        );

        if (nextProgress !== scrollProgress) {
          scrollProgress = nextProgress;

          updateBlackHolePosition(scrollProgress);

          uniforms.starScroll.value = -scrollProgress * starTravel;

          hoverDirty = true;
        }
      });

      documentResizeObserver.observe(document.documentElement);
    }

    updateSpinMatrixUniform();

    renderer
      .init()
      .then(() => {
        if (disposed) {
          return;
        }

        postProcessing = new THREE.PostProcessing(renderer);

        const scenePass = pass(scene, camera);

        const sceneColor = scenePass.getTextureNode();

        const bloomPass = bloom(sceneColor);

        bloomPass.threshold.value = config.bloomThreshold;

        bloomPass.strength.value = reduceBloom
          ? config.bloomStrength * 0.2
          : config.bloomStrength * 0.7;

        bloomPass.radius.value = config.bloomRadius;

        postProcessing.outputNode = sceneColor.add(bloomPass);

        animate();
      })
      .catch((error) => {
        console.error("WebGPU init failed:", error);

        if (!disposed) {
          viewport.innerHTML = `
  <div
    style="
      height:100%;
      display:grid;
      place-items:center;
      color:#fff;
      background:#000;
      font:16px system-ui,sans-serif
    "
  >
    WebGPU is not supported in this browser.
  </div>
  `;
        }
      });

    return () => {
      disposed = true;

      cancelAnimationFrame(frameId);

      documentResizeObserver?.disconnect();

      window.removeEventListener("resize", resize);

      window.removeEventListener("scroll", onScroll);

      window.removeEventListener("pointermove", onPointerMove);

      window.removeEventListener("pointerdown", onPointerDown, {
        capture: true,
      });

      window.removeEventListener("pointerup", endDrag);

      window.removeEventListener("pointercancel", endDrag);

      if (isOverBlackHole || isDragging) {
        setCursor("");
      }

      geometry.dispose();
      material.dispose();
      renderer.dispose();

      viewport.replaceChildren();
    };
  }, [
    blackHoleTravel,
    starTravel,
    dragSensitivity,
    dragYSensitivity,
    blackHoleTravelX,
    blackHoleTravelY,
    blackHoleTravelZ,
    blackHolePositionXPercent,
    blackHolePositionYPercent,
    blackHolePositionZ,
    blackHoleRotation,
    blackHoleSizeMultiplier,
    lowGraphics,
  ]);

  return (
    <section
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <div
        ref={viewportRef}
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      />
    </section>
  );
}