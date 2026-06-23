import {
  LocalNotifications,
  type PendingLocalNotificationSchema,
} from '@capacitor/local-notifications'
import { Capacitor, type PermissionState } from '@capacitor/core'

const notificationSource = 'cuidapet-dose-reminder'
const notificationTestSource = 'cuidapet-test-notification'
const notificationChannelId = 'cuidapet-medication-reminders'
const notificationIcon = 'ic_stat_cuidapet'
const notificationIconColor = '#22C7B8'
const testNotificationId = 762307
const minimumScheduleDelayMs = 1_000

export type DoseNotificationInput = {
  doseScheduleId: string
  treatmentId: string
  petId: string
  petName: string
  medicationName: string
  dose: string
  doseUnit: string
  scheduledAt: string
}

export type NotificationStatus = {
  supported: boolean
  permission: PermissionState | 'unsupported'
  exactAlarm: PermissionState | 'unsupported'
}

export type NotificationScheduleResult = {
  supported: boolean
  permission: NotificationStatus['permission']
  scheduled: number
  alreadyScheduled: number
  cancelled: number
  pending: number
}

type NotificationExtra = {
  source?: string
  doseScheduleId?: string
  treatmentId?: string
  petId?: string
}

function isNativePlatform() {
  return Capacitor.isNativePlatform()
}

function isCuidaPetNotification(
  notification: PendingLocalNotificationSchema,
) {
  const extra = notification.extra as NotificationExtra | undefined
  return extra?.source === notificationSource
}

function getExtra(notification: PendingLocalNotificationSchema) {
  return notification.extra as NotificationExtra | undefined
}

function toLocalNotification(input: DoseNotificationInput) {
  return {
    id: notificationIdFromDoseScheduleId(input.doseScheduleId),
    title: 'Hora do remédio 🐾',
    body: `${input.petName}: ${input.medicationName} - ${input.dose} ${input.doseUnit}`,
    schedule: {
      at: new Date(input.scheduledAt),
      allowWhileIdle: true,
    },
    channelId: notificationChannelId,
    smallIcon: notificationIcon,
    iconColor: notificationIconColor,
    autoCancel: true,
    extra: {
      source: notificationSource,
      doseScheduleId: input.doseScheduleId,
      treatmentId: input.treatmentId,
      petId: input.petId,
    },
  }
}

async function ensureReminderChannel() {
  if (!isNativePlatform() || Capacitor.getPlatform() !== 'android') return

  try {
    await LocalNotifications.createChannel({
      id: notificationChannelId,
      name: 'Lembretes de medicamentos',
      description: 'Alertas de doses cadastradas no CuidaPet.',
      importance: 4,
      visibility: 1,
      lights: true,
      lightColor: notificationIconColor,
      vibration: true,
    })
  } catch {
    // Se o canal já existir ou o Android não permitir alteração,
    // o agendamento ainda pode seguir usando a configuração padrão.
  }
}

async function getCuidaPetPendingNotifications() {
  if (!isNativePlatform()) return []
  const { notifications } = await LocalNotifications.getPending()
  return notifications.filter(isCuidaPetNotification)
}

async function cancelNotifications(
  notifications: PendingLocalNotificationSchema[],
) {
  if (notifications.length === 0) return 0
  await LocalNotifications.cancel({
    notifications: notifications.map(({ id }) => ({ id })),
  })
  return notifications.length
}

export function notificationIdFromDoseScheduleId(doseScheduleId: string) {
  let hash = 2166136261

  for (let index = 0; index < doseScheduleId.length; index += 1) {
    hash ^= doseScheduleId.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0) & 0x7fffffff || 1
}

export const notificationService = {
  isSupported() {
    return isNativePlatform()
  },

  async checkPermission(): Promise<NotificationStatus> {
    if (!isNativePlatform()) {
      return {
        supported: false,
        permission: 'unsupported',
        exactAlarm: 'unsupported',
      }
    }

    const permission = await LocalNotifications.checkPermissions()
    let exactAlarm: PermissionState = 'granted'

    if (Capacitor.getPlatform() === 'android') {
      try {
        const exactStatus =
          await LocalNotifications.checkExactNotificationSetting()
        exactAlarm = exactStatus.exact_alarm
      } catch {
        exactAlarm = 'granted'
      }
    }

    return {
      supported: true,
      permission: permission.display,
      exactAlarm,
    }
  },

  async requestPermission(): Promise<NotificationStatus> {
    if (!isNativePlatform()) return this.checkPermission()
    await LocalNotifications.requestPermissions()
    return this.checkPermission()
  },

  async requestExactAlarmPermission(): Promise<NotificationStatus> {
    if (
      !isNativePlatform() ||
      Capacitor.getPlatform() !== 'android'
    ) {
      return this.checkPermission()
    }

    await LocalNotifications.changeExactNotificationSetting()
    return this.checkPermission()
  },

  async listPendingNotifications() {
    return getCuidaPetPendingNotifications()
  },

  async scheduleTreatmentNotifications(
    doses: DoseNotificationInput[],
    options: { requestPermission?: boolean } = {},
  ): Promise<NotificationScheduleResult> {
    if (!isNativePlatform()) {
      return {
        supported: false,
        permission: 'unsupported',
        scheduled: 0,
        alreadyScheduled: 0,
        cancelled: 0,
        pending: 0,
      }
    }

    const status = options.requestPermission
      ? await this.requestPermission()
      : await this.checkPermission()

    if (status.permission !== 'granted') {
      return {
        supported: true,
        permission: status.permission,
        scheduled: 0,
        alreadyScheduled: 0,
        cancelled: 0,
        pending: (await getCuidaPetPendingNotifications()).length,
      }
    }

    const now = Date.now()
    const futureDoses = doses.filter(
      (dose) =>
        new Date(dose.scheduledAt).getTime() >
        now + minimumScheduleDelayMs,
    )
    const pending = await getCuidaPetPendingNotifications()
    const pendingIds = new Set(pending.map(({ id }) => id))
    const missing = futureDoses.filter(
      (dose) =>
        !pendingIds.has(
          notificationIdFromDoseScheduleId(dose.doseScheduleId),
        ),
    )

    await ensureReminderChannel()

    const chunkSize = 100
    for (let index = 0; index < missing.length; index += chunkSize) {
      await LocalNotifications.schedule({
        notifications: missing
          .slice(index, index + chunkSize)
          .map(toLocalNotification),
      })
    }

    const nextPending = await getCuidaPetPendingNotifications()

    return {
      supported: true,
      permission: status.permission,
      scheduled: missing.length,
      alreadyScheduled: futureDoses.length - missing.length,
      cancelled: 0,
      pending: nextPending.length,
    }
  },

  async cancelDoseNotification(doseScheduleId: string) {
    if (!isNativePlatform()) return 0
    const id = notificationIdFromDoseScheduleId(doseScheduleId)
    await LocalNotifications.cancel({ notifications: [{ id }] })
    return 1
  },

  async cancelTreatmentNotifications(treatmentId: string) {
    if (!isNativePlatform()) return 0
    const pending = await getCuidaPetPendingNotifications()
    return cancelNotifications(
      pending.filter(
        (notification) =>
          getExtra(notification)?.treatmentId === treatmentId,
      ),
    )
  },

  async syncPendingNotifications(
    doses: DoseNotificationInput[],
  ): Promise<NotificationScheduleResult> {
    if (!isNativePlatform()) {
      return {
        supported: false,
        permission: 'unsupported',
        scheduled: 0,
        alreadyScheduled: 0,
        cancelled: 0,
        pending: 0,
      }
    }

    const status = await this.checkPermission()
    const pending = await getCuidaPetPendingNotifications()

    if (status.permission !== 'granted') {
      return {
        supported: true,
        permission: status.permission,
        scheduled: 0,
        alreadyScheduled: 0,
        cancelled: 0,
        pending: pending.length,
      }
    }

    const now = Date.now()
    const futureDoses = doses.filter(
      (dose) =>
        new Date(dose.scheduledAt).getTime() >
        now + minimumScheduleDelayMs,
    )
    const desiredIds = new Set(
      futureDoses.map((dose) =>
        notificationIdFromDoseScheduleId(dose.doseScheduleId),
      ),
    )
    const obsolete = pending.filter(
      (notification) => !desiredIds.has(notification.id),
    )
    const cancelled = await cancelNotifications(obsolete)
    const currentIds = new Set(
      pending
        .filter((notification) => desiredIds.has(notification.id))
        .map(({ id }) => id),
    )
    const missing = futureDoses.filter(
      (dose) =>
        !currentIds.has(
          notificationIdFromDoseScheduleId(dose.doseScheduleId),
        ),
    )

    const scheduleResult = await this.scheduleTreatmentNotifications(missing)
    const nextPending = await getCuidaPetPendingNotifications()

    return {
      ...scheduleResult,
      alreadyScheduled: currentIds.size,
      cancelled,
      pending: nextPending.length,
    }
  },

  async scheduleTestNotification(): Promise<NotificationScheduleResult> {
    if (!isNativePlatform()) {
      return {
        supported: false,
        permission: 'unsupported',
        scheduled: 0,
        alreadyScheduled: 0,
        cancelled: 0,
        pending: 0,
      }
    }

    const status = await this.requestPermission()
    const pending = await getCuidaPetPendingNotifications()

    if (status.permission !== 'granted') {
      return {
        supported: true,
        permission: status.permission,
        scheduled: 0,
        alreadyScheduled: 0,
        cancelled: 0,
        pending: pending.length,
      }
    }

    await ensureReminderChannel()
    await LocalNotifications.cancel({
      notifications: [{ id: testNotificationId }],
    })
    await LocalNotifications.schedule({
      notifications: [
        {
          id: testNotificationId,
          title: 'Teste CuidaPet 🐾',
          body: 'Se você recebeu este aviso, os lembretes locais estão funcionando.',
          schedule: {
            at: new Date(Date.now() + 10_000),
            allowWhileIdle: true,
          },
          channelId: notificationChannelId,
          smallIcon: notificationIcon,
          iconColor: notificationIconColor,
          autoCancel: true,
          extra: {
            source: notificationTestSource,
          },
        },
      ],
    })

    return {
      supported: true,
      permission: status.permission,
      scheduled: 1,
      alreadyScheduled: 0,
      cancelled: 0,
      pending: (await getCuidaPetPendingNotifications()).length,
    }
  },
}
