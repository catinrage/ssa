import type { OperationEnum } from '@prisma/client';

export const SELECTORS = {
  'SETUP-SHEET-NAME': 'table:first-of-type td:nth-of-type(2) span',
  'TOOL-ID':
    'table:nth-of-type(5) > tbody > tr > td > table > tbody > tr:nth-of-type(1) > td:nth-of-type(3n-2) > span:nth-of-type(1)',
  'TOOL-NAME':
    'table:nth-of-type(5) > tbody > tr > td > table > tbody > tr:nth-of-type(1) > td:nth-of-type(3n-2) > span:nth-of-type(6)',
  'TOOL-DIAMETER':
    'table:nth-of-type(5) > tbody > tr > td > table > tbody > tr:nth-of-type(2) > td:nth-of-type(1) > span:nth-of-type(16n+2)',
  'OPERATION-TYPE':
    'table:nth-of-type(7) > tbody > tr:nth-of-type(5n+1) > td:nth-of-type(2) > span:nth-of-type(2)',
  'OPERATION-TIME':
    'table:nth-of-type(7) > tbody > tr:nth-of-type(5n+2) > td:last-of-type span',
  'OPERATION-TOOL-ID':
    'table:nth-of-type(7) > tbody > tr:nth-of-type(5n+3) > td:first-of-type span',
};

export const FLAGS = {
  ROUGH: [
    'R_',
    'THSR',
    'I3DROUGH',
    'IROUGH',
    'IMACHINING',
    'IREST',
    'TURBO_CZ',
    'S_TURBO',
    'IMT_',
    'TSLOT',
  ],
  SEMI_FINISH: ['SEMI_', 'S_HSM'],
  FINISH: [
    'HSS',
    'HSM',
    'F_',
    'P_',
    'F3D',
    'BN2Z2',
    'FINI',
    'DEBUR',
    'ENGCALL1',
    'ENGCALL2',
    'ENGCALL3',
    'ENGCALL4',
    'ENGCALL5',
    'ENGCALL6',
    'ENGCALL7',
    'ENGCALL8',
  ],
  DRILLING: ['D_', 'SPOT', 'REAMER', 'THM_DRILL'],
  FACE_MILLING: ['FM_'],
} satisfies Record<OperationEnum, string[]>;
