package com.huzurapp.android

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.util.Calendar

class PrayerScheduleCalculatorTest {

    @Test
    fun buildUpcomingSlots_includesTomorrowFajrWhenTodayIsPastNoon() {
        val nowMillis = Calendar.getInstance().apply {
            set(2026, Calendar.MARCH, 15, 14, 30, 0)
            set(Calendar.MILLISECOND, 0)
        }.timeInMillis

        val timings = mapOf(
            "Fajr" to "05:10",
            "Sunrise" to "06:35",
            "Dhuhr" to "12:25",
            "Asr" to "15:45",
            "Maghrib" to "18:20",
            "Isha" to "19:50"
        )

        val slots = PrayerScheduleCalculator.buildUpcomingSlots(
            nowMillis = nowMillis,
            fallbackTimings = timings,
            scheduleWindowDays = 2
        ) { timings }

        assertFalse(slots.any { it.prayerKey == "Fajr" && it.dayOffset == 0 })
        assertTrue(slots.any { it.prayerKey == "Fajr" && it.dayOffset == 1 })
        assertTrue(slots.any { it.prayerKey == "Asr" && it.dayOffset == 0 })
    }

    @Test
    fun buildUpcomingSlots_usesFallbackWhenDailyResolverHasNoData() {
        val nowMillis = Calendar.getInstance().apply {
            set(2026, Calendar.MARCH, 15, 4, 30, 0)
            set(Calendar.MILLISECOND, 0)
        }.timeInMillis

        val fallbackTimings = mapOf(
            "Fajr" to "05:00",
            "Dhuhr" to "12:20",
            "Asr" to "15:30",
            "Maghrib" to "18:10",
            "Isha" to "19:40"
        )

        val slots = PrayerScheduleCalculator.buildUpcomingSlots(
            nowMillis = nowMillis,
            fallbackTimings = fallbackTimings,
            scheduleWindowDays = 2
        ) { emptyMap() }

        assertEquals("Fajr", slots.first().prayerKey)
        assertEquals(0, slots.first().dayOffset)
    }

    @Test
    fun parseTimeToMillis_returnsNullForInvalidInput() {
        val nowMillis = System.currentTimeMillis()

        assertEquals(null, PrayerScheduleCalculator.parseTimeToMillis(nowMillis, "invalid", 0))
        assertEquals(null, PrayerScheduleCalculator.parseTimeToMillis(nowMillis, "", 1))
    }
}
