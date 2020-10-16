import LitePicker from 'litepicker'
import NoCssLP from 'litepicker/dist/js/main.nocss'
import * as React from 'react'
import ReactDOM from 'react-dom'

export type DateExp = Date | number | String
export type DateRange = [DateExp, DateExp]
export interface RangeArray extends Array<DateRange> {}
export interface DateArray extends Array<DateExp> {}

export type LitePickerType = typeof LitePicker

export interface LitePickerBaseProps {
  rootElement?: React.MutableRefObject<HTMLElement | null | undefined>
  endRootElement?: React.MutableRefObject<HTMLElement | null | undefined>
  firstDay?: number
  format?: string
  lang?: string
  numberOfMonths?: number
  numberOfColumns?: number
  minDate?: DateExp
  maxDate?: DateExp
  minDays?: number
  maxDays?: number
  selectForward?: boolean
  splitView?: boolean
  inlineMode?: boolean
  singleMode?: boolean
  autoApply?: boolean
  allowRepick?: boolean
  showWeekNumbers?: boolean
  showTooltip?: boolean
  hotelMode?: boolean
  disableWeekends?: boolean
  scrollToDate?: boolean
  mobileFriendly?: boolean
  useResetBtn?: boolean
  autoRefresh?: boolean
  moveByOneMonth?: boolean
  lockDaysFormat?: string
  disallowLockDaysInRange?: boolean
  lockDaysInclusivity?: string
  bookedDaysFormat?: string
  disallowBookedDaysInRange?: boolean
  bookedDaysInclusivity?: string
  anyBookedDaysAsCheckout?: boolean
  highlightedDaysFormat?: string
  moduleRanges?: boolean | Object
  dropdowns?: {
    minYear?: number
    maxYear?: number
    months?: 'asc' | 'desc'
    years?: 'asc' | 'desc'
  }
  ApplyButton?: React.ReactNode
  CancelButton?: React.ReactNode
  PreviousMonthButton?: React.ReactNode
  NextMonthButton?: React.ReactNode
  ResetButton?: React.ReactNode
  onReset?: () => void
  onShow?: () => void
  onHide?: () => void
  onSelect?: (date1: Date, date2?: Date) => void
  onError?: (err: Error) => void
  onRender?: (elm: Element) => void
  onRenderDay?: (elm: Element) => void
  onChangeMonth?: (date: Date, idx: number) => void
  onChangeYear?: (date: Date, idx: number) => void
  onDayHover?: (date: Date, attributes: string[]) => void
  onShowTooltip?: () => void
  noCss?: boolean
  children?: React.ForwardRefExoticComponent<any>
}

export interface LitePickerPropsWithRanges {
  moduleRanges: Object
  lockDays?: RangeArray
  bookedDays?: RangeArray
}
export interface LitePickerPropsWithoutRanges {
  moduleRanges: undefined
  lockDays?: DateArray
  highlightedDays?: DateArray
}
export type LitePickerProps = LitePickerBaseProps &
  (LitePickerPropsWithRanges | LitePickerPropsWithoutRanges)

const LP = React.forwardRef<typeof LitePicker, LitePickerProps>(
  (options: LitePickerProps, ref) => {
    const {
      string: applyString,
      getPortal: getApplyPortal
    } = useStringAndPortal(options.ApplyButton)
    const {
      string: cancelString,
      getPortal: getCancelPortal
    } = useStringAndPortal(options.CancelButton)
    const { string: prevString, getPortal: getPrevPortal } = useStringAndPortal(
      options.PreviousMonthButton
    )
    const { string: nextString, getPortal: getNextPortal } = useStringAndPortal(
      options.NextMonthButton
    )
    const {
      string: resetString,
      getPortal: getResetPortal
    } = useStringAndPortal(options.ResetButton)

    const element = options.rootElement?.current
    const endElement = options.endRootElement?.current
    const noCss = options.noCss

    React.useEffect(() => {
      if (element) {
        const LitePickConstructor = noCss ? NoCssLP : LitePicker
        const lp = new LitePickConstructor({
          ...options,
          element,
          endElement,
          resetBtnCallback: options.onReset,
          buttonText: {
            ...(applyString ? { apply: applyString } : {}),
            ...(cancelString ? { cancel: cancelString } : {}),
            ...(prevString ? { previousMonth: prevString } : {}),
            ...(nextString ? { nextMonth: nextString } : {}),
            ...(resetString ? { reset: resetString } : {})
          }
        })
        if (typeof ref === 'function') {
          ref(lp)
        } else if (ref) {
          ref.current = lp
        }

        return () => {
          if (typeof ref === 'function') ref(null)
          else if (ref) {
            ref.current = null
          }
          lp.destroy()
        }
      }
      return () => {}
    }, [
      element,
      endElement,
      noCss,
      applyString,
      cancelString,
      prevString,
      nextString,
      resetString
    ])

    return (
      <>
        {getApplyPortal ? getApplyPortal() : null}
        {getCancelPortal ? getCancelPortal() : null}
        {getPrevPortal ? getPrevPortal() : null}
        {getNextPortal ? getNextPortal() : null}
        {getResetPortal ? getResetPortal() : null}
      </>
    )
  }
)

type DomRenderable = boolean | string | number | null | undefined

let PortalCount = 0
const idState = () => `react-LitePicker-portal-wrapper-${PortalCount++}`

function useStringAndPortal(
  node: React.ReactNode
): { string: DomRenderable; getPortal?: () => React.ReactPortal | null } {
  const [id] = React.useState(idState)

  return React.useMemo(() => {
    switch (typeof node) {
      case 'function':
      case 'object':
        return {
          string: `<div id="${id}"></div>`,
          getPortal: () => {
            const root = document.getElementById(id)
            if (!root) return null
            return ReactDOM.createPortal(node, root)
          }
        }
      default:
        return { string: node as DomRenderable }
    }
  }, [id, node])
}

export default LP
