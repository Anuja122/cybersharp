export class RPGSystem {
  private playerStats: PlayerStats;
  private inventory: InventoryItem[] = [];
  private quests: Quest[] = [];

  constructor() {
    this.playerStats = {
      level: 1,
      experience: 0,
      experienceToNext: 1000,

      attributes: {
        body: 5,
        reflexes: 5,
        technicalAbility: 5,
        intelligence: 5,
        cool: 5,
      },

      maxHealth: 100,
      currentHealth: 100,
      maxStamina: 100,
      currentStamina: 100,

      money: 1000,
      streetCred: 0,
    };
  }

  getPlayerStats(): PlayerStats {
    return this.playerStats;
  }

  addExperience(amount: number) {
    this.playerStats.experience += amount;

    while (this.playerStats.experience >= this.playerStats.experienceToNext) {
      this.levelUp();
    }
  }

  private levelUp() {
    this.playerStats.level++;
    this.playerStats.experience -= this.playerStats.experienceToNext;
    this.playerStats.experienceToNext = Math.floor(this.playerStats.experienceToNext * 1.5);

    this.playerStats.maxHealth += 10;
    this.playerStats.currentHealth = this.playerStats.maxHealth;

    console.log(`Level up! Now level ${this.playerStats.level}`);
  }

  takeDamage(amount: number) {
    this.playerStats.currentHealth = Math.max(0, this.playerStats.currentHealth - amount);
  }

  heal(amount: number) {
    this.playerStats.currentHealth = Math.min(
      this.playerStats.maxHealth,
      this.playerStats.currentHealth + amount
    );
  }

  addMoney(amount: number) {
    this.playerStats.money += amount;
  }

  removeMoney(amount: number): boolean {
    if (this.playerStats.money >= amount) {
      this.playerStats.money -= amount;
      return true;
    }
    return false;
  }

  addItem(item: InventoryItem) {
    this.inventory.push(item);
  }

  removeItem(itemId: string): boolean {
    const index = this.inventory.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.inventory.splice(index, 1);
      return true;
    }
    return false;
  }

  getInventory(): InventoryItem[] {
    return this.inventory;
  }
}

export interface PlayerStats {
  level: number;
  experience: number;
  experienceToNext: number;

  attributes: {
    body: number;
    reflexes: number;
    technicalAbility: number;
    intelligence: number;
    cool: number;
  };

  maxHealth: number;
  currentHealth: number;
  maxStamina: number;
  currentStamina: number;

  money: number;
  streetCred: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  value: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward;
  status: 'active' | 'completed' | 'failed';
}

export interface QuestObjective {
  description: string;
  completed: boolean;
}

export interface QuestReward {
  experience: number;
  money: number;
  items: InventoryItem[];
}
