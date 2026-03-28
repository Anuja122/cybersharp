import { vec3 } from 'gl-matrix';

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles = 10000;

  constructor() {
    this.initializeRain();
  }

  private initializeRain() {
    const rainCount = 2000;
    const spawnRadius = 100;

    for (let i = 0; i < rainCount; i++) {
      this.particles.push({
        position: vec3.fromValues(
          (Math.random() - 0.5) * spawnRadius * 2,
          Math.random() * 50 + 20,
          (Math.random() - 0.5) * spawnRadius * 2
        ),
        velocity: vec3.fromValues(
          Math.random() * 0.5 - 0.25,
          -20 - Math.random() * 5,
          Math.random() * 0.5 - 0.25
        ),
        life: 1.0,
        maxLife: 1.0,
        size: 0.05 + Math.random() * 0.05,
        color: vec3.fromValues(0.7, 0.8, 1.0),
        type: 'rain',
      });
    }
  }

  update(deltaTime: number, playerPos: vec3) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      particle.position[0] += particle.velocity[0] * deltaTime;
      particle.position[1] += particle.velocity[1] * deltaTime;
      particle.position[2] += particle.velocity[2] * deltaTime;

      particle.life -= deltaTime / particle.maxLife;

      if (particle.type === 'rain') {
        if (particle.position[1] < 0) {
          particle.position[1] = 50 + Math.random() * 20;
          particle.position[0] = playerPos[0] + (Math.random() - 0.5) * 200;
          particle.position[2] = playerPos[2] + (Math.random() - 0.5) * 200;
          particle.life = 1.0;
        }
      } else if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  emit(config: ParticleEmitConfig) {
    const count = config.count || 1;

    for (let i = 0; i < count && this.particles.length < this.maxParticles; i++) {
      const velocity = vec3.create();

      if (config.direction) {
        vec3.copy(velocity, config.direction);
        vec3.scale(velocity, velocity, config.speed || 1.0);
      } else {
        velocity[0] = (Math.random() - 0.5) * (config.spread || 1.0);
        velocity[1] = (Math.random() - 0.5) * (config.spread || 1.0);
        velocity[2] = (Math.random() - 0.5) * (config.spread || 1.0);
        vec3.scale(velocity, velocity, config.speed || 1.0);
      }

      this.particles.push({
        position: vec3.clone(config.position),
        velocity,
        life: 1.0,
        maxLife: config.lifetime || 1.0,
        size: config.size || 0.1,
        color: config.color || vec3.fromValues(1, 1, 1),
        type: config.type || 'generic',
      });
    }
  }

  emitExplosion(position: vec3, intensity: number = 1.0) {
    this.emit({
      position,
      count: Math.floor(50 * intensity),
      speed: 10 * intensity,
      spread: 1.0,
      lifetime: 0.5,
      size: 0.2,
      color: vec3.fromValues(1.0, 0.5, 0.0),
      type: 'explosion',
    });
  }

  emitSparks(position: vec3, direction: vec3) {
    this.emit({
      position,
      direction,
      count: 10,
      speed: 5,
      spread: 0.5,
      lifetime: 0.3,
      size: 0.05,
      color: vec3.fromValues(1.0, 0.9, 0.3),
      type: 'spark',
    });
  }

  emitBlood(position: vec3, direction: vec3) {
    this.emit({
      position,
      direction,
      count: 15,
      speed: 3,
      spread: 0.8,
      lifetime: 0.8,
      size: 0.1,
      color: vec3.fromValues(0.8, 0.1, 0.1),
      type: 'blood',
    });
  }

  getParticles(): Particle[] {
    return this.particles;
  }
}

export interface Particle {
  position: vec3;
  velocity: vec3;
  life: number;
  maxLife: number;
  size: number;
  color: vec3;
  type: string;
}

export interface ParticleEmitConfig {
  position: vec3;
  direction?: vec3;
  count?: number;
  speed?: number;
  spread?: number;
  lifetime?: number;
  size?: number;
  color?: vec3;
  type?: string;
}
