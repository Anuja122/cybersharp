import { vec3 } from 'gl-matrix';
import { Renderer } from '../renderer/Renderer';
import { Camera } from '../player/Camera';
import { PipelineManager } from '../renderer/PipelineManager';
import { CityGenerator } from './CityGenerator';

export class World {
  private renderer: Renderer;
  private cityGenerator: CityGenerator;
  private buildings: Building[] = [];
  private lights: Light[] = [];

  constructor(renderer: Renderer) {
    this.renderer = renderer;
    this.cityGenerator = new CityGenerator();
  }

  async generate() {
    console.log('🏙️ Generating cyberpunk city...');

    const cityData = this.cityGenerator.generate(50, 50);
    this.buildings = cityData.buildings;
    this.lights = cityData.lights;

    console.log(`Generated ${this.buildings.length} buildings and ${this.lights.length} lights`);
  }

  update(deltaTime: number, playerPos: vec3) {
    this.lights.forEach(light => {
      light.intensity = 1.0 + Math.sin(performance.now() / 1000 + light.position[0]) * 0.2;
    });
  }

  render(renderPass: GPURenderPassEncoder, camera: Camera, pipelineManager: PipelineManager) {
  }

  getGroundLevel(x: number, z: number): number {
    return 0;
  }

  raycast(origin: vec3, direction: vec3, maxDistance: number): RaycastHit | null {
    return null;
  }
}

export interface Building {
  position: vec3;
  size: vec3;
  color: vec3;
  emissive: number;
}

export interface Light {
  position: vec3;
  color: vec3;
  intensity: number;
  radius: number;
}

export interface RaycastHit {
  point: vec3;
  normal: vec3;
  distance: number;
}
