/**
 * Keyboard-aware scroll view — simplified to plain ScrollView.
 * react-native-keyboard-controller removed to keep standalone APK build lean.
 */
import { ScrollView, ScrollViewProps } from 'react-native';

type Props = ScrollViewProps & {
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
};

export function KeyboardAwareScrollViewCompat({
  children,
  keyboardShouldPersistTaps = 'handled',
  ...props
}: Props) {
  return (
    <ScrollView keyboardShouldPersistTaps={keyboardShouldPersistTaps} {...props}>
      {children}
    </ScrollView>
  );
}
