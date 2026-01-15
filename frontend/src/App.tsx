import * as React from 'react';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { PaletteMode } from '@mui/material';
import { TreeItem } from './components/TreeItem';
import { TreeFileExplorer } from './components/TreeFileExplorer';
import { SSH_DATETIME_URL } from './utils/props';
import { ExtendedTreeItemProps } from './utils/props';
import { AppLayout } from './components/AppLayout';
import { getTheme } from './theme/theme';
import './App.css';

const RemoteItems: TreeViewBaseItem<ExtendedTreeItemProps>[] = [];

export function App() {
  const [mode, setMode] = React.useState<PaletteMode>('dark');

  const theme = React.useMemo(() => getTheme(mode), [mode]);

  const toggleColorMode = React.useCallback(() => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppLayout mode={mode} toggleColorMode={toggleColorMode}>
        <TreeFileExplorer
          items={RemoteItems}
          path="."
          checkbox={false}
          url={SSH_DATETIME_URL}
          component={TreeItem}
        />
      </AppLayout>
    </ThemeProvider>
  );
}
