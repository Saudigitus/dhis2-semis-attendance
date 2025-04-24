import MultipleButtons from "src/components/multipleButtom/MultipleButtons";
import { ButtonProps } from "../../types/MultipleBtns/MultipleButtonsTypes";
import SingleSelect from "../../components/singleSelect/selectReason";

export default function AttendaceComponent(props: ButtonProps) {
    const { items, disabled, id, selectedState, setSelectedState } = props;

    return <>
        {
            items?.length > 3 ? <SingleSelect disabled={disabled ?? false} options={items} selectedState={selectedState} setSelectedState={setSelectedState} />
                : <MultipleButtons id={id} disabled={disabled} items={items} selectedState={selectedState} setSelectedState={setSelectedState} />
        }
    </>
}