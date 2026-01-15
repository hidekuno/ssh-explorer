import * as React from 'react';
import clsx from 'clsx';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTreeItem2 } from '@mui/x-tree-view/useTreeItem2';
import DoNotDisturb from '@mui/icons-material/DoNotDisturb';
import { TreeItem2Checkbox, TreeItem2Label } from '@mui/x-tree-view/TreeItem2';
import { TreeItem2Provider } from '@mui/x-tree-view/TreeItem2Provider';
import { TreeItem2DragAndDropOverlay } from '@mui/x-tree-view/TreeItem2DragAndDropOverlay';
import { getIconFromFileType } from '../utils/type';
import { ExtendedTreeItemProps } from '../utils/props';
import { animated, useSpring } from '@react-spring/web';
import { styled, alpha } from '@mui/material/styles';
import { TransitionProps } from '@mui/material/transitions';
import Collapse from '@mui/material/Collapse';
import { UseTreeItem2Parameters } from '@mui/x-tree-view/useTreeItem2';
import { TreeItem2Content } from '@mui/x-tree-view/TreeItem2';


declare module 'react' {
  interface CSSProperties {
    '--tree-view-color'?: string;
    '--tree-view-bg-color'?: string;
  }
}
const CustomTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
  borderRadius: theme.spacing(0.7),
  marginBottom: theme.spacing(0.05),
  marginTop: theme.spacing(0.05),
  padding: theme.spacing(0.05),
  paddingRight: theme.spacing(1),
  fontWeight: 500,
  ['&.Mui-expanded ']: {
    '&:not(.Mui-focused, .Mui-selected, .Mui-selected.Mui-focused) .labelIcon': {
      color: theme.palette.primary.dark,
      ...theme.applyStyles('light', {
        color: theme.palette.primary.main,
      }),
    },
    '&::before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      left: '16px',
      top: '44px',
      height: 'calc(100% - 48px)',
      width: '1.5px',
      backgroundColor: theme.palette.grey[700],
      ...theme.applyStyles('light', {
        backgroundColor: theme.palette.grey[300],
      }),
    },
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: 'white',
    ...theme.applyStyles('light', {
      color: theme.palette.primary.main,
    }),
  },
}));

const AnimatedCollapse = animated(Collapse);
function TransitionComponent(props: TransitionProps) {
  const style = useSpring({
    to: {
      opacity: props.in ? 1 : 0,
      transform: `translate3d(0,${props.in ? 0 : 20}px,0)`,
    },
  });

  return <AnimatedCollapse style={style} {...props} />;
}

const StyledTreeItemLabelText = styled(Typography)({
  color: 'inherit',
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontSize: '1rem',
}) as unknown as typeof Typography;

export interface CustomTreeItemProps
  extends Omit<UseTreeItem2Parameters, 'rootRef'>,
  Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus'> { }

export const TreeItem = React.forwardRef(function CustomTreeItem(
  props: CustomTreeItemProps,
  ref: React.Ref<HTMLLIElement>,
) {
  const { id, itemId, label, disabled, children } = props;

  const {
    getCheckboxProps,
    getContentProps,
    getLabelProps,
    getGroupTransitionProps,
    getDragAndDropOverlayProps,
    status,
    publicAPI,
  } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref });

  const item = publicAPI.getItem(itemId);
  const icon = getIconFromFileType(item);
  const secondaryLabel = item.secondaryLabel;

  interface CustomLabelProps {
    children: React.ReactNode;
    icon?: React.ElementType;
  }

  const setAllChecked = (item: ExtendedTreeItemProps, checked: boolean) => {
    item.checked = checked;
    if ((item.children == null)) {
      return;
    }
    for (const child of item.children) {
      setAllChecked(child, checked);
    }
    for (let parent = item.parent; parent; parent = parent.parent) {
      if (parent.children) {
        parent.checked = parent.children.some((child: ExtendedTreeItemProps) => child.checked);
      }
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleChange');
    const item = publicAPI.getItem(event.target.id);
    setAllChecked(item, event.target.checked);
  };
  function CustomLabel({
    icon: Icon,
    children,
    ...other
  }: CustomLabelProps) {

    return (
      <TreeItem2Label
        {...other}
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {Icon && (
          <Box
            component={Icon}
            className="labelIcon"
            color="inherit"
            sx={{ mr: 1, fontSize: '1.2rem' }}
          />
        )}
        <StyledTreeItemLabelText textAlign="left" variant="body2">{children}</StyledTreeItemLabelText>
      </TreeItem2Label>
    );
  }

  return (
    <TreeItem2Provider itemId={itemId}>
      <CustomTreeItemContent
        {...getContentProps({
          className: clsx('content', {
            'Mui-expanded': status.expanded,
            'Mui-selected': status.selected,
            'Mui-focused': status.focused,
            'Mui-disabled': status.disabled,
          }),
        })}>

        {!item.excluded &&
          <TreeItem2Checkbox {...getCheckboxProps({
            id: itemId,
            checked: item.checked,
            onChange: handleChange,
            size: 'small'
          })} />
        }
        {item.excluded && <DoNotDisturb color='error' sx={{ ml: 0.3, mr: 0.1, fontSize: '1.1rem' }} />}
        <CustomLabel {...getLabelProps({ icon, })} />
        <TreeItem2DragAndDropOverlay {...getDragAndDropOverlayProps()} />

        <Typography textAlign="right" variant="subtitle2" sx={{ width: 300, mr: 0, opacity: 0.8, fontSize: '0.8rem' }}>
          {secondaryLabel}
        </Typography>
      </CustomTreeItemContent>
      {children && <TransitionComponent {...getGroupTransitionProps()} />}
    </TreeItem2Provider>
  );
});
