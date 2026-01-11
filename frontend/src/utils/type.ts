import ArticleIcon from '@mui/icons-material/Article';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ExtendedTreeItemProps } from './props';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import FolderOpenOutlined from '@mui/icons-material/FolderOpenOutlined';
import FolderOutlined from '@mui/icons-material/FolderOutlined';


export type FileType = 'image' | 'pdf' | 'doc' | 'video' | 'folder' | 'pinned' | 'trash'| 'file'| 'folder2';

export const getIconFromFileType = (item: ExtendedTreeItemProps) => {
  switch (item.fileType) {
  case 'image':
    return ImageIcon;
  case 'pdf':
    return PictureAsPdfIcon;
  case 'doc':
    return ArticleIcon;
  case 'video':
    return VideoCameraBackIcon;
  case 'folder':
    if (item.children && item.children.length > 0 && item.expanded) {
      return ExpandMoreIcon;
    } else {
      return ChevronRightIcon;
    }
  case 'folder2':
    if (item.children && item.children.length > 0 && item.expanded) {
      return FolderOpenOutlined;
    } else {
      return FolderOutlined;
    }
  case 'pinned':
    return FolderOpenIcon;
  case 'trash':
    return DeleteIcon;
  default:
    return InsertDriveFileOutlinedIcon;
  }
};
