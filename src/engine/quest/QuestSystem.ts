import { vec3 } from 'gl-matrix';

export class QuestSystem {
  private activeQuests: Quest[] = [];
  private completedQuests: Quest[] = [];
  private questLog: QuestLogEntry[] = [];

  constructor() {
    this.initializeStarterQuests();
  }

  private initializeStarterQuests() {
    this.addQuest({
      id: 'welcome-to-night-city',
      title: 'Welcome to Night City',
      description: 'Explore the streets and discover what the city has to offer.',
      type: 'main',
      objectives: [
        {
          id: 'explore',
          description: 'Walk 100 meters',
          completed: false,
          progress: 0,
          required: 100,
        },
      ],
      rewards: {
        experience: 100,
        money: 500,
        items: [],
      },
      status: 'active',
      location: vec3.fromValues(0, 0, 0),
    });
  }

  addQuest(quest: Quest) {
    this.activeQuests.push(quest);
    this.addLogEntry({
      questId: quest.id,
      message: `New quest: ${quest.title}`,
      timestamp: Date.now(),
    });
  }

  updateObjectiveProgress(questId: string, objectiveId: string, progress: number) {
    const quest = this.activeQuests.find(q => q.id === questId);
    if (!quest) return;

    const objective = quest.objectives.find(o => o.id === objectiveId);
    if (!objective) return;

    objective.progress = Math.min(progress, objective.required);

    if (objective.progress >= objective.required) {
      objective.completed = true;
      this.checkQuestCompletion(quest);
    }
  }

  private checkQuestCompletion(quest: Quest) {
    const allCompleted = quest.objectives.every(obj => obj.completed);

    if (allCompleted) {
      this.completeQuest(quest);
    }
  }

  private completeQuest(quest: Quest) {
    const index = this.activeQuests.indexOf(quest);
    if (index > -1) {
      this.activeQuests.splice(index, 1);
    }

    quest.status = 'completed';
    this.completedQuests.push(quest);

    this.addLogEntry({
      questId: quest.id,
      message: `Quest completed: ${quest.title}`,
      timestamp: Date.now(),
    });
  }

  getActiveQuests(): Quest[] {
    return this.activeQuests;
  }

  getCompletedQuests(): Quest[] {
    return this.completedQuests;
  }

  getQuestLog(): QuestLogEntry[] {
    return this.questLog;
  }

  private addLogEntry(entry: QuestLogEntry) {
    this.questLog.unshift(entry);
    if (this.questLog.length > 100) {
      this.questLog.pop();
    }
  }

  update(deltaTime: number, playerPos: vec3) {
    this.activeQuests.forEach(quest => {
      if (quest.type === 'main' && quest.id === 'welcome-to-night-city') {
        const objective = quest.objectives[0];
        if (!objective.completed) {
          objective.progress += vec3.length([deltaTime, 0, 0]) * 5;
          if (objective.progress >= objective.required) {
            objective.completed = true;
            this.checkQuestCompletion(quest);
          }
        }
      }
    });
  }
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'main' | 'side' | 'gig';
  objectives: QuestObjective[];
  rewards: QuestRewards;
  status: 'active' | 'completed' | 'failed';
  location?: vec3;
}

export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  progress: number;
  required: number;
}

export interface QuestRewards {
  experience: number;
  money: number;
  items: string[];
}

export interface QuestLogEntry {
  questId: string;
  message: string;
  timestamp: number;
}
