import * as React from 'react';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { CustomTreeItemProps } from './components/TreeItem';
import { FileType } from '../utils/type';


const BASE_URL = 'http://localhost:8000/';
export const DIR_URL = BASE_URL + 'ssh/list_dir';
export const SSH_DATETIME_URL = BASE_URL + 'ssh/list_dir/datetime';


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
  expanded?: boolean;
  parent?: TreeViewBaseItem<ExtendedTreeItemProps> | null;
  children?: TreeViewBaseItem<ExtendedTreeItemProps>[];
};