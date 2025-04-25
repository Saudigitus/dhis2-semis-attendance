import React from "react";
import styles from "./button.module.css";
import {ButtonGroup, Button} from "@material-ui/core";
import classNames from "classnames";
import { ButtonProps } from "../../types/MultipleBtns/MultipleButtonsTypes";

export default function MultipleButtons(props: ButtonProps) {
    const {
        items,
        selectedState,
        setSelectedState,
        disabled
    } = props;

    return (
        <ButtonGroup color="primary">
            {items?.map((item) => (
                <Button disabled={disabled} key={item?.code}
                        className={classNames(
                            selectedState === item?.code && styles["active-button"],
                            styles.label
                        )}
                        onClick={() => { setSelectedState(item.code, item.type) }} >
                    <span className={styles.simpleButtonLabel}>{item.Component}</span>
                </Button>
            ))}
        </ButtonGroup>
    );
}
