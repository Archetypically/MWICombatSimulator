"use client";

import * as React from "react";
import { ItemComboBox, buildItemOptions } from "./ItemComboBox";

interface FoodComboBoxProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function FoodComboBox({ value, onChange, placeholder = "Select food...", disabled = false }: FoodComboBoxProps) {
    // Build options inside component after data is loaded
    const foodOptions = React.useMemo(
        () => buildItemOptions((item) => item.categoryHrid === "/item_categories/food"),
        [],
    );

    return (
        <ItemComboBox
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            items={foodOptions}
            disabled={disabled}
        />
    );
}
