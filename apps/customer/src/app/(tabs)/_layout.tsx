import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BagIcon, HomeIcon, UserIcon } from '../../components/icons';
import { useAuthStore } from '../../stores/auth-store';
import { colors } from '../../theme';

export default function TabsLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const isDriver = useAuthStore((s) => s.user?.role) === 'driver';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginTop: 2 },
        tabBarIconStyle: { marginTop: 0 },
        tabBarItemStyle: { paddingTop: 6, justifyContent: 'center' },
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: Math.max(insets.bottom - 8, 4),
          height: 66,
          paddingTop: 0,
          paddingBottom: 0,
          borderRadius: 26,
          paddingHorizontal: 12,
          backgroundColor: colors.tabBar,
          borderTopWidth: 0,
          borderWidth: 0,
          // float
          shadowColor: '#000',
          shadowOpacity: 0.4,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 14,
        },
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: isDriver ? t('driver.deliveries') : t('tabs.home'),
          headerShown: false,
          tabBarIcon: ({ color }) => <HomeIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: isDriver ? t('driver.history') : t('tabs.orders'),
          tabBarIcon: ({ color }) => <BagIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => <UserIcon size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
