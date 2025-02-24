import { Animated, Easing, Platform } from 'react-native';
import StyleInterpolator from './StackViewStyleInterpolator';
import { supportsImprovedSpringAnimation } from '../../utils/ReactNativeFeatures';
import { TransitionProps, TransitionConfig } from '../../types';

let IOSTransitionSpec;
if (supportsImprovedSpringAnimation()) {
  // These are the exact values from UINavigationController's animation configuration
  IOSTransitionSpec = {
    timing: Animated.spring,
    stiffness: 1000,
    damping: 500,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  };
} else {
  // This is an approximation of the IOS spring animation using a derived bezier curve
  IOSTransitionSpec = {
    duration: 500,
    easing: Easing.bezier(0.2833, 0.99, 0.31833, 0.99),
    timing: Animated.timing,
  };
}

// Standard iOS navigation transition
const SlideFromRightIOS = {
  transitionSpec: IOSTransitionSpec,
  screenInterpolator: StyleInterpolator.forHorizontal,
  containerStyle: {
    backgroundColor: '#eee',
  },
};

// Standard iOS navigation transition for modals
const ModalSlideFromBottomIOS = {
  transitionSpec: IOSTransitionSpec,
  screenInterpolator: StyleInterpolator.forVertical,
  containerStyle: {
    backgroundColor: '#eee',
  },
};

// Standard Android navigation transition when opening an Activity
const FadeInFromBottomAndroid = {
  // See http://androidxref.com/7.1.1_r6/xref/frameworks/base/core/res/res/anim/activity_open_enter.xml
  transitionSpec: {
    duration: 350,
    easing: Easing.out(Easing.poly(5)), // decelerate
    timing: Animated.timing,
  },
  screenInterpolator: StyleInterpolator.forFadeFromBottomAndroid,
};

// Standard Android navigation transition when closing an Activity
const FadeOutToBottomAndroid = {
  // See http://androidxref.com/7.1.1_r6/xref/frameworks/base/core/res/res/anim/activity_close_exit.xml
  transitionSpec: {
    duration: 150,
    easing: Easing.in(Easing.linear), // accelerate
    timing: Animated.timing,
  },
  screenInterpolator: StyleInterpolator.forFadeToBottomAndroid,
};

const NoAnimation = {
  transitionSpec: {
    duration: 0,
    timing: Animated.timing,
  },
  screenInterpolator: StyleInterpolator.forNoAnimation,
  containerStyle: {
    backgroundColor: '#eee',
  },
};

function defaultTransitionConfig(
  transitionProps: TransitionProps,
  prevTransitionProps?: TransitionProps,
  isModal?: boolean,
  isTransparent?: boolean
): TransitionConfig {
  // If modal is not full-screen, user is responsible to implement animation
  if (isModal && isTransparent && Platform.OS === 'android') {
        return NoAnimation;
  }
    
  if (Platform.OS !== 'ios') {
    // Use the default Android animation no matter if the screen is a modal.
    // Android doesn't have full-screen modals like iOS does, it has dialogs.
    if (
      prevTransitionProps &&
      transitionProps.index < prevTransitionProps.index
    ) {
      // Navigating back to the previous screen
      return FadeOutToBottomAndroid;
    }
    return FadeInFromBottomAndroid;
  }
  // iOS and other platforms
  if (isModal) {
    return ModalSlideFromBottomIOS;
  }
  return SlideFromRightIOS;
}

function getTransitionConfig<T = {}>(
  transitionConfigurer:
    | undefined
    | ((
        transitionProps: TransitionProps,
        prevTransitionProps?: TransitionProps,
        isModal?: boolean
      ) => T),
  transitionProps: TransitionProps,
  prevTransitionProps?: TransitionProps,
  isModal?: boolean,
  isTransparent?: boolean
): TransitionConfig & T {
  const defaultConfig = defaultTransitionConfig(
    transitionProps,
    prevTransitionProps,
    isModal,
    isTransparent
  );
  if (transitionConfigurer) {
    return {
      ...defaultConfig,
      ...transitionConfigurer(transitionProps, prevTransitionProps, isModal),
    };
  }

  return defaultConfig as any;
}

export default {
  defaultTransitionConfig,
  getTransitionConfig,
  SlideFromRightIOS,
  ModalSlideFromBottomIOS,
  FadeInFromBottomAndroid,
  FadeOutToBottomAndroid,
  NoAnimation,
};
