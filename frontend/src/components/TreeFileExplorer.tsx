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
import { TextField, Button } from "@mui/material";
import { TreeProps } from '../utils/props';
import { ExtendedTreeItemProps } from '../utils/props';
import { FileType } from '../utils/type';

type SshFormState = {
  host: string;
  port: string;
  user: string;
  privateKeyPath: string;
};

const makeRequestData = (path: string, form:SshFormState) => {

  const data = {
    path: path,
    host: form.host,
    user: form.user,
    port: form.port,
    ssh_private_key: form.privateKeyPath,
    up: false,
  };
  return data;
};
export const TreeFileExplorer: React.FC<TreeProps> = (props: TreeProps) => {
  const [form, setForm] = React.useState<SshFormState>({
    host: "",
    port: "",
    user: "",
    privateKeyPath: "",
  });

  const [lastSelectedItem, setLastSelectedItem] = React.useState<TreeViewBaseItem<ExtendedTreeItemProps> | null>(null);
  const [host, setHost] = React.useState<string>("");
  const [homedir, setHomedir] = React.useState<string>(props.path);
  const [treeData, setTreeData] = React.useState(props.items);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [openSnackbar, setOpenSnackbar] = React.useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState<string | null>(null);
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const apiRef = useTreeViewApiRef();

  const canGetServerFiles = (item: TreeViewBaseItem<ExtendedTreeItemProps>): boolean => {
    if (item.children == null) {
      return false;
    }
    return (item.fileType === 'folder2' && item.children.length === 0);
  };
  const handleExpandedItemsChange = (
    _event: React.SyntheticEvent,
    itemIds: string[],
  ) => {
    setExpandedItems(itemIds);
  };

  const handleTextChange =
    (key: keyof SshFormState) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [key]: e.target.value });
    };

  const handleItemExpansionToggle = (
    _event: React.SyntheticEvent,
    itemId: string,
    isExpanded: boolean,
  ) => {
    const item = apiRef.current!.getItem(itemId);
    item.expanded = isExpanded;
    console.log('handleItemExpansionToggle', itemId, isExpanded);
  };

  const handleConnect = (): void => {
    setOpenSnackbar(false);
    console.log("Connect with:", form);
    setTreeData([]);
    setHomedir('.');
    setLastSelectedItem(null);
    setHost(form.host); // Trigger useEffect for initial fetch
  };

  const handleItemClick = ( _event: React.SyntheticEvent, itemId: string) => {
    console.log('handleItemClick', itemId);
    const item = apiRef.current!.getItem(itemId);
    if (item != null && canGetServerFiles(item)) {
      setLastSelectedItem(item);
    }
  };
  const createItemDataes = (
    items: TreeViewBaseItem<ExtendedTreeItemProps>[],
    current_dir: string,
    data: [string, string][],
    fileType: FileType,
    parent: TreeViewBaseItem<ExtendedTreeItemProps>|null) => {

    for (const [file,datetime] of data) {
      const fullpath = current_dir + '/' + file;
      items.push({
        id: fullpath,
        label: file,
        secondaryLabel: datetime,
        fullpath: fullpath,
        fileType: fileType,
        checked: false,
        expanded: false,
        parent: parent,
        children: [],
      });
    }
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const fetchAndUpdateTree = async (path: string, itemToUpdate?: TreeViewBaseItem<ExtendedTreeItemProps>) => {
    if (!form.host || !form.user || !form.port) {
      return;
    }

    setLoading(true);
    const requestData = makeRequestData(path, form);

    try {
      const response = await axios.post(props.url, requestData);
      const { current_dir, dirs, files } = response.data;

      if (itemToUpdate) {
        // Update children of an existing folder
        itemToUpdate.children = [];
        createItemDataes(itemToUpdate.children, current_dir, dirs, 'folder2', itemToUpdate);
        createItemDataes(itemToUpdate.children, current_dir, files, 'file', itemToUpdate);
        itemToUpdate.fullpath = current_dir;
        if (itemToUpdate.children.length > 0) {
          itemToUpdate.expanded = true;
          setExpandedItems((prev) => [...new Set([...prev, itemToUpdate.id])]); // Use Set to avoid duplicates
        }
        setTreeData([...treeData]); // Trigger re-render as item inside array is mutated
      } else {
        // Initial fetch, create new tree
        const newItems: ExtendedTreeItemProps[] = [];
        createItemDataes(newItems, current_dir, dirs, 'folder2', null);
        createItemDataes(newItems, current_dir, files, 'file', null);
        setTreeData(newItems);
        setHomedir(current_dir);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'An unknown error occurred';
      setSnackbarMessage(`Error: ${errorMessage}`);
      setOpenSnackbar(true);
      console.error(error);
      // Reset host if initial fetch fails, allowing for a retry
      setHost("");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // This effect handles fetching file data from the server.
    // It runs when a folder is clicked for expansion, or when a new connection is established.

    if (lastSelectedItem && canGetServerFiles(lastSelectedItem)) {
      // Fetch children for a selected, un-expanded folder
      console.log('useEffect: fetch children for', lastSelectedItem.id);
      fetchAndUpdateTree(lastSelectedItem.fullpath, lastSelectedItem);
    } else if (treeData.length === 0 && host) {
      // Initial fetch after clicking "Connect"
      console.log('useEffect: initial fetch for host', host);
      fetchAndUpdateTree(homedir);
    }
  }, [lastSelectedItem, host]);

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ display: "grid", gridTemplateColumns: "2fr 0.6fr 1.2fr 2fr 1fr", gap: 2 }}>
        <TextField
          label="SSH Host"
          fullWidth
          value={form.host}
          onChange={handleTextChange("host")}
        />
        <TextField
          label="Port"
          fullWidth
          value={form.port}
          onChange={handleTextChange("port")}
          placeholder="22"
        />
        <TextField
          label="User"
          fullWidth
          value={form.user}
          onChange={handleTextChange("user")}
        />
        <TextField
          label="Privatekey Path"
          fullWidth
          value={form.privateKeyPath}
          onChange={handleTextChange("privateKeyPath")}
          placeholder="~/.ssh/id_rsa"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleConnect}
        >
          Connect
        </Button>
      </Box>

      <Typography sx={{marginTop: '1.5rem'}} variant="h6" gutterBottom>{homedir}</Typography>

      <RichTreeView
          items={treeData}
          sx={{
            marginLeft: '2.5rem',
            borderRadius: 1,
            border: 1,
            borderColor: 'grey.500',
            borderStyle: 'solid',
            height: '600px',
            flexGrow: 1,
            minWidth: 1024,
            maxWidth: 1024,
            overflowY: 'auto' }}
          slots={{ item: props.component }}
          onItemExpansionToggle={handleItemExpansionToggle}
          onExpandedItemsChange={handleExpandedItemsChange}
          expandedItems={expandedItems}
          onItemClick={handleItemClick}
          apiRef={apiRef}
          checkboxSelection={props.checkbox}
        />
        {loading && <CircularProgress sx={{ position: 'fixed', top: '50%', left: '50%' }} />}

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
  );
};
