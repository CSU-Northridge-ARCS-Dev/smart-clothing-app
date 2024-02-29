import DateRangePicker from "./DateRangePicker";
import { DatePicker } from "./DatePicker";

const BaseCalendar = ({ dateType, onSuccess }) => {
    return (
        <>
            {dateType === 'period' && (
                <DateRangePicker onSuccess={onSuccess} />
            )}
            {dateType === 'single' && (<DatePicker />)}
        </>
    );
};

export default BaseCalendar;