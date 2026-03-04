import type * as React from 'react';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import type { UseTreeItem2Parameters } from '@mui/x-tree-view/useTreeItem2';
import { FileType } from './type';


const BASE_URL = 'http://localhost:8000/';
export const DIR_URL = BASE_URL + 'ssh/list_dir';
export const SSH_DATETIME_URL = BASE_URL + 'ssh/list_dir/datetime';


// CustomTreeItemProps をここで定義することで TreeItem.tsx との循環依存を解消
export interface CustomTreeItemProps
  extends Omit<UseTreeItem2Parameters, 'rootRef'>,
  Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus'> { }

export interface TreeProps {
  items: TreeViewBaseItem<ExtendedTreeItemProps>[];
  path: string;
  checkbox: boolean;
  url: string;
  component: React.ForwardRefExoticComponent<CustomTreeItemProps>;
}

export type ExtendedTreeItemProps = {
  fileType: FileType;
  id: string;
  label: string;
  secondaryLabel: string;
  fullpath: string;
  checked?: boolean;
  excluded?: boolean;
  expanded?: boolean;
  parent?: TreeViewBaseItem<ExtendedTreeItemProps> | null;
  children?: TreeViewBaseItem<ExtendedTreeItemProps>[];
};
