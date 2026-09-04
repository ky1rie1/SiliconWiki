import { HardwareItem } from '../types';
import { cpuList } from './hardware/cpus';
import { gpuList } from './hardware/gpus';
import { motherboardList } from './hardware/motherboards';
import { ramList } from './hardware/ram';
import { storageList } from './hardware/storage';
import { psuList } from './hardware/psu';
import { coolerList } from './hardware/coolers';
import { caseList } from './hardware/cases';
import { laptopList } from './hardware/laptops';

export const hardwareList: HardwareItem[] = [
  ...cpuList,
  ...gpuList,
  ...motherboardList,
  ...ramList,
  ...storageList,
  ...psuList,
  ...coolerList,
  ...caseList,
  ...laptopList,
];
