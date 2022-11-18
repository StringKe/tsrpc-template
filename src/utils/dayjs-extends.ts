import dayjs from 'dayjs'
import zhCN from 'dayjs/locale/zh-cn'
import dayjsAdvanceFormat from 'dayjs/plugin/advancedFormat'
import dayjsArraySupport from 'dayjs/plugin/arraySupport'
import dayjsBadMutable from 'dayjs/plugin/badMutable'
import dayjsBuddhistEra from 'dayjs/plugin/buddhistEra'
import dayjsCalendar from 'dayjs/plugin/calendar'
import dayjsCustomParseFormat from 'dayjs/plugin/customParseFormat'
import dayjsDayOfYear from 'dayjs/plugin/dayOfYear'
import dayjsDuration from 'dayjs/plugin/duration'
import dayjsIsBetween from 'dayjs/plugin/isBetween'
import dayjsIsLeapYear from 'dayjs/plugin/isLeapYear'
import dayjsIsMoment from 'dayjs/plugin/isMoment'
import dayjsISOWeek from 'dayjs/plugin/isoWeek'
import dayjsIsoWeeksInYear from 'dayjs/plugin/isoWeeksInYear'
import dayjsIsSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import dayjsIsSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import dayjsIsToday from 'dayjs/plugin/isToday'
import dayjsIsTomorrow from 'dayjs/plugin/isTomorrow'
import dayjsIsYesterday from 'dayjs/plugin/isYesterday'
import dayjsLocalData from 'dayjs/plugin/localeData'
import dayjsLocalizedFormat from 'dayjs/plugin/localizedFormat'
import dayjsMinMax from 'dayjs/plugin/minMax'
import dayjsObjectSupport from 'dayjs/plugin/objectSupport'
import dayjsPluralGetSet from 'dayjs/plugin/pluralGetSet'
import dayjsPreParsePostFormat from 'dayjs/plugin/preParsePostFormat'
import dayjsQuarterOfYear from 'dayjs/plugin/quarterOfYear'
import dayjsRelativeTime from 'dayjs/plugin/relativeTime'
import dayjsTimezone from 'dayjs/plugin/timezone'
import dayjsToArray from 'dayjs/plugin/toArray'
import dayjsToObject from 'dayjs/plugin/toObject'
import dayjsUpdateLocal from 'dayjs/plugin/updateLocale'
import dayjsUTC from 'dayjs/plugin/utc'
import dayjsWeekday from 'dayjs/plugin/weekday'
import dayjsWeekOfYear from 'dayjs/plugin/weekOfYear'
import dayjsWeekYear from 'dayjs/plugin/weekYear'

dayjs.extend(dayjsAdvanceFormat)
dayjs.extend(dayjsArraySupport)
dayjs.extend(dayjsBadMutable)
dayjs.extend(dayjsBuddhistEra)
dayjs.extend(dayjsCalendar)
dayjs.extend(dayjsCustomParseFormat)
dayjs.extend(dayjsDayOfYear)
dayjs.extend(dayjsDuration)
dayjs.extend(dayjsIsBetween)
dayjs.extend(dayjsIsLeapYear)
dayjs.extend(dayjsIsMoment)
dayjs.extend(dayjsIsSameOrAfter)
dayjs.extend(dayjsIsSameOrBefore)
dayjs.extend(dayjsIsToday)
dayjs.extend(dayjsIsTomorrow)
dayjs.extend(dayjsIsYesterday)
dayjs.extend(dayjsISOWeek)
dayjs.extend(dayjsIsoWeeksInYear)
dayjs.extend(dayjsLocalData)
dayjs.extend(dayjsLocalizedFormat)
dayjs.extend(dayjsMinMax)
dayjs.extend(dayjsObjectSupport)
dayjs.extend(dayjsPluralGetSet)
dayjs.extend(dayjsPreParsePostFormat)
dayjs.extend(dayjsQuarterOfYear)
dayjs.extend(dayjsRelativeTime)
dayjs.extend(dayjsTimezone)
dayjs.extend(dayjsToArray)
dayjs.extend(dayjsToObject)
dayjs.extend(dayjsUpdateLocal)
dayjs.extend(dayjsUTC)
dayjs.extend(dayjsWeekOfYear)
dayjs.extend(dayjsWeekYear)
dayjs.extend(dayjsWeekday)

dayjs.locale(zhCN)
