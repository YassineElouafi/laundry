import { Tabs } from 'expo-router';
import { Text, type ColorValue } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme';

function icon(emoji: string) {
  return ({ color }: { color: ColorValue }) => (
    <Text style={{ fontSize: 20, color }}>{emoji}</Text>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('tabs.catalog'), tabBarIcon: icon('🧺') }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: t('tabs.orders'), tabBarIcon: icon('📦') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t('tabs.profile'), tabBarIcon: icon('👤') }}
      />
    </Tabs>
  );
}
