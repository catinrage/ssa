import { FLAGS, SELECTORS } from '$lib/config';
import { OperationEnum } from '@prisma/client';
import { ModelSetupSheetTool, type SetupSheetToolProperties } from './tool.svelte';
import { SSAErrorCorruptedFile, SSAErrorUnknownOperation } from '$lib/error';
import { untrack } from 'svelte';

export class ModelSetupSheet {
  private _id: string;

  public name: string;
  public fileName: string;
  public tools: ModelSetupSheetTool[] = $state([]);
  public ignored: boolean = $state(false);
  public highlighted: boolean = $state(false);
  public scale: number = $state(1);

  constructor(dom?: Document, fileName?: string) {
    this.fileName = fileName ?? 'NONE';
    if (dom) {
      this.scanName(dom);
      this.scanTools(dom);
      this.scanTimes(dom);
    }
  }

  private _convertRawOperationTypeToEnum(raw: string) {
    for (const operation of Object.values(OperationEnum)) {
      if (
        FLAGS[operation].some((flag) => raw.toLowerCase().startsWith(flag.toLowerCase()))
      ) {
        return operation;
      }
    }
  }

  setId(id: string) {
    this._id = id;
  }

  get id() {
    return this._id;
  }

  saveTool(toolProperties: Omit<SetupSheetToolProperties, 'usage'>) {
    const newTool = new ModelSetupSheetTool(toolProperties);
    newTool.sources.push(this);
    this.tools.push(newTool);
  }

  getToolById(id: string) {
    return this.tools.find((tool) => tool.id === id);
  }

  getToolByName(name: string) {
    return this.tools.find((tool) => tool.name === name);
  }

  scanName(dom: Document) {
    const nameTag = dom.querySelector(SELECTORS['SETUP-SHEET-NAME']);
    if (nameTag) {
      this.name = nameTag.innerHTML;
    } else {
      throw new SSAErrorCorruptedFile({
        description: 'Setup sheet name not found',
        file: this.fileName,
      });
    }
  }

  scanTools(dom: Document) {
    const toolIdTags = dom.querySelectorAll(SELECTORS['TOOL-ID']);
    const toolNameTags = dom.querySelectorAll(SELECTORS['TOOL-NAME']);
    const diameterTags = dom.querySelectorAll(SELECTORS['TOOL-DIAMETER']);
    for (let i = 0; i < toolIdTags.length; i++) {
      const id = toolIdTags[i].innerHTML;
      const name = toolNameTags[i].innerHTML;
      const diameter = Number(diameterTags[i].innerHTML);
      this.saveTool({
        id,
        name,
        diameter,
      });
    }
  }

  scanTimes(dom: Document) {
    const toolIdTags = dom.querySelectorAll(SELECTORS['OPERATION-TOOL-ID']);
    const operationTypeTags = dom.querySelectorAll(SELECTORS['OPERATION-TYPE']);
    const timeTags = dom.querySelectorAll(SELECTORS['OPERATION-TIME']);

    for (let i = 0; i < timeTags.length; i++) {
      const toolId = toolIdTags[i].innerHTML;
      const rawOperationType = operationTypeTags[i].innerHTML;
      const timeString = timeTags[i].innerHTML;

      const timeParts = timeString.split(':');
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      const seconds = parseInt(timeParts[2], 10);
      const durationInSeconds = hours * 3600 + minutes * 60 + seconds;

      const tool = this.getToolById(toolId);
      if (!tool) {
        throw new SSAErrorCorruptedFile({
          description: 'Tool ID not found',
          file: this.fileName,
        });
      }
      const operationType = this._convertRawOperationTypeToEnum(rawOperationType);
      if (!operationType) {
        throw new SSAErrorUnknownOperation({
          operation: rawOperationType,
          file: this.fileName,
        });
      }
      tool.addUsage(operationType, durationInSeconds);
    }
  }

  merge(other: ModelSetupSheet, usageMultiplier = 1) {
    untrack(() => {
      for (const otherTool of other.tools) {
        const existingTool = this.getToolByName(otherTool.name);
        if (existingTool) {
          for (const operation of Object.keys(existingTool.usage) as OperationEnum[]) {
            existingTool.usage[operation] += otherTool.usage[operation] * usageMultiplier;
          }
          existingTool.sources.push(other);
        } else {
          const clonedTool = otherTool.clone(usageMultiplier);
          clonedTool.sources.push(this);
          this.tools.push(clonedTool);
        }
      }
    });
  }

  async ignore() {
    this.ignored = true;
    await fetch(`/api/setupSheet/${this.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ignored: true,
      }),
    });
  }

  async unIgnore() {
    this.ignored = false;
    await fetch(`/api/setupSheet/${this.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ignored: false,
      }),
    });
  }

  async setScale(scale: number) {
    this.scale = scale;
    await fetch(`/api/setupSheet/${this.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scale,
      }),
    });
  }

  highlight() {
    this.highlighted = true;
  }

  unHighlight() {
    this.highlighted = false;
  }
}
