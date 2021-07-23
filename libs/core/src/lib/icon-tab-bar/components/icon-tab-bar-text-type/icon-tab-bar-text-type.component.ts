import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { IconTabBarClass } from '../../icon-tab-bar.class';
import { IconTabBarItem, IconTabBarSubItem } from '../../types';
import { UNIQUE_KEY_SEPARATOR } from '../../constants';
import { OverflowItemsDirective } from '../../../utils/directives/overflow-items/overflow-items.directive';
import { ExtraButtonDirective } from '../../directives/extra-button/extra-button.directive';
import { FdDnDEvent } from '../../dnd/dnd-container.directive';


interface ItemToReplace {
    arr: IconTabBarItem[],
    item: IconTabBarItem,
    parentUid: string,
}

@Component({
    selector: 'fd-icon-tab-bar-text-type',
    templateUrl: './icon-tab-bar-text-type.component.html',
    styleUrls: ['./icon-tab-bar-text-type.component.scss']
})
export class IconTabBarTextTypeComponent extends IconTabBarClass implements OnInit {

    @ViewChild(OverflowItemsDirective)
    overflowDirective: OverflowItemsDirective;

    @ViewChild(ExtraButtonDirective)
    extraBtnDirective: ExtraButtonDirective;

    @Input()
    maxNestingLevel = 0;

    @Input()
    enableTabReordering = false;

    constructor(
        protected _cd: ChangeDetectorRef
    ) {
        super(_cd);
    }

    selectExtraItem(selectedItem: IconTabBarItem | IconTabBarSubItem): void {
        // Check if selected item is subItem
        // Then to find root tab, and pass it to parent method.
        if (selectedItem.uniqueKey.includes(UNIQUE_KEY_SEPARATOR)) {
            const rootTabUniqueKey = selectedItem.uniqueKey.split(UNIQUE_KEY_SEPARATOR)[0];
            selectedItem = this.tabs.find(tab => tab.uniqueKey === rootTabUniqueKey);
        }
        super.selectExtraItem(selectedItem as IconTabBarItem);
    }

    onDrop({ draggableItem, replacedItem }: FdDnDEvent<IconTabBarItem>): void {
        const replacedParsedUidArr = replacedItem.uniqueKey.split(UNIQUE_KEY_SEPARATOR);
        replacedParsedUidArr.length = replacedParsedUidArr.length - 1;
        const draggableParsedUidArr = draggableItem.uniqueKey.split(UNIQUE_KEY_SEPARATOR);
        draggableParsedUidArr.length = draggableParsedUidArr.length - 1;

        const newArr = this._getParentArrByUid(replacedItem.uniqueKey);
        const previousArr = this._getParentArrByUid(draggableItem.uniqueKey);

        this.replaceItems({
            replacedItemInfo: {
                arr: newArr,
                item: replacedItem,
                parentUid: replacedParsedUidArr.length ? replacedParsedUidArr.join(UNIQUE_KEY_SEPARATOR) : ''
            },
            draggableItemInfo: {
                arr: previousArr,
                item: draggableItem,
                parentUid: draggableParsedUidArr.length ? draggableParsedUidArr.join(UNIQUE_KEY_SEPARATOR) : ''
            },
        });
    }


    _getParentArrByUid(uid: string, arr: any[] = this.tabs): IconTabBarItem[] {
        let result;
        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            if (item.uniqueKey === uid) {
                result = arr;
                break;
            } else if (Array.isArray(item.subItems)) {
                result = this._getParentArrByUid(uid, item.subItems);
                if (result) {
                    break;

                }
            }
        }
        return result;
    }



    replaceItems({ replacedItemInfo, draggableItemInfo }: { replacedItemInfo: ItemToReplace, draggableItemInfo: ItemToReplace }): void {
        draggableItemInfo.arr.splice(draggableItemInfo.item.index, 1);
        const newIndex = replacedItemInfo?.item?.index || 0;
        replacedItemInfo.arr.splice(newIndex, 0, draggableItemInfo.item);
        this.updateIndexes(draggableItemInfo.arr, draggableItemInfo.parentUid);
        if (draggableItemInfo.arr !== replacedItemInfo.arr) {
            this.updateIndexes(replacedItemInfo.arr, replacedItemInfo.parentUid);
        }

        setTimeout(() => {
            const extra = this.overflowDirective.getAmountOfExtraItems();
            this.onChangeSize(extra);
        }, 100);
        setTimeout(_ => this.extraBtnDirective._calculatePosition(), 200);
    }

    updateIndexes(arr: any[], parentUid?: string): void {
        arr.forEach((item, index) => {
            item.index = index;
            if (parentUid) {
                item.uniqueKey = `${parentUid}${UNIQUE_KEY_SEPARATOR}${index}`;
            } else {
                item.uniqueKey = `${index}`;
            }
            if (Array.isArray(item.subItems)) {
                this.updateIndexes(item.subItems, item.uniqueKey);
            }
        });
    }

    trackBy(item: IconTabBarItem): string {
        return item.uniqueKey;
    }
}