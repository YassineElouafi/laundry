import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { toAuthUser, updateProfile, type UpdateProfileInput } from '../../lib/api/auth';
import { useAuthStore } from '../../stores/auth-store';
import { EyeIcon, EyeOffIcon } from '../../components/icons';
import { PrimaryButton, SoftField } from '../../components/ui';
import { colors, spacing } from '../../theme';

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [secureOld, setSecureOld] = useState(true);
  const [secureNew, setSecureNew] = useState(true);
  const [saving, setSaving] = useState(false);

  async function onSave() {
    if (saving) return;

    // Only send fields that actually changed.
    const payload: UpdateProfileInput = {};
    if (firstName.trim() && firstName.trim() !== (user?.firstName ?? '')) payload.firstName = firstName.trim();
    if (lastName.trim() && lastName.trim() !== (user?.lastName ?? '')) payload.lastName = lastName.trim();
    if ((phone ?? '') !== (user?.phone ?? '')) payload.phone = phone.trim() || null;
    if (email.trim() && email.trim() !== (user?.email ?? '')) payload.email = email.trim();

    if (newPassword) {
      if (!oldPassword) {
        Alert.alert(t('profile.editTitle'), t('profile.needOldPassword'));
        return;
      }
      payload.password = newPassword;
      payload.oldPassword = oldPassword;
    }

    if (Object.keys(payload).length === 0) {
      router.back();
      return;
    }

    setSaving(true);
    try {
      const updated = await updateProfile(payload);
      // API may return 204/empty on success; fall back to local merge.
      if (updated && updated.id != null) {
        setUser(toAuthUser(updated));
      } else {
        setUser({ ...user!, firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() || null, email: email.trim() });
      }
      Alert.alert(t('profile.editTitle'), t('profile.saved'));
      router.back();
    } catch {
      Alert.alert(t('profile.editTitle'), t('profile.saveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.lg }}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        <Text style={styles.section}>{t('profile.personalInfo')}</Text>
        <View style={{ gap: spacing.md }}>
          <View style={styles.row}>
            <SoftField containerStyle={styles.half} value={firstName} onChangeText={setFirstName} placeholder={t('common.firstName')} />
            <SoftField containerStyle={styles.half} value={lastName} onChangeText={setLastName} placeholder={t('common.lastName')} />
          </View>
          <SoftField value={phone} onChangeText={setPhone} placeholder={t('common.phone')} keyboardType="phone-pad" />
          <SoftField
            value={email}
            onChangeText={setEmail}
            placeholder={t('common.email')}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
      </View>

      <View>
        <Text style={styles.section}>{t('profile.changePassword')}</Text>
        <Text style={styles.hint}>{t('profile.leaveBlank')}</Text>
        <View style={{ gap: spacing.md }}>
          <SoftField
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder={t('profile.currentPassword')}
            secureTextEntry={secureOld}
            autoCapitalize="none"
            rightSlot={
              <Pressable onPress={() => setSecureOld((s) => !s)} hitSlop={10}>
                {secureOld ? <EyeOffIcon /> : <EyeIcon />}
              </Pressable>
            }
          />
          <SoftField
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder={t('profile.newPassword')}
            secureTextEntry={secureNew}
            autoCapitalize="none"
            rightSlot={
              <Pressable onPress={() => setSecureNew((s) => !s)} hitSlop={10}>
                {secureNew ? <EyeOffIcon /> : <EyeIcon />}
              </Pressable>
            }
          />
        </View>
      </View>

      <PrimaryButton title={t('profile.save')} onPress={onSave} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  section: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  hint: { color: colors.muted, fontSize: 13, marginBottom: spacing.sm, marginLeft: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
});
