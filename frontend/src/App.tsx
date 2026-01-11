import Container from '@mui/material/Container';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { TreeItem } from './components/TreeItem';
import { TreeFileExplorer } from './components/TreeFileExplorer';
import { SSH_DATETIME_URL } from './utils/props';
import { ExtendedTreeItemProps } from './utils/props';
import './App.css';


const RemoteItems: TreeViewBaseItem<ExtendedTreeItemProps>[] = [];

export function App() {
  return (
      <Container sx={{ ml:0, pl: 0, pr: 0 }}>
        <TreeFileExplorer items={RemoteItems}
          path="."
          checkbox={false}
          url={SSH_DATETIME_URL}
          component={TreeItem} />
      </Container>
  );
}
