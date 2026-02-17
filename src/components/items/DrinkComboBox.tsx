"use client";

import * as React from "react";
import { ItemComboBox, buildItemOptions } from "./ItemComboBox";

interface DrinkComboBoxProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function DrinkComboBox({
    value,
    onChange,
    placeholder = "Select drink...",
    disabled = false,
}: DrinkComboBoxProps) {
    // Build options inside component after data is loaded
    const drinkOptions = React.useMemo(
        () => buildItemOptions((item) => item.categoryHrid === "/item_categories/drink"),
        [],
    );

    return (
        <ItemComboBox
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            items={drinkOptions}
            disabled={disabled}
        />
    );
}
