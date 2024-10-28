import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

const {width: screenWidth, height: screenHeight} = Dimensions.get('screen');
const isSmallDevice = width <= 375;
const isSmallHeight = height <= 736;
const insetBottom = 20;
const insetTop = 20;
const primaryButtonHeight = 60;
const cameraHoleSize = width - 80;
const cameraHoleBorderSize = 44;
const navBarHeight = screenHeight - height;

export const Layout = {
  width,
  height,
  isSmallDevice,
  isSmallHeight,
  insetBottom,
  insetTop,
  primaryButtonHeight,
  cameraHoleSize,
  cameraHoleBorderSize,
  screenHeight,
  screenWidth,
  navBarHeight,
};
