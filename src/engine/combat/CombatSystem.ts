import { vec3 } from 'gl-matrix';
import { World, RaycastHit } from '../world/World';
import { RPGSystem } from '../rpg/RPGSystem';
import { AudioEngine } from '../audio/AudioEngine';

export class CombatSystem {
  private world: World;
  private rpgSystem: RPGSystem;
  private audioEngine: AudioEngine;
  private equippedWeapon: Weapon | null = null;
  private enemies: Enemy[] = [];

  constructor(world: World, rpgSystem: RPGSystem, audioEngine: AudioEngine) {
    this.world = world;
    this.rpgSystem = rpgSystem;
    this.audioEngine = audioEngine;

    this.equippedWeapon = this.createDefaultWeapon();
  }

  private createDefaultWeapon(): Weapon {
    return {
      id: 'pistol-001',
      name: 'M-10AF Lexington',
      type: 'pistol',
      damage: 25,
      fireRate: 0.3,
      maxAmmo: 30,
      currentAmmo: 30,
      reserveAmmo: 90,
      reloadTime: 1.5,
      range: 100,
      isReloading: false,
      lastFireTime: 0,
    };
  }

  fire(origin: vec3, direction: vec3): boolean {
    if (!this.equippedWeapon) return false;

    const now = performance.now() / 1000;
    if (now - this.equippedWeapon.lastFireTime < this.equippedWeapon.fireRate) {
      return false;
    }

    if (this.equippedWeapon.isReloading) return false;

    if (this.equippedWeapon.currentAmmo <= 0) {
      this.reload();
      return false;
    }

    this.equippedWeapon.currentAmmo--;
    this.equippedWeapon.lastFireTime = now;

    this.audioEngine.playSound('weapon-fire', origin, 0.8);

    const hit = this.world.raycast(origin, direction, this.equippedWeapon.range);

    if (hit) {
      this.handleHit(hit);
    }

    return true;
  }

  reload() {
    if (!this.equippedWeapon || this.equippedWeapon.isReloading) return;
    if (this.equippedWeapon.currentAmmo === this.equippedWeapon.maxAmmo) return;
    if (this.equippedWeapon.reserveAmmo <= 0) return;

    this.equippedWeapon.isReloading = true;

    setTimeout(() => {
      if (this.equippedWeapon) {
        const ammoNeeded = this.equippedWeapon.maxAmmo - this.equippedWeapon.currentAmmo;
        const ammoToReload = Math.min(ammoNeeded, this.equippedWeapon.reserveAmmo);

        this.equippedWeapon.currentAmmo += ammoToReload;
        this.equippedWeapon.reserveAmmo -= ammoToReload;
        this.equippedWeapon.isReloading = false;

        this.audioEngine.playSound('weapon-reload');
      }
    }, this.equippedWeapon.reloadTime * 1000);
  }

  private handleHit(hit: RaycastHit) {
    const damage = this.calculateDamage();

    const enemy = this.findEnemyAtPosition(hit.point);
    if (enemy) {
      this.damageEnemy(enemy, damage);
    }

    this.audioEngine.playSound('impact', hit.point, 0.6);
  }

  private calculateDamage(): number {
    if (!this.equippedWeapon) return 0;

    const baseDamage = this.equippedWeapon.damage;
    const critChance = 0.15;
    const isCrit = Math.random() < critChance;

    return isCrit ? baseDamage * 2 : baseDamage;
  }

  private findEnemyAtPosition(position: vec3): Enemy | null {
    for (const enemy of this.enemies) {
      const distance = vec3.distance(enemy.position, position);
      if (distance < 1.0) {
        return enemy;
      }
    }
    return null;
  }

  private damageEnemy(enemy: Enemy, damage: number) {
    enemy.health -= damage;

    if (enemy.health <= 0) {
      this.killEnemy(enemy);
    }
  }

  private killEnemy(enemy: Enemy) {
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies.splice(index, 1);
    }

    this.rpgSystem.addExperience(50);
    this.rpgSystem.addMoney(25);
  }

  getEquippedWeapon(): Weapon | null {
    return this.equippedWeapon;
  }

  update(deltaTime: number) {
    this.enemies.forEach(enemy => {
      this.updateEnemyAI(enemy, deltaTime);
    });
  }

  private updateEnemyAI(enemy: Enemy, deltaTime: number) {
  }

  addEnemy(position: vec3): Enemy {
    const enemy: Enemy = {
      id: `enemy-${Date.now()}-${Math.random()}`,
      position,
      health: 100,
      maxHealth: 100,
      type: 'grunt',
      state: 'patrol',
    };

    this.enemies.push(enemy);
    return enemy;
  }

  getEnemies(): Enemy[] {
    return this.enemies;
  }
}

export interface Weapon {
  id: string;
  name: string;
  type: 'pistol' | 'rifle' | 'shotgun' | 'smg' | 'sniper';
  damage: number;
  fireRate: number;
  maxAmmo: number;
  currentAmmo: number;
  reserveAmmo: number;
  reloadTime: number;
  range: number;
  isReloading: boolean;
  lastFireTime: number;
}

export interface Enemy {
  id: string;
  position: vec3;
  health: number;
  maxHealth: number;
  type: string;
  state: 'patrol' | 'alert' | 'combat' | 'dead';
}
