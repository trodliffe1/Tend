import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../constants/theme';

interface PolicySection {
  number: string;
  title: string;
  content: React.ReactNode;
}

export default function PrivacyPolicyScreen() {
  const sections: PolicySection[] = [
    {
      number: '1',
      title: 'Overview',
      content: (
        <>
          <Text style={styles.paragraph}>
            We built MyOrbyt to help you set reminders to keep in touch with the people you care about. We designed the app so that your content and relationship data stays private.
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              <Text style={styles.bullet}>&gt; </Text>
              Your reminder and relationship data is stored locally on your device and/or encrypted by you before it is stored in the cloud.
            </Text>
            <Text style={styles.bulletItem}>
              <Text style={styles.bullet}>&gt; </Text>
              We do not have access to your content, contact notes, or relationship data.
            </Text>
            <Text style={styles.bulletItem}>
              <Text style={styles.bullet}>&gt; </Text>
              The main personal data we can access is your email address (as described below).
            </Text>
          </View>
        </>
      ),
    },
    {
      number: '2',
      title: 'Data We Collect',
      content: (
        <>
          <Text style={styles.subsectionTitle}>A) Email address</Text>
          <Text style={styles.paragraph}>
            We collect your email address if you provide it, for example to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              <Text style={styles.bullet}>&gt; </Text>
              create or manage your account,
            </Text>
            <Text style={styles.bulletItem}>
              <Text style={styles.bullet}>&gt; </Text>
              send essential service messages (e.g., verification, security notices),
            </Text>
            <Text style={styles.bulletItem}>
              <Text style={styles.bullet}>&gt; </Text>
              respond to support requests,
            </Text>
            <Text style={styles.bulletItem}>
              <Text style={styles.bullet}>&gt; </Text>
              send product updates or marketing emails only if you opt in.
            </Text>
          </View>
          <Text style={styles.paragraph}>
            We do not collect your reminder text, contact notes, relationship tags, or any similar content.
          </Text>

          <Text style={styles.subsectionTitle}>B) App data stored on your device (not accessible to us)</Text>
          <Text style={styles.paragraph}>
            The app stores data such as reminders, schedules, and any relationship context on your device. This data is not transmitted to us unless you explicitly choose to share something with support (e.g., a screenshot or an exported file).
          </Text>

          <Text style={styles.subsectionTitle}>C) Encrypted cloud sync (if enabled)</Text>
          <Text style={styles.paragraph}>
            If you enable cloud backup, your app data may be stored in the cloud in encrypted form. Encryption is performed on your device, and we do not have the encryption keys needed to read your content.
          </Text>
          <Text style={styles.paragraph}>
            If you're using iCloud/Apple services: Apple may process certain data as part of providing iCloud sync.
          </Text>
        </>
      ),
    },
    {
      number: '3',
      title: 'Data We Do Not Collect',
      content: (
        <>
          <Text style={styles.paragraph}>We do not collect:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              <Text style={styles.bullet}>&gt; </Text>
              reminder contents or notes,
            </Text>
            <Text style={styles.bulletItem}>
              <Text style={styles.bullet}>&gt; </Text>
              your contact list (unless you explicitly grant permission and the data remains on-device),
            </Text>
            <Text style={styles.bulletItem}>
              <Text style={styles.bullet}>&gt; </Text>
              precise location,
            </Text>
            <Text style={styles.bulletItem}>
              <Text style={styles.bullet}>&gt; </Text>
              microphone recordings,
            </Text>
            <Text style={styles.bulletItem}>
              <Text style={styles.bullet}>&gt; </Text>
              photos (unless you explicitly add them, and they remain on-device / encrypted),
            </Text>
            <Text style={styles.bulletItem}>
              <Text style={styles.bullet}>&gt; </Text>
              advertising identifiers for tracking.
            </Text>
          </View>
        </>
      ),
    },
    {
      number: '4',
      title: 'How We Use Your Information',
      content: (
        <>
          <Text style={styles.paragraph}>We use your email address to:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              <Text style={styles.bullet}>&gt; </Text>
              provide and maintain the app (account, authentication, critical notices),
            </Text>
            <Text style={styles.bulletItem}>
              <Text style={styles.bullet}>&gt; </Text>
              provide support,
            </Text>
            <Text style={styles.bulletItem}>
              <Text style={styles.bullet}>&gt; </Text>
              send updates and tips if you opt in.
            </Text>
          </View>
          <Text style={styles.paragraph}>
            We do not use your email address to build advertising profiles or sell your information.
          </Text>
        </>
      ),
    },
    {
      number: '5',
      title: 'Sharing Your Information',
      content: (
        <>
          <Text style={styles.paragraph}>We do not sell your personal information.</Text>
          <Text style={styles.paragraph}>We may share limited information only in these cases:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              <Text style={styles.bullet}>&gt; </Text>
              Service providers that help us run the app (e.g., email delivery for verification or newsletters). They are permitted to use your data only to provide services to us.
            </Text>
            <Text style={styles.bulletItem}>
              <Text style={styles.bullet}>&gt; </Text>
              Legal requirements if we are required to comply with law, regulation, or valid legal process.
            </Text>
            <Text style={styles.bulletItem}>
              <Text style={styles.bullet}>&gt; </Text>
              Business transfers if we are involved in a merger, acquisition, or asset sale (you will be notified if required).
            </Text>
          </View>
          <Text style={styles.paragraph}>
            Your encrypted reminder/relationship data is not shared because we cannot access it.
          </Text>
        </>
      ),
    },
    {
      number: '6',
      title: 'Data Retention',
      content: (
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>
            <Text style={styles.bullet}>&gt; </Text>
            We keep your email address for as long as you maintain an account or subscription, or as needed to provide the service.
          </Text>
          <Text style={styles.bulletItem}>
            <Text style={styles.bullet}>&gt; </Text>
            If you delete your account (or request deletion), we will delete your email address within a reasonable timeframe, unless we need to keep it to comply with legal obligations (e.g., billing records).
          </Text>
        </View>
      ),
    },
    {
      number: '7',
      title: 'Security',
      content: (
        <>
          <Text style={styles.paragraph}>
            We use reasonable safeguards to protect the personal data we control (such as email addresses).
          </Text>
          <Text style={styles.paragraph}>
            For reminder/relationship data, privacy is primarily protected by on-device storage and/or end-to-end encryption controlled by you.
          </Text>
          <Text style={styles.paragraph}>
            No system is 100% secure, but we design the app to minimize the data we can access.
          </Text>
        </>
      ),
    },
    {
      number: '8',
      title: 'Your Choices and Rights',
      content: (
        <>
          <Text style={styles.paragraph}>Depending on where you live, you may have rights to:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              <Text style={styles.bullet}>&gt; </Text>
              access the personal data we hold about you,
            </Text>
            <Text style={styles.bulletItem}>
              <Text style={styles.bullet}>&gt; </Text>
              request correction or deletion,
            </Text>
            <Text style={styles.bulletItem}>
              <Text style={styles.bullet}>&gt; </Text>
              object to or restrict processing,
            </Text>
            <Text style={styles.bulletItem}>
              <Text style={styles.bullet}>&gt; </Text>
              withdraw consent (e.g., marketing emails).
            </Text>
          </View>
          <Text style={styles.paragraph}>
            You can contact us at info@myorbyt.com to make a request.
          </Text>
        </>
      ),
    },
    {
      number: '9',
      title: "Children's Privacy",
      content: (
        <Text style={styles.paragraph}>
          MyOrbyt is not intended for children under 16. We do not knowingly collect personal data from children. If you believe a child provided us an email address, contact us and we will delete it.
        </Text>
      ),
    },
    {
      number: '10',
      title: 'International Transfers',
      content: (
        <Text style={styles.paragraph}>
          If you are located in the UK/EU and our service providers process email addresses outside your country, we take steps intended to ensure appropriate safeguards are in place (for example, contractual protections).
        </Text>
      ),
    },
    {
      number: '11',
      title: 'Third-Party Links and Services',
      content: (
        <Text style={styles.paragraph}>
          The app may include links to third-party websites or services. Their privacy practices are governed by their own policies.
        </Text>
      ),
    },
    {
      number: '12',
      title: 'Changes to This Policy',
      content: (
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We'll update the "Effective date" and, if changes are significant, we'll provide additional notice within the app or by email.
        </Text>
      ),
    },
    {
      number: '13',
      title: 'Contact Us',
      content: (
        <>
          <Text style={styles.paragraph}>If you have questions or requests, contact:</Text>
          <View style={styles.contactBox}>
            <Text style={styles.contactName}>ZenTime Labs</Text>
            <Text style={styles.contactEmail}>Email: info@myorbyt.com</Text>
          </View>
        </>
      ),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.effectiveDate}>Effective date: 25/01/2026</Text>
        </View>

        <View style={styles.policyContainer}>
          {sections.map((section) => (
            <View key={section.number} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionNumber}>{section.number})</Text>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <View style={styles.sectionContent}>
                {section.content}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  effectiveDate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  policyContainer: {
    paddingHorizontal: spacing.lg,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondary,
    marginRight: spacing.sm,
    fontFamily: 'monospace',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  sectionContent: {
    padding: spacing.md,
  },
  paragraph: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  bulletList: {
    marginBottom: spacing.sm,
  },
  bulletItem: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm,
  },
  bullet: {
    color: colors.primary,
    fontWeight: '700',
  },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  contactBox: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  contactEmail: {
    fontSize: 13,
    color: colors.primary,
    fontFamily: 'monospace',
  },
});
