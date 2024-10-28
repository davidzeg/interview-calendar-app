import {PixelRatio, Platform} from 'react-native';
import {Layout} from '../../constants';

export const DEFAULT_HEIGHT = 926;
export const DEFAULT_WIDTH = 428;

const baseScaleHeight = Layout.height / DEFAULT_HEIGHT;
const baseScaleWidth = Layout.width / DEFAULT_WIDTH;

function normalize(
  size: number,
  based: 'width' | 'height' = 'width',
  value = 0,
) {
  const newSize =
    based === 'height' ? size * baseScaleHeight : size * baseScaleWidth;

  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) + value;
  }
}

export const getSizeByY = (size: number, value?: number) => {
  return normalize(size, 'height', value);
};

export const getSizeByX = (size: number, value?: number) => {
  return normalize(size, 'width', value);
};

export const getFontSize = (size: number) => {
  return getSizeByY(size);
};
