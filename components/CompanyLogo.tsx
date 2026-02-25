"use client";

import React from "react";
import { getLogoUrl } from "../utils/logo";

interface CompanyLogoProps {
    ticker: string;
    className?: string;
}

export default function CompanyLogo({ ticker, className = "w-12 h-12 rounded-full object-contain bg-white p-1" }: CompanyLogoProps) {
    const imgSrc = getLogoUrl(ticker);

    return (
        <img
            src={imgSrc}
            alt={`${ticker} logo`}
            className={className}
        />
    );
}
