import React from 'react';
import {
  ScrollView,
  SafeAreaView,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
  Dimensions,
} from 'react-native';

interface ScrollableScreenProps extends ScrollViewProps {
  children: React.ReactNode;
  containerStyle?: ViewStyle;
}

const ScrollableScreen: React.FC<ScrollableScreenProps> = ({
  children,
  containerStyle,
  contentContainerStyle,
  ...props
}) => {
  const screenHeight = Dimensions.get('window').height;
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={[styles.scrollView, containerStyle]}
        contentContainerStyle={[
          styles.scrollContent,
          {minHeight: screenHeight},
          contentContainerStyle,
        ]}
        bounces={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
        {...props}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default ScrollableScreen;
