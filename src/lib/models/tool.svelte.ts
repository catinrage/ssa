import type { OperationEnum } from '@prisma/client';
import type { ModelSetupSheet } from './setupSheet.svelte';

export type SetupSheetToolProperties = {
  id: string;
  name: string;
  diameter: number;
  usage: Record<OperationEnum, number>;
};

export class ModelSetupSheetTool {
  public id: string;
  public name: string;
  public diameter: number;
  public price: number | undefined = $state(undefined);
  public durability: Record<OperationEnum, number> = $state({
    ROUGH: 0,
    DRILLING: 0,
    FACE_MILLING: 0,
    SEMI_FINISH: 0,
    FINISH: 0,
  });
  public usage: Record<OperationEnum, number> = $state({
    ROUGH: 0,
    DRILLING: 0,
    FACE_MILLING: 0,
    SEMI_FINISH: 0,
    FINISH: 0,
  });
  public need: number | undefined = $derived.by(() => {
    let need = 0;
    for (const key of Object.keys(this.usage) as Array<keyof typeof this.usage>) {
      if (this.usage[key]) {
        if (!this.durability[key]) {
          return undefined;
        }
        need += this.usage[key] / (this.durability[key] * 60);
      }
    }
    return Number(need.toFixed(4));
  });
  public relationalDurability: number | undefined = $derived.by(() => {
    if (this.need) {
      return Number((1 / this.need).toFixed(4));
    }
    return undefined;
  });
  public cost: number | undefined = $derived.by(() => {
    if (this.need) {
      return this.need * (this.price ?? 0);
    }
    return undefined;
  });

  public sources: ModelSetupSheet[] = $state([]);

  public registered = $state(false);

  constructor({ id, name, diameter }: Omit<SetupSheetToolProperties, 'usage'>) {
    this.id = id;
    this.name = name;
    this.diameter = diameter;
  }

  addUsage(operation: OperationEnum, durationInSeconds: number) {
    this.usage[operation] += durationInSeconds;
  }

  clone(usageMultiplier = 1): ModelSetupSheetTool {
    const clonedTool = new ModelSetupSheetTool({
      id: this.id,
      name: this.name,
      diameter: this.diameter,
    });
    for (const [operation, duration] of Object.entries(this.usage)) {
      clonedTool.addUsage(operation as OperationEnum, duration * usageMultiplier);
    }
    this.sources.forEach((source) => clonedTool.sources.push(source));
    return clonedTool;
  }
}

export class ModelSetupSheetToolGroup extends ModelSetupSheetTool {
  tools: ModelSetupSheetTool[] = $state([]);

  public need: number | undefined = $derived.by(() => {
    let need = 0;
    for (const tool of this.tools) {
      console.log(tool.name, tool.need);
      if (tool.need === undefined) {
        return undefined;
      }
      need += tool.need;
    }
    return Number(need.toFixed(4));
  });

  addTool(tool: ModelSetupSheetTool) {
    for (const operation in tool.usage) {
      this.addUsage(operation as OperationEnum, tool.usage[operation as OperationEnum]);
    }
    this.tools.push(tool);
  }
}
