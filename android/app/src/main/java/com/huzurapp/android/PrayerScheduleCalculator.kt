package com.huzurapp.android

import java.util.Calendar

data class PrayerScheduleSlot(
    val prayerKey: String,
    val dayOffset: Int,
    val triggerAtMillis: Long,
    val timeLabel: String
)

object PrayerScheduleCalculator {
    val prayerKeys = listOf("Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha")

    @JvmStatic
    fun buildUpcomingSlots(
        nowMillis: Long,
        fallbackTimings: Map<String, String>,
        scheduleWindowDays: Int = 2,
        resolveTimingsForDayOffset: (Int) -> Map<String, String>?
    ): List<PrayerScheduleSlot> {
        val slots = mutableListOf<PrayerScheduleSlot>()

        for (dayOffset in 0 until scheduleWindowDays) {
            val dayTimings = resolveTimingsForDayOffset(dayOffset).orIfEmpty(fallbackTimings)

            for (prayerKey in prayerKeys) {
                val timeLabel = dayTimings[prayerKey] ?: continue
                val triggerAtMillis = parseTimeToMillis(nowMillis, timeLabel, dayOffset) ?: continue
                if (triggerAtMillis <= nowMillis) continue

                slots += PrayerScheduleSlot(
                    prayerKey = prayerKey,
                    dayOffset = dayOffset,
                    triggerAtMillis = triggerAtMillis,
                    timeLabel = timeLabel
                )
            }
        }

        return slots.sortedBy { it.triggerAtMillis }
    }

    @JvmStatic
    fun parseTimeToMillis(baseMillis: Long, timeLabel: String, dayOffset: Int): Long? {
        return try {
            val cleanTime = timeLabel.split(" ")[0].trim()
            val parts = cleanTime.split(":")
            if (parts.size < 2) return null

            val calendar = Calendar.getInstance().apply {
                timeInMillis = baseMillis
                add(Calendar.DAY_OF_YEAR, dayOffset)
                set(Calendar.HOUR_OF_DAY, parts[0].toInt())
                set(Calendar.MINUTE, parts[1].toInt())
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }

            calendar.timeInMillis
        } catch (_: Exception) {
            null
        }
    }
}

private fun <K, V> Map<K, V>?.orIfEmpty(fallback: Map<K, V>): Map<K, V> {
    if (this == null || this.isEmpty()) {
        return fallback
    }
    return this
}
