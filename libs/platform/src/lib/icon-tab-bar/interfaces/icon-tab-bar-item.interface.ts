// This is extended TabConfig with special fields
import { TabConfig } from './tab-config.interface';

export interface IconTabBarItem extends TabConfig {
    index: number; // order in the array
    /*
    * unique key and hash map at the same time.
    * It is generated by parent uId(if it has parent and own index)
    * e.g If tab has uId 1 it means that tab is located in root array and has index #1
    * e.g If tab has uId 3.4 it means that tab is located as subTab inside tab with index #3 and has index #4
    */
    uId: string;
    cssClasses: string[];
    hidden?: boolean; // This field actual for overflow mode, when some tabs should be hidden
    subItems?: IconTabBarItem[];
}