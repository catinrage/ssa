import type { OperationEnum, Prisma, SetupSheet } from '@prisma/client';
import { ModelSetupSheet } from './setupSheet.svelte';
import { Helper } from '$lib/helpers';
import * as XLSX from 'xlsx';
import { SSAErrorUnknownOperation } from '$lib/error';
import { browser } from '$app/environment';
import { untrack } from 'svelte';
import { ModelSetupSheetTool, ModelSetupSheetToolGroup } from './tool.svelte';

export type ProjectManagerSortOptions = {
  order: 'asc' | 'desc';
  column:
    | 'name'
    | 'price'
    | 'diameter'
    | 'need'
    | 'relationalDurability'
    | 'cost'
    | 'usage.rough'
    | 'usage.drilling'
    | 'usage.face_milling'
    | 'usage.semi-finish'
    | 'usage.finish'
    | 'usage.total'
    | 'none';
};

export type ProjectManagerData = {
  id: string;
  scale: number;
  setupSheets: SetupSheet[];
  groups: Prisma.GroupGetPayload<{
    include: {
      tools: true;
      durability: true;
    };
  }>[];
};

export class ProjectManager {
  public id: string;
  public scale: number = $state(1);
  public sortOptions: ProjectManagerSortOptions = $state({
    column: 'none',
    order: 'asc',
  });
  public setupSheets: ModelSetupSheet[] = $state([]);
  public mergedSetupSheet: ModelSetupSheet | null = $derived.by(() => {
    if (this.unIgnoredSetupSheets.length === 0) {
      return null;
    }
    const mergedSetupSheet = new ModelSetupSheet();
    mergedSetupSheet.name = 'MERGED';
    for (const setupSheet of this.unIgnoredSetupSheets) {
      mergedSetupSheet.merge(setupSheet, setupSheet.scale * this.scale);
    }

    untrack(() => {
      this.groups.forEach((group) => {
        const toolGroup = new ModelSetupSheetToolGroup({
          id: group.id,
          diameter: group.diameter,
          name: group.name,
        });
        toolGroup.price = group.price;
        toolGroup.durability = {
          ROUGH: group.durability?.rough ?? 0,
          DRILLING: group.durability?.drilling ?? 0,
          FACE_MILLING: group.durability?.faceMilling ?? 0,
          SEMI_FINISH: group.durability?.semiFinish ?? 0,
          FINISH: group.durability?.finish ?? 0,
        };
        mergedSetupSheet.tools.forEach((tool) => {
          if (group.tools.map((tool) => tool.name).includes(tool.name)) {
            toolGroup.addTool(tool);
          }
        });
        if (toolGroup.tools.length) {
          mergedSetupSheet.tools.push(toolGroup);
          toolGroup.tools.forEach((tool) => {
            // mergedSetupSheet.tools = mergedSetupSheet.tools.filter((t) => t !== tool);
          });
        }
      });
    });

    return mergedSetupSheet;
  });
  public groups: ProjectManagerData['groups'] = $state([]);
  public selectedTools: ModelSetupSheetTool[] = $state([]);

  constructor({ id, setupSheets, groups, scale }: ProjectManagerData) {
    this.id = id;
    this.groups = groups;
    this.scale = scale;
    if (browser)
      for (const setupSheet of setupSheets) {
        const instance = this.loadSetupSheet(setupSheet.content, setupSheet.fileName);
        instance.scale = setupSheet.scale;
        instance.ignored = setupSheet.ignored;
        instance.setId(setupSheet.id);
      }

    $effect(() => {
      this.mergedSetupSheet;
      untrack(() => {
        this.sortBy(this.sortOptions.column, this.sortOptions.order);
      });
    });
  }

  get unIgnoredSetupSheets() {
    return this.setupSheets.filter((setupSheet) => setupSheet.ignored === false);
  }

  getSetupSheetById(id: string) {
    return this.setupSheets.find((setupSheet) => setupSheet.id === id);
  }

  loadSetupSheet(content: string, fileName: string) {
    const parser = new DOMParser();
    const dom = parser.parseFromString(content as string, 'text/html');
    const setupSheet = new ModelSetupSheet(dom, fileName);
    this.setupSheets.push(setupSheet);
    return setupSheet;
  }

  async addSetupSheet(content: string, fileName: string) {
    try {
      const setupSheet = this.loadSetupSheet(content, fileName);
      const response = await fetch(`/api/project/${this.id}/setupSheet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: setupSheet.name,
          fileName: setupSheet.fileName,
          content: content,
        }),
      });
      const result = (await response.json()) as {
        success: boolean;
        id: string;
      };
      setupSheet!.setId(result.id);
    } catch (error) {
      if (error instanceof SSAErrorUnknownOperation) {
        console.log(error.data.operation);
      }
    }
  }

  async deleteAllSetupSheets() {
    for (const setupSheet of this.setupSheets) {
      await this.deleteSetupSheet(setupSheet.id);
    }
  }

  async deleteSetupSheet(id: string) {
    const setupSheet = this.setupSheets.find((setupSheet) => setupSheet.id === id);
    if (!setupSheet) return;
    await fetch(`/api/setupSheet/${setupSheet.id}`, {
      method: 'DELETE',
    });
    this.setupSheets = this.setupSheets.filter((setupSheet) => setupSheet.id !== id);
  }

  async ignoreSetupSheet(id: string) {
    const setupSheet = this.setupSheets.find((setupSheet) => setupSheet.id === id);
    if (setupSheet) {
      await setupSheet.ignore();
    }
  }

  async ignoreAllExcept(id: string) {
    for (const setupSheet of this.setupSheets) {
      if (setupSheet.id !== id) await setupSheet.ignore();
    }
    const target = this.getSetupSheetById(id);
    if (target) await target.unIgnore();
  }

  async unIgnoreSetupSheet(id: string) {
    const setupSheet = this.getSetupSheetById(id);
    if (setupSheet) {
      await setupSheet.unIgnore();
    }
  }

  highlightSetupSheet(id: string) {
    const setupSheet = this.getSetupSheetById(id);
    if (setupSheet) {
      setupSheet.highlight();
    }
  }

  unHighlightSetupSheet(id: string) {
    const setupSheet = this.getSetupSheetById(id);
    if (setupSheet) {
      setupSheet.unHighlight();
    }
  }

  unHighlightAllSetupSheets() {
    for (const setupSheet of this.setupSheets) {
      setupSheet.unHighlight();
    }
  }

  async setScale(scale: number) {
    this.scale = scale;
    await fetch(`/api/project/${this.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scale,
      }),
    });
  }

  sortBy(
    column: ProjectManagerSortOptions['column'],
    order: ProjectManagerSortOptions['order'],
  ) {
    if (!this.mergedSetupSheet) return;
    this.sortOptions = { column, order };

    this.mergedSetupSheet.tools = this.mergedSetupSheet.tools.toSorted((a, b) => {
      let comparison = 0;

      switch (column) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'diameter':
          comparison = (a.diameter ?? -1) - (b.diameter ?? -1);
          break;
        case 'price':
          comparison = (a.price ?? -1) - (b.price ?? -1);
          break;
        case 'need':
          comparison = (a.need ?? -1) - (b.need ?? -1);
          break;
        case 'relationalDurability':
          comparison = (a.relationalDurability ?? -1) - (b.relationalDurability ?? -1);
          break;
        case 'cost':
          comparison = (a.cost ?? -1) - (b.cost ?? -1);
          break;
        case 'usage.rough':
          comparison = a.usage.ROUGH - b.usage.ROUGH;
          break;
        case 'usage.drilling':
          comparison = a.usage.DRILLING - b.usage.DRILLING;
          break;
        case 'usage.face_milling':
          comparison = a.usage.FACE_MILLING - b.usage.FACE_MILLING;
          break;
        case 'usage.semi-finish':
          comparison = a.usage.SEMI_FINISH - b.usage.SEMI_FINISH;
          break;
        case 'usage.finish':
          comparison = a.usage.FINISH - b.usage.FINISH;
          break;
        case 'usage.total':
          comparison =
            Object.values(a.usage).reduce((sum, val) => sum + val, 0) -
            Object.values(b.usage).reduce((sum, val) => sum + val, 0);
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return order === 'asc' ? comparison : -comparison;
    });
  }

  updateToolData(
    name: string,
    { price, durability }: { price: number; durability: Record<OperationEnum, number> },
  ) {
    this.mergedSetupSheet?.tools.forEach((tool) => {
      if (tool.name === name) {
        tool.price = price;
        tool.durability = durability;
        tool.registered = true;
      }
    });
  }

  exportToExcel() {
    const records = this.mergedSetupSheet?.tools.map((tool) => {
      return {
        'نام ابزار': tool.name,
        قطر: tool.diameter,
        قیمت: Helper.Currency.formatCurrency(tool.price ?? 0) + ' تومان ',
        نیاز: Number(tool.need),
        'عمر نسبی': Number((1 / Number(tool.need)).toFixed(2)),
        هزینه: tool.cost ? Helper.Currency.formatCurrency(tool.cost) + ' تومان ' : '-',
      };
    });

    if (!records) return;

    const data = records.map((record) => ({
      ...record,
      نیاز: record['نیاز'] === Infinity ? '-' : record['نیاز'],
      'عمر نسبی': record['عمر نسبی'] === Infinity ? '-' : record['عمر نسبی'],
    }));

    // Convert JSON data to worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths and RTL direction
    ws['!cols'] = [
      { wch: 25 },
      { wch: 10 },
      { wch: 15 },
      { wch: 10 },
      { wch: 10 },
      { wch: 20 },
    ];
    ws['!dir'] = 'rtl';

    // Apply padding, alignment, and bold styling
    Object.keys(ws).forEach((cell) => {
      if (cell[0] === '!') return; // Skip metadata keys

      const isHeader = cell.match(/[A-Z]1/); // Check if it's a header cell
      ws[cell].s = {
        font: {
          name: 'Arial',
          sz: isHeader ? 14 : 12,
          bold: isHeader, // Apply bold only for header cells
          color: { rgb: isHeader ? 'FFFFFF' : '000000' },
        },
        alignment: {
          vertical: 'center',
          horizontal: isHeader ? 'center' : cell.startsWith('A') ? 'left' : 'right',
          wrapText: true,
          indent: 1, // Adds padding to all cells
        },
        fill: isHeader ? { fgColor: { rgb: '4F81BD' } } : undefined,
        border: {
          top: { style: 'thin', color: { rgb: 'DDDDDD' } },
          bottom: { style: 'thin', color: { rgb: 'DDDDDD' } },
          left: { style: 'thin', color: { rgb: 'DDDDDD' } },
          right: { style: 'thin', color: { rgb: 'DDDDDD' } },
        },
      };
    });

    // Set row height for header
    ws['!rows'] = [{ hpx: 25 }];

    // Create workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Define filename and write the workbook
    const filename = 'data.xlsx';
    XLSX.writeFile(wb, filename);
  }

  async groupSelectedTools() {
    // if all of selected tools diameter is different we show an error :
    const diameters = this.selectedTools.map((tool) => tool.diameter);
    const allSameDiameter = diameters.every((diameter) => diameter === diameters[0]);
    if (!allSameDiameter) {
      alert('قطر تمام ابزارهای انتخاب شده باید یکسان باشد.');
      return;
    }

    // if al selected tools are not registered (they must have an id) we show an error :
    const allRegistered = this.selectedTools.every((tool) => tool.registered);
    if (!allRegistered) {
      alert('تمام ابزارهای انتخاب شده باید ثبت شده باشند.');
      return;
    }

    const name = prompt('نام گروه را وارد کنید : ');
    if (!name) return;
    const data = {
      projectId: this.id,
      name,
      tools: this.selectedTools.map((tool) => tool.name),
    };
    const response = await fetch('/api/group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      return true;
    }
    return false;
  }
}
