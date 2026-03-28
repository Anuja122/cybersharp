import { vec3 } from 'gl-matrix';
import { Building, Light } from './World';

export class CityGenerator {
  generate(width: number, depth: number): CityData {
    const buildings: Building[] = [];
    const lights: Light[] = [];

    const blockSize = 20;
    const streetWidth = 8;
    const gridSize = blockSize + streetWidth;

    for (let x = -width / 2; x < width / 2; x++) {
      for (let z = -depth / 2; z < depth / 2; z++) {
        if (Math.random() > 0.3) {
          const buildingHeight = 10 + Math.random() * 40;
          const buildingWidth = 8 + Math.random() * 12;
          const buildingDepth = 8 + Math.random() * 12;

          const posX = x * gridSize + (Math.random() - 0.5) * 5;
          const posZ = z * gridSize + (Math.random() - 0.5) * 5;

          const isNeon = Math.random() > 0.7;
          const color = isNeon
            ? this.getRandomNeonColor()
            : vec3.fromValues(0.2, 0.2, 0.25);

          buildings.push({
            position: vec3.fromValues(posX, buildingHeight / 2, posZ),
            size: vec3.fromValues(buildingWidth, buildingHeight, buildingDepth),
            color,
            emissive: isNeon ? 0.8 : 0.0,
          });

          if (isNeon) {
            for (let i = 0; i < 3; i++) {
              lights.push({
                position: vec3.fromValues(
                  posX + (Math.random() - 0.5) * buildingWidth,
                  buildingHeight * 0.5 + Math.random() * buildingHeight * 0.3,
                  posZ + (Math.random() - 0.5) * buildingDepth
                ),
                color,
                intensity: 1.0,
                radius: 15 + Math.random() * 10,
              });
            }
          }
        }
      }
    }

    for (let i = 0; i < 200; i++) {
      lights.push({
        position: vec3.fromValues(
          (Math.random() - 0.5) * width * gridSize,
          2 + Math.random() * 5,
          (Math.random() - 0.5) * depth * gridSize
        ),
        color: this.getRandomNeonColor(),
        intensity: 0.8,
        radius: 8,
      });
    }

    return { buildings, lights };
  }

  private getRandomNeonColor(): vec3 {
    const colors = [
      vec3.fromValues(1.0, 0.94, 0.0),
      vec3.fromValues(0.0, 0.96, 1.0),
      vec3.fromValues(1.0, 0.0, 0.24),
      vec3.fromValues(0.6, 0.0, 1.0),
      vec3.fromValues(0.0, 1.0, 0.5),
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

export interface CityData {
  buildings: Building[];
  lights: Light[];
}
