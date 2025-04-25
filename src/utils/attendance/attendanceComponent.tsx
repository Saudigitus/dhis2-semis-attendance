import MultipleButtons from "../../components/multipleButtom/MultipleButtons";
import { ButtonProps } from "../../types/MultipleBtns/MultipleButtonsTypes";
import SingleSelect from "../../components/singleSelect/selectReason";

export default function AttendaceComponent(props: ButtonProps) {
    const { items, disabled, id, status = '', ...rest } = props;

    return <>
        {
            items?.length > 3 ?
                <SingleSelect
                    disabled={disabled ?? false}
                    options={items}
                    status={status}
                    id={id}
                    {...rest}
                />
                :
                <MultipleButtons
                    id={id}
                    disabled={disabled}
                    items={items}
                    status={status}
                    {...rest}
                />
        }
    </>
}