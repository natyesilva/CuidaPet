import {
  LocalNotifications,
  type PendingLocalNotificationSchema,
} from '@capacitor/local-notifications'
import { Capacitor, type PermissionState } from '@capacitor/core'

const notificationSource = 'cuidapet-dose-reminder'
const notificationTestSource = 'cuidapet-test-notification'
const notificationChannelId = 'treatment-reminders'
const notificationIcon = 'ic_stat_cuidapet'
const notificationIconColor = '#22C7B8'
const testNotificationId = 762307
const minimumScheduleDelayMs = 1_000
const scheduleChunkSize = 100

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
  exactAlarm: NotificationStatus['exactAlarm']
  scheduled: number
  alreadyScheduled: number
  cancelled: number
  pending: number
}

type NotificationExtra = {
  source?: string
  notificationKind?: 'treatment-dose' | 'test'
  doseScheduleId?: string
  treatmentId?: string
  petId?: string
  scheduledAt?: string
}

type AndroidNotificationIdentity = Pick<
  DoseNotificationInput,
  'doseScheduleId' | 'treatmentId' | 'petId' | 'scheduledAt'
>

function isNativePlatform() {
  return Capacitor.isNativePlatform()
}

function isAndroid() {
  return Capacitor.getPlatform() === 'android'
}

function debugNotification(message: string, data?: unknown) {
  if (!import.meta.env.DEV) return
  if (data === undefined) {
    console.info(`[CuidaPet notifications] ${message}`)
    return
  }
  console.info(`[CuidaPet notifications] ${message}`, data)
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

function baseScheduleResult(
  overrides: Partial<NotificationScheduleResult> = {},
): NotificationScheduleResult {
  return {
    supported: false,
    permission: 'unsupported',
    exactAlarm: 'unsupported',
    scheduled: 0,
    alreadyScheduled: 0,
    cancelled: 0,
    pending: 0,
    ...overrides,
  }
}

function hashToAndroidNotificationId(value: string) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0) & 0x7fffffff || 1
}

export function notificationIdFromDoseScheduleId(doseScheduleId: string) {
  return hashToAndroidNotificationId(doseScheduleId)
}

export function notificationIdFromDoseNotification(
  input: AndroidNotificationIdentity,
) {
  return hashToAndroidNotificationId(
    [
      'treatment',
      input.treatmentId,
      'pet',
      input.petId,
      'dose',
      input.doseScheduleId,
      'at',
      input.scheduledAt,
    ].join(':'),
  )
}

function toLocalNotification(input: DoseNotificationInput) {
  const body = `${input.petName}: ${input.medicationName} - ${input.dose} ${input.doseUnit}`

  return {
    id: notificationIdFromDoseNotification(input),
    title: 'Hora do remédio 🐾',
    body,
    largeBody: body,
    summaryText: 'Lembrete de tratamento do CuidaPet',
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
      notificationKind: 'treatment-dose',
      doseScheduleId: input.doseScheduleId,
      treatmentId: input.treatmentId,
      petId: input.petId,
      scheduledAt: input.scheduledAt,
    },
  }
}

async function ensureReminderChannel() {
  if (!isNativePlatform() || !isAndroid()) return

  try {
    await LocalNotifications.createChannel({
      id: notificationChannelId,
      name: 'Lembretes de tratamento',
      description:
        'Notificações de horários de remédios e tratamentos dos pets.',
      importance: 4,
      visibility: 1,
      lights: true,
      lightColor: notificationIconColor,
      vibration: true,
    })
    debugNotification('Canal Android verificado/criado', notificationChannelId)
  } catch (error) {
    debugNotification('Falha ao criar/verificar canal Android', error)
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
  debugNotification('Notificações canceladas', {
    count: notifications.length,
    ids: notifications.map(({ id }) => id),
  })
  return notifications.length
}

function getFutureDoses(doses: DoseNotificationInput[]) {
  const now = Date.now()
  return doses.filter((dose) => {
    const scheduledAt = new Date(dose.scheduledAt).getTime()
    return Number.isFinite(scheduledAt) && scheduledAt > now + minimumScheduleDelayMs
  })
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

    if (isAndroid()) {
      try {
        const exactStatus =
          await LocalNotifications.checkExactNotificationSetting()
        exactAlarm = exactStatus.exact_alarm
      } catch (error) {
        debugNotification(
          'checkExactNotificationSetting indisponível; assumindo concedido',
          error,
        )
        exactAlarm = 'granted'
      }
    }

    const status = {
      supported: true,
      permission: permission.display,
      exactAlarm,
    }
    debugNotification('Status de permissão consultado', status)
    return status
  },

  async requestPermission(): Promise<NotificationStatus> {
    if (!isNativePlatform()) return this.checkPermission()

    await LocalNotifications.requestPermissions()
    const status = await this.checkPermission()
    debugNotification('Permissão de notificação solicitada', status)
    return status
  },

  async requestExactAlarmPermission(): Promise<NotificationStatus> {
    if (!isNativePlatform() || !isAndroid()) {
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
    if (!isNativePlatform()) return baseScheduleResult()

    const status = options.requestPermission
      ? await this.requestPermission()
      : await this.checkPermission()
    const pending = await getCuidaPetPendingNotifications()

    if (status.permission !== 'granted') {
      return baseScheduleResult({
        supported: true,
        permission: status.permission,
        exactAlarm: status.exactAlarm,
        pending: pending.length,
      })
    }

    const futureDoses = getFutureDoses(doses)
    const pendingIds = new Set(pending.map(({ id }) => id))
    const missing = futureDoses.filter(
      (dose) => !pendingIds.has(notificationIdFromDoseNotification(dose)),
    )

    debugNotification('Preparando agendamento de doses', {
      input: doses.length,
      future: futureDoses.length,
      missing: missing.length,
      alreadyScheduled: futureDoses.length - missing.length,
      exactAlarm: status.exactAlarm,
    })

    await ensureReminderChannel()

    for (let index = 0; index < missing.length; index += scheduleChunkSize) {
      const chunk = missing.slice(index, index + scheduleChunkSize)
      const notifications = chunk.map(toLocalNotification)
      debugNotification('Agendando lote de notificações', {
        count: notifications.length,
        notifications: notifications.map((notification) => ({
          id: notification.id,
          at: notification.schedule.at.toISOString(),
          treatmentId: notification.extra.treatmentId,
          doseScheduleId: notification.extra.doseScheduleId,
        })),
      })
      await LocalNotifications.schedule({ notifications })
    }

    const nextPending = await getCuidaPetPendingNotifications()
    debugNotification('Agendamento concluído', {
      scheduled: missing.length,
      pending: nextPending.length,
    })

    return baseScheduleResult({
      supported: true,
      permission: status.permission,
      exactAlarm: status.exactAlarm,
      scheduled: missing.length,
      alreadyScheduled: futureDoses.length - missing.length,
      pending: nextPending.length,
    })
  },

  async cancelDoseNotification(doseScheduleId: string) {
    if (!isNativePlatform()) return 0

    const pending = await getCuidaPetPendingNotifications()
    const byExtra = pending.filter(
      (notification) =>
        getExtra(notification)?.doseScheduleId === doseScheduleId,
    )
    const cancelledByExtra = await cancelNotifications(byExtra)
    if (cancelledByExtra > 0) return cancelledByExtra

    const legacyId = notificationIdFromDoseScheduleId(doseScheduleId)
    await LocalNotifications.cancel({ notifications: [{ id: legacyId }] })
    debugNotification('Cancelamento por ID legado de dose', {
      doseScheduleId,
      id: legacyId,
    })
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
    if (!isNativePlatform()) return baseScheduleResult()

    const status = await this.checkPermission()
    const pending = await getCuidaPetPendingNotifications()

    if (status.permission !== 'granted') {
      return baseScheduleResult({
        supported: true,
        permission: status.permission,
        exactAlarm: status.exactAlarm,
        pending: pending.length,
      })
    }

    const futureDoses = getFutureDoses(doses)
    const desiredIds = new Set(
      futureDoses.map((dose) => notificationIdFromDoseNotification(dose)),
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
      (dose) => !currentIds.has(notificationIdFromDoseNotification(dose)),
    )

    debugNotification('Sincronizando lembretes pendentes', {
      future: futureDoses.length,
      pendingBefore: pending.length,
      obsolete: obsolete.length,
      missing: missing.length,
    })

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
    if (!isNativePlatform()) return baseScheduleResult()

    const status = await this.requestPermission()
    const pending = await getCuidaPetPendingNotifications()

    if (status.permission !== 'granted') {
      return baseScheduleResult({
        supported: true,
        permission: status.permission,
        exactAlarm: status.exactAlarm,
        pending: pending.length,
      })
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
            at: new Date(Date.now() + 60_000),
            allowWhileIdle: true,
          },
          channelId: notificationChannelId,
          smallIcon: notificationIcon,
          iconColor: notificationIconColor,
          autoCancel: true,
          extra: {
            source: notificationTestSource,
            notificationKind: 'test',
          },
        },
      ],
    })

    const nextPending = await getCuidaPetPendingNotifications()
    debugNotification('Notificação de teste agendada', {
      id: testNotificationId,
      pending: nextPending.length,
    })

    return baseScheduleResult({
      supported: true,
      permission: status.permission,
      exactAlarm: status.exactAlarm,
      scheduled: 1,
      pending: nextPending.length,
    })
  },
}
