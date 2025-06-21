import { FontAwesome } from '@expo/vector-icons';
import React from 'react';

// A helper component to display icons in the tab bar.
export function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}
