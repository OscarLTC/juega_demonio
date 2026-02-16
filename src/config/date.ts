import { setDefaultOptions } from "date-fns";
import { es } from "date-fns/locale";

setDefaultOptions({
  locale: es,
  weekStartsOn: 1,
  firstWeekContainsDate: 4,
});
