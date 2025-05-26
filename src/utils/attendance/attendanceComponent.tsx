import MultipleButtons from "../../components/multipleButtom/MultipleButtons";
import { ButtonProps } from "../../types/MultipleBtns/MultipleButtonsTypes";
import SingleSelect from "../../components/singleSelect/selectReason";
import { DisaleButtonsState } from "../../schema/attendance/disableAllBtns";
import { useRecoilValue } from "recoil";

export default function AttendaceComponent(props: ButtonProps) {
    const disable = useRecoilValue(DisaleButtonsState)
    const { items, disabled, id, status = '', ...rest } = props;
   
    return <>
        {
            items?.length > 3 ?
                <SingleSelect
                    disabled={disable || disabled || false}
                    options={items}
                    status={status}
                    id={id}
                    {...rest}
                />
                :
                <MultipleButtons
                    id={id}
                    disabled={disable || disabled || false}
                    items={items}
                    status={status}
                    {...rest}
                />
        }
    </>
}