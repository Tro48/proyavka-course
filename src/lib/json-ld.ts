import type { Cohort } from "@/content/cohorts";
import { plans } from "@/content/plans";
import { PROGRAM_WEEKS } from "@/content/program";
import { site } from "@/content/site";

/**
 * JSON-LD `Course` с `hasCourseInstance` по каждому потоку: даты, цена и срок
 * действия предложения берутся из того же конфига, что и таймер. Разъехаться
 * им негде.
 */
export function courseJsonLd(siteUrl: string, cohorts: readonly Cohort[]): object {
  const cheapest = plans.reduce((min, plan) => Math.min(min, plan.price), Infinity);

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: site.name,
    description: site.description,
    inLanguage: "ru",
    url: siteUrl,
    provider: {
      "@type": "Organization",
      name: site.name,
      url: siteUrl,
    },
    offers: {
      "@type": "Offer",
      category: "Paid",
      price: cheapest,
      priceCurrency: "RUB",
    },
    hasCourseInstance: cohorts.map((cohort) => ({
      "@type": "CourseInstance",
      name: `${site.name}: поток ${cohort.number}`,
      courseMode: "Onsite",
      courseWorkload: `PT${PROGRAM_WEEKS * 3}H`,
      startDate: cohort.startsAt,
      endDate: cohort.endsAt,
      maximumAttendeeCapacity: cohort.seatsTotal,
      location: {
        "@type": "Place",
        name: `Лаборатория «${site.name}»`,
        address: {
          "@type": "PostalAddress",
          streetAddress: "наб. Обводного канала, 74А",
          addressLocality: "Санкт-Петербург",
          addressCountry: "RU",
        },
      },
      courseSchedule: {
        "@type": "Schedule",
        repeatFrequency: "Weekly",
        repeatCount: PROGRAM_WEEKS,
        byDay: "https://schema.org/Tuesday",
        startTime: "19:00:00",
        duration: "PT3H",
        scheduleTimezone: "Europe/Moscow",
      },
      offers: {
        "@type": "Offer",
        category: "Paid",
        price: cheapest,
        priceCurrency: "RUB",
        availability:
          cohort.seatsLeft > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/SoldOut",
        validThrough: cohort.enrollmentClosesAt,
        url: siteUrl,
      },
    })),
  };
}
