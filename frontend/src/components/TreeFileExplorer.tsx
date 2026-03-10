import * as React from 'react';
import axios from 'axios';
import { ChangeEvent } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { useTreeViewApiRef } from '@mui/x-tree-view/hooks';
import { TextField, Button } from '@mui/material';
import { TreeProps, ExtendedTreeItemProps } from '../utils/props';
import { FileType } from '../utils/type';
import { TreeDataContext } from '../utils/context';

type SshFormState = {
  host: string;
  port: number;
  user: string;
  privateKeyPath: string;
};

const makeRequestData = (path: string, form: SshFormState) => ({
  path,
  host: form.host,
  user: form.user,
  port: Number(form.port),
  ssh_private_key_name: form.privateKeyPath,
  up: false,
});

// コンポーネント外に移動: state に依存しないため安定した参照を保てる
const createItemDataes = (
  items: TreeViewBaseItem<ExtendedTreeItemProps>[],
  current_dir: string,
  data: [string, string][],
  fileType: FileType,
  parent: TreeViewBaseItem<ExtendedTreeItemProps> | null,
): void => {
  for (const [file, datetime] of data) {
    const fullpath = `${current_dir}/${file}`;
    items.push({
      id: fullpath,
      label: file,
      secondaryLabel: datetime,
      fullpath,
      fileType,
      checked: false,
      expanded: false,
      parent,
      children: [],
    });
  }
};

// ミューテーションなしでツリーを更新するヘルパー
const updateTreeItem = (
  items: TreeViewBaseItem<ExtendedTreeItemProps>[],
  targetId: string,
  newChildren: TreeViewBaseItem<ExtendedTreeItemProps>[],
  newFullpath: string,
): TreeViewBaseItem<ExtendedTreeItemProps>[] =>
  items.map(item => {
    if (item.id === targetId) {
      return { ...item, children: newChildren, fullpath: newFullpath };
    }
    if (item.children && item.children.length > 0) {
      return { ...item, children: updateTreeItem(item.children, targetId, newChildren, newFullpath) };
    }
    return item;
  });

export const TreeFileExplorer: React.FC<TreeProps> = (props: TreeProps) => {
  const [form, setForm] = React.useState<SshFormState>({
    host: '',
    port: 22,
    user: '',
    privateKeyPath: '',
  });

  // formRef により fetchAndUpdateTree の useCallback 依存を最小化しつつ最新の form を参照できる
  const formRef = React.useRef(form);
  formRef.current = form;

  const [lastSelectedItem, setLastSelectedItem] = React.useState<TreeViewBaseItem<ExtendedTreeItemProps> | null>(null);
  const [homedir, setHomedir] = React.useState<string>(props.path);
  const [treeData, setTreeData] = React.useState(props.items);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [openSnackbar, setOpenSnackbar] = React.useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState<string | null>(null);
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  // host state の代替: 同じホスト名での再接続も確実に検知できる
  const [connectCount, setConnectCount] = React.useState(0);
  const apiRef = useTreeViewApiRef();

  const canGetServerFiles = React.useCallback((item: TreeViewBaseItem<ExtendedTreeItemProps>): boolean => {
    if (item.children == null) return false;
    return item.fileType === 'folder2' && item.children.length === 0;
  }, []);

  const handleExpandedItemsChange = (
    _event: React.SyntheticEvent,
    itemIds: string[],
  ) => {
    setExpandedItems(itemIds);
  };

  const handleTextChange =
    (key: keyof SshFormState) =>
      (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (key === 'port') {
          // 数字のみを許可し、空文字の場合は0とする（または入力を無視する）
          if (value === '' || /^\d+$/.test(value)) {
            setForm(prev => ({ ...prev, [key]: value === '' ? 0 : parseInt(value, 10) }));
          }
          return;
        }
        // 関数形式の更新で stale state を回避
        setForm(prev => ({ ...prev, [key]: value }));
      };

  const handleConnect = (): void => {
    setOpenSnackbar(false);
    setTreeData([]);
    setHomedir('.');
    setLastSelectedItem(null);
    // インクリメントで Connect 再押しを確実にトリガー
    setConnectCount(prev => prev + 1);
  };

  const handleItemClick = (_event: React.SyntheticEvent, itemId: string) => {
    const item = apiRef.current!.getItem(itemId);
    if (item != null && canGetServerFiles(item)) {
      setLastSelectedItem(item);
    }
  };

  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  const fetchAndUpdateTree = React.useCallback(async (
    path: string,
    itemToUpdate?: TreeViewBaseItem<ExtendedTreeItemProps>,
  ) => {
    const currentForm = formRef.current;
    if (!currentForm.host || !currentForm.user || !currentForm.port) return;

    setLoading(true);
    try {
      console.log(makeRequestData(path, currentForm));
      const response = await axios.post(props.url, makeRequestData(path, currentForm));
      const { current_dir, dirs, files } = response.data;

      if (itemToUpdate) {
        const newChildren: TreeViewBaseItem<ExtendedTreeItemProps>[] = [];
        createItemDataes(newChildren, current_dir, dirs, 'folder2', itemToUpdate);
        createItemDataes(newChildren, current_dir, files, 'file', itemToUpdate);
        if (newChildren.length > 0) {
          setExpandedItems(prev => [...new Set([...prev, itemToUpdate.id])]);
        }
        // ミューテーションではなくイミュータブルな更新で再レンダリングを保証
        setTreeData(prev => updateTreeItem(prev, itemToUpdate.id, newChildren, current_dir));
      } else {
        const newItems: TreeViewBaseItem<ExtendedTreeItemProps>[] = [];
        createItemDataes(newItems, current_dir, dirs, 'folder2', null);
        createItemDataes(newItems, current_dir, files, 'file', null);
        setTreeData(newItems);
        setHomedir(current_dir);
      }
    } catch (error: unknown) {
      const detail = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      setSnackbarMessage(`Error: ${detail ?? message}`);
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  }, [props.url]); // formRef は安定した ref なので deps 不要

  // フォルダ選択時に子要素を取得
  React.useEffect(() => {
    if (!lastSelectedItem || !canGetServerFiles(lastSelectedItem)) return;
    fetchAndUpdateTree(lastSelectedItem.fullpath, lastSelectedItem);
  }, [lastSelectedItem, fetchAndUpdateTree, canGetServerFiles]);

  // Connect ボタン押下時にルートを取得
  React.useEffect(() => {
    if (connectCount === 0) return;
    fetchAndUpdateTree('.');
  }, [connectCount, fetchAndUpdateTree]);

  // チェックボックスのミューテーション後に再レンダリングをトリガーするコールバック
  const triggerTreeUpdate = React.useCallback(() => {
    setTreeData(prev => [...prev]);
  }, []);

  return (
    <TreeDataContext.Provider value={triggerTreeUpdate}>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Connection Panel */}
        <Box
          component="div"
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: 'background.paper',
            boxShadow: 4,
            border: 1,
            borderColor: 'divider',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            SSH Connection
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 0.6fr 1.2fr 2fr 1fr' }, gap: 2 }}>
            <TextField
              label="SSH Host"
              fullWidth
              value={form.host}
              onChange={handleTextChange('host')}
              variant="outlined"
              size="small"
            />
            <TextField
              label="Port"
              fullWidth
              type="number"
              value={form.port === 0 ? '' : form.port}
              onChange={handleTextChange('port')}
              placeholder="22"
              variant="outlined"
              size="small"
            />
            <TextField
              label="User"
              fullWidth
              value={form.user}
              onChange={handleTextChange('user')}
              variant="outlined"
              size="small"
            />
            <TextField
              label="Privatekey Path"
              fullWidth
              value={form.privateKeyPath}
              onChange={handleTextChange('privateKeyPath')}
              placeholder="id_rsa"
              variant="outlined"
              size="small"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleConnect}
              size="medium"
              sx={{ height: '100%' }}
            >
              Connect
            </Button>
          </Box>
        </Box>

        {/* File Explorer Panel */}
        <Box
          component="div"
          sx={{
            p: 0,
            borderRadius: 2,
            bgcolor: 'transparent',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '600px',
          }}
        >
          {homedir && (
            <Box sx={{ mb: 1, ml: 1 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Current Directory: <Typography component="span" color="primary.light">{homedir}</Typography>
              </Typography>
            </Box>
          )}

          <Box sx={{
            flexGrow: 1,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <RichTreeView
              items={treeData}
              sx={{
                p: 2,
                flexGrow: 1,
                overflowY: 'auto',
                minHeight: '500px'
              }}
              slots={{ item: props.component }}
              onExpandedItemsChange={handleExpandedItemsChange}
              expandedItems={expandedItems}
              onItemClick={handleItemClick}
              apiRef={apiRef}
              checkboxSelection={props.checkbox}
            />
          </Box>
        </Box>

        {loading && <CircularProgress sx={{ position: 'fixed', top: '50%', left: '50%', zIndex: 9999 }} />}

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </TreeDataContext.Provider>
  );
};
